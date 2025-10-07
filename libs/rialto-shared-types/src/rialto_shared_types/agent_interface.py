from typing import Any, Dict
from pydantic import BaseModel, Field
import json
from .events import AgentTriggerEventUnion
from datetime import datetime, timezone
import uuid
from enum import Enum

# Agent requests are rooted in the concept of an Event. Events trigger the Agent to run. They may be a new execution or a continuation of an existing one.
class AgentInboundRequest(BaseModel):
    execution_id: str
    user_id: str
    event: AgentTriggerEventUnion

    def to_json(self) -> str:
        return self.model_dump_json()

    def from_json(self, json_str: str) -> "AgentInboundRequest":
        return self.model_validate_json(json_str)

class AgentOutboundFragmentType(str, Enum):
    TEXT_FRAGMENT = "text_fragment" # for partial text responses
    TEXT_MESSAGE = "text_message" # for complete text responses

    # Messages not meant to be presented to the user.
    ERROR = "error"
    SYSTEM = "system"
    AGENT_TERMINATED = "agent_terminated"

    DEBUG_TEXT_MESSAGE = "debug:text_message"
    DEBUG_ITERATION_COUNTER = "debug:iter"
    DEBUG_TOOL_CALL = "debug:tool_call"
    DEBUG_TOOL_RESULT = "debug:tool_result"
    DEBUG_LIFECYCLE_COMMAND = "debug:lifecycle_command"
    DEBUG_PROMPT = "debug:prompt"
    DEBUG_INFERENCE_OUTPUT = "debug:inference_output"

    def __str__(self):
        return self.value


# Not model-facing, response shape for sending data to the client.
class AgentOutboundFragment(BaseModel):
    id: str = Field(default_factory=lambda: f"rialto1.agent-outbound-fragment.{str(uuid.uuid4())}")
    timestamp: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    type: AgentOutboundFragmentType
    content: Dict[str, Any] | str

    def to_json(self) -> str:
        return self.model_dump_json()

    def from_json(self, json_str: str) -> "AgentOutboundFragment":
        return self.model_validate_json(json_str)