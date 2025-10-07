from typing import Union
from .events import ChatRequestEvent, ChatResponseEvent, ToolSelection, ToolOutput
from .agent_interface import AgentInboundRequest, AgentOutboundFragment
from .remote_file import RemoteFile

# Union type for all response shapes. This is required for FastAPI to generate the openapi.json specs
# for these types. Else the response shapes are obscured by the SSE event.
ResponseTypesUnion = Union[
    # Event types
    ChatResponseEvent,
    ToolSelection,
    ToolOutput,
    # Agent interface types
    AgentOutboundFragment,
    # Remote file type
    RemoteFile
]