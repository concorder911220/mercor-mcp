from typing import Literal
from pydantic import BaseModel
from enum import Enum

OPENING_RESPONSE_FRAGMENT_TAG_PATTERN = r'<response_fragment type="([^"]*)">'
CLOSING_RESPONSE_FRAGMENT_TAG_PATTERN = r'</response_fragment>'
COMPLETE_RESPONSE_FRAGMENT_CONTENT_PATTERN = fr'{OPENING_RESPONSE_FRAGMENT_TAG_PATTERN}(.*?){CLOSING_RESPONSE_FRAGMENT_TAG_PATTERN}'
RESPONSE_FRAGMENT_TYPE_GROUP_INDEX = 1
RESPONSE_FRAGMENT_CONTENT_GROUP_INDEX = 2

class ResponseFragmentType(str, Enum):
    TEXT = "text"
    TOOL_CALL = "tool_call"
    LIFECYCLE_COMMAND = "lifecycle_command"

class ResponseFragment(BaseModel):
    type: str
    raw_content: str

    def to_json(self) -> str:
        return self.model_dump_json()

    def from_json(self, json_str: str) -> "ResponseFragment":
        return self.model_validate_json(json_str)

class CompleteTextResponseFragment(ResponseFragment):
    type: Literal[ResponseFragmentType.TEXT] = ResponseFragmentType.TEXT

class PartialTextResponseFragment(ResponseFragment):
    type: Literal[ResponseFragmentType.TEXT] = ResponseFragmentType.TEXT

class ToolCallResponseFragment(ResponseFragment):
    type: Literal[ResponseFragmentType.TOOL_CALL] = ResponseFragmentType.TOOL_CALL

class LifecycleCommandResponseFragment(ResponseFragment):
    type: Literal[ResponseFragmentType.LIFECYCLE_COMMAND] = ResponseFragmentType.LIFECYCLE_COMMAND
