import re
from typing import List, Dict, Any

from app.agent.exemplar_provider import Exemplar
from .tool_gateway import Tool
from datetime import datetime
from rialto_shared_types.events import Event
import json
from ..agent.prompt_templates.response_format import RESPONSE_FORMAT
from ..config import settings
import os
from datetime import datetime

class PromptConstructor:
    def __init__(self, prompt_template: str):
        self.prompt_template = prompt_template

    def _construct_single_tool_section_element(self, tool: Tool) -> str:
        tool_def_json = {
            "tool_namespace": tool.namespace,
            "tool_name": tool.name,
            "description": tool.description,
            "input_schema": tool.input_schema.model_dump(exclude_none=True)
        }
        tool_def_json_pretty = json.dumps(tool_def_json, indent=2, allow_nan=False, separators=(", ", ": "))
        
        return f"""### Tool: {tool.namespace}/{tool.name}
{tool_def_json_pretty}"""

    def _construct_tools_section(self, tools: List[Tool]) -> str:
        return "\n\n".join([self._construct_single_tool_section_element(tool) for tool in tools])
    
    def _construct_current_event_section(self, current_event: Event) -> str:
        return current_event.to_prompt_fragment()

    def _construct_event_history_section(self, event_history: List[Event]) -> str:
        return "\n".join([event.to_prompt_fragment() for event in event_history])

    def _construct_single_exemplar_section(self, exemplar: Exemplar) -> str:
        return f"### Exemplar: {exemplar.title}\n{exemplar.content}"

    def _construct_exemplars_section(self, exemplars: List[Exemplar]) -> str:
        return "\n\n".join([self._construct_single_exemplar_section(exemplar) for exemplar in exemplars])

    def construct_prompt(
        self,
        user_id: str,
        tools: List[Tool],
        current_event: Event,
        exemplars: List[Exemplar],
        event_history: List[Event] = []
    ) -> str:
        tools_section = self._construct_tools_section(tools)
        current_event_section = self._construct_current_event_section(current_event)
        today = datetime.now().strftime("%Y-%m-%d")
        time = datetime.now().strftime("%H:%M:%S")
        event_history_section = self._construct_event_history_section(event_history)
        exemplars_section = self._construct_exemplars_section(exemplars)
        constructed_prompt = self.prompt_template.format(
            today=today,
            time=time,
            tools=tools_section,
            response_format=RESPONSE_FORMAT,
            exemplars=exemplars_section,
            event_history=event_history_section,
            current_event=current_event_section,
            user_id=user_id
        )
        length_characters = len(constructed_prompt)
        length_words = len(constructed_prompt.split())
        length_tokens = length_words * 1.33
        print(f"Prompt length: {length_characters} characters, {length_words} words, {length_tokens} tokens")

        if settings.debug:
            os.makedirs("/tmp/inference_traces/", exist_ok=True)
            timestamp = datetime.now().isoformat()
            file_path = f"/tmp/inference_traces/input_prompt_{timestamp}.txt"
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(constructed_prompt)
        return constructed_prompt