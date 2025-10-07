
from enum import Enum

class LifecycleCommand(str, Enum):
    BLOCKED_ON_FURTHER_INPUT = "blocked_on_further_input"
    WAIT_FOR_TOOL_RESPONSE = "wait_for_tool_response"
    DISENGAGE = "disengage"
