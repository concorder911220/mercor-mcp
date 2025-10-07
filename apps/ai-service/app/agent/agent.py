

import os
from typing import Any, AsyncGenerator, List, Dict, Optional
from datetime import datetime, timezone
import json
import uuid
import logging

from app.agent.exemplar_provider import ExemplarProvider, ExemplarRequest
from app.config import settings

from ..anthropic_client import AnthropicClient
from rialto_shared_types.events import ChatRequestEvent, ChatResponseEvent, ErrorEvent, Event, ToolSelection, ToolOutput
from rialto_shared_types.remote_file import RemoteFile
from .tool_gateway import ToolGateway
from .event_gateway import EventGateway, EventHistoryResponse, EventHistoryRequest
from .agent_config import AgentConfig
from .prompt_constructor import PromptConstructor
from ..agent.inference_parsers.tool_call_parser import ToolCallParser
from ..agent.inference_parsers.response_fragments import CompleteTextResponseFragment, ResponseFragment, PartialTextResponseFragment, ToolCallResponseFragment, LifecycleCommandResponseFragment
from ..agent.inference_parsers.streaming_response_fragment_parser import StreamingResponseFragmentParser
from .model.lifecycle_command import LifecycleCommand
from rialto_shared_types.agent_interface import AgentInboundRequest, AgentOutboundFragment, AgentOutboundFragmentType
from ..agent.inference_parsers.lifecycle_command_parser import LifecycleCommandParser
from ..agent.inference_parsers.nonstreaming_response_fragment_parser import NonStreamingResponseFragmentParser

logger = logging.getLogger(__name__)

class Agent:

    RESPONSE_PREFILL = "<response_fragment"

    def __init__(self, 
        anthropic_client: AnthropicClient, 
        tool_gateway: ToolGateway, 
        event_gateway: EventGateway, 
        exemplar_provider: ExemplarProvider,
        prompt_constructor: PromptConstructor,
        agent_config: AgentConfig
    ):
        self.anthropic_client = anthropic_client
        self.tool_gateway = tool_gateway
        self.event_gateway = event_gateway
        self.exemplar_provider = exemplar_provider
        self.prompt_constructor = prompt_constructor
        self.agent_config = agent_config
        self.tool_call_parser = ToolCallParser()
        self.lifecycle_command_parser = LifecycleCommandParser()
        self.nonstreaming_response_fragment_parser = NonStreamingResponseFragmentParser()
    
    def _construct_prompt(self, user_id: str, tools, current_event, exemplars, event_history):
        """Construct prompt using the prompt constructor."""
        from datetime import datetime
        
        # Get current date/time
        today = datetime.now().strftime("%Y-%m-%d")
        time = datetime.now().strftime("%H:%M:%S")
        
        # Delegate prompt construction to the prompt constructor
        return self.prompt_constructor.construct_prompt_from_dependencies(
            user_id=user_id,
            today=today,
            time=time,
            tools=tools,
            exemplars=exemplars,
            event_history=event_history,
            current_event=current_event
        )

    def _log_inference_output(self, cumulative_inference_output: str):
        if settings.debug:
            os.makedirs("/tmp/inference_traces/", exist_ok=True)
            timestamp = datetime.now().isoformat()
            file_path = f"/tmp/inference_traces/inference_output_{timestamp}.txt"
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(cumulative_inference_output)
    
    async def run(self, agent_request: AgentInboundRequest) -> AsyncGenerator[AgentOutboundFragment, None]:
        # Fetch History
        response: EventHistoryResponse = self.event_gateway.get_event_history(EventHistoryRequest(agent_execution_id=agent_request.execution_id))
        event_history: List[Event] = response.events
        running_history: List[Event] = event_history

        # Handle attachments based on event type
        attachments: List[RemoteFile] = []
        if isinstance(agent_request.event, ChatRequestEvent):
            attachments = agent_request.event.files
        # DocumentSaveEvent and other event types don't have files, so no attachments

        # TODO Fetch Company Context (instructions re: how company does things)  

        # TODO Fetch Employee Context (instructions re: how employee does things)

        # TODO Fetch Client Context (instructions re: how client does/expects things)

        # Fetch Tools and filter by allowed namespaces
        all_tools = self.tool_gateway.list_tools()
        tools = [tool for tool in all_tools if tool.namespace in self.agent_config.allowed_tool_namespaces]

        # Fetch Exemplars
        exemplar_request = ExemplarRequest(agent_execution_id=agent_request.execution_id)
        exemplar_response = self.exemplar_provider.get_exemplars(exemplar_request)

        max_iterations = 10
        iteration_count = 0
        lifecycle_command = None

        # TODO implement task queuing
        while lifecycle_command != LifecycleCommand.DISENGAGE and lifecycle_command != LifecycleCommand.BLOCKED_ON_FURTHER_INPUT and iteration_count < max_iterations:
            yield AgentOutboundFragment(type=AgentOutboundFragmentType.DEBUG_ITERATION_COUNTER, content=f"{iteration_count}")
            

            # Construct Prompt with only required dependencies
            prompt = self._construct_prompt(
                user_id=agent_request.user_id,
                tools=tools,
                current_event=agent_request.event,
                exemplars=exemplar_response.exemplars,
                event_history=event_history
            )
            yield AgentOutboundFragment(type=AgentOutboundFragmentType.DEBUG_PROMPT, content=prompt)

            cumulative_inference_output = ""
            
            # Stateful parser, must re-instantiate for each inference pass.
            streaming_response_fragment_parser = StreamingResponseFragmentParser()
            try:
                # Run Inference
                async for chunk in self.anthropic_client.stream_chat(
                    query=prompt,
                    messages=[], # We're representing history in the event history section of the prompt, not as prior messages
                    attachments=attachments,
                    response_prefill=self.RESPONSE_PREFILL
                ):
                    # Parse Streaming Inference Output & act on it
                    data = json.loads(chunk)
                    if data["type"] == "content_delta":
                        content_chunk = data['content']
                        cumulative_inference_output += content_chunk

                        response_fragments: List[ResponseFragment] = streaming_response_fragment_parser.process_chunk(content_chunk)

                        # Parse fragments and act on them here.
                        if response_fragments:
                            for response_fragment in response_fragments:

                                if isinstance(response_fragment, PartialTextResponseFragment):
                                    yield AgentOutboundFragment(type=AgentOutboundFragmentType.TEXT_FRAGMENT, content=response_fragment.raw_content)
                                elif isinstance(response_fragment, CompleteTextResponseFragment):
                                    chat_response_event = ChatResponseEvent(
                                            id=f"rialto1.chat-response.{str(uuid.uuid4())}",
                                            timestamp=datetime.now(timezone.utc),
                                            message=response_fragment.raw_content
                                        )
                                    yield AgentOutboundFragment(type=AgentOutboundFragmentType.TEXT_MESSAGE, content=chat_response_event.to_json())
                                    running_history.append(chat_response_event)
                                elif isinstance(response_fragment, ToolCallResponseFragment):
                                    try:
                                        tool_selection: ToolSelection = self.tool_call_parser.parse(response_fragment.raw_content)
                                    except Exception as e:
                                        logger.error(f"Tool call error: {str(e)}")
                                        error_event = ErrorEvent(
                                            id=f"rialto1.error.{str(uuid.uuid4())}",
                                            timestamp=datetime.now(timezone.utc),
                                            error_description=str(e)
                                        )
                                        # Add to history to allow agent to recover, don't yield an error fragment
                                        running_history.append(error_event)
                                        continue
                                    yield AgentOutboundFragment(type=AgentOutboundFragmentType.DEBUG_TOOL_CALL, content=tool_selection.to_json())
                                    running_history.append(tool_selection)
                                    tool_result: Optional[Dict[str, Any]] = None
                                    tool_error: Optional[str] = None
                                    try:
                                        tool_result: Dict[str, Any] = self.tool_gateway.tool_call(tool_selection.tool_namespace, tool_selection.tool_name, tool_selection.tool_args)
                                    except Exception as e:
                                        logger.error(f"Tool call error: {str(e)}")
                                        tool_error = str(e)
                                    tool_output = ToolOutput(
                                                id=f"rialto1.tool-output.{str(uuid.uuid4())}",
                                                timestamp=datetime.now(timezone.utc),
                                                tool_namespace=tool_selection.tool_namespace,
                                                tool_name=tool_selection.tool_name,
                                                output=tool_result,
                                                error=tool_error
                                            )
                                    yield AgentOutboundFragment(type=AgentOutboundFragmentType.DEBUG_TOOL_RESULT, content=tool_output.to_json())
                                    running_history.append(tool_output)
                                elif isinstance(response_fragment, LifecycleCommandResponseFragment):
                                    lifecycle_command: LifecycleCommand = self.lifecycle_command_parser.parse(response_fragment.raw_content)
                                    yield AgentOutboundFragment(type=AgentOutboundFragmentType.DEBUG_LIFECYCLE_COMMAND, content=lifecycle_command)
                                    logger.info(f"Agent emitted lifecycle command: {lifecycle_command}")
                                    if lifecycle_command == LifecycleCommand.DISENGAGE:
                                        break
                                    elif lifecycle_command == LifecycleCommand.WAIT_FOR_TOOL_RESPONSE:
                                        logger.info("Agent is waiting for tool response, continuing agent iteration loop")
                                        continue
                                    elif lifecycle_command == LifecycleCommand.BLOCKED_ON_FURTHER_INPUT:
                                        logger.info("Agent is blocked on further input, breaking out of agent iteration loop")
                                        break
                                    else:
                                        raise Exception(f"Unknown lifecycle command: {lifecycle_command}")
                    elif data["type"] == "message_stop":
                        yield AgentOutboundFragment(type=AgentOutboundFragmentType.DEBUG_TEXT_MESSAGE, content=f"message_stop; usage: {data['usage'] if 'usage' in data else ''}")
                    elif data["type"] == "error":
                        logger.error(f"Anthropic error: {data['error']}")
                        self._log_inference_output(cumulative_inference_output)
                        yield AgentOutboundFragment(type=AgentOutboundFragmentType.ERROR, content=data['error'])
            except Exception as e:
                logger.error(f"Agent error: {str(e)}")
                yield AgentOutboundFragment(type=AgentOutboundFragmentType.ERROR, content=str(e))
                self._log_inference_output(cumulative_inference_output)
                break

            yield AgentOutboundFragment(type=AgentOutboundFragmentType.DEBUG_INFERENCE_OUTPUT, content=cumulative_inference_output)
            self._log_inference_output(cumulative_inference_output)
            iteration_count += 1

        yield AgentOutboundFragment(type=AgentOutboundFragmentType.AGENT_TERMINATED, content="Agent loop completed")