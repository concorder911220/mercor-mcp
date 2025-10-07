from pydantic import BaseModel
from typing import List, Dict, Any, Literal, Union, Optional
from datetime import datetime
from enum import Enum
from .remote_file import RemoteFile
import json

class EventType(str, Enum):
    """All supported event types that can trigger agents."""
    CHAT_REQUEST = "chat_request"
    DOCUMENT_SAVE = "document_save"

class Event(BaseModel):
    id: str
    type: str
    timestamp: datetime

    def to_prompt_fragment(self) -> str:
        raise NotImplementedError("Subclasses must implement to_prompt_fragment")

    def to_json(self) -> str:
        return self.model_dump_json()
    
    @classmethod
    def from_json(cls, json_str: str) -> "Event":
        return cls.model_validate_json(json_str)
   
class ChatRequestEvent(Event):
    type: Literal[EventType.CHAT_REQUEST] = EventType.CHAT_REQUEST
    message: str
    files: List[RemoteFile]
    
    def to_prompt_fragment(self) -> str:
        return f"<chat_input timestamp={self.timestamp.isoformat()}>{self.message}</chat_input>"

class ChatResponseEvent(Event):
    type: Literal["chat_response"] = "chat_response"
    message: str

    def to_prompt_fragment(self) -> str:
        return f"<chat_response timestamp={self.timestamp.isoformat()}>{self.message}</chat_response>"

class ErrorEvent(Event):
    type: Literal["error"] = "error"
    error_description: str

    def to_prompt_fragment(self) -> str:
        return f"<error timestamp={self.timestamp.isoformat()}>{self.error_description}</error>"

class ToolSelection(Event):
    type: Literal["tool_selection"] = "tool_selection"
    tool_namespace: str
    tool_name: str
    tool_args: Dict[str, Any]

    def to_prompt_fragment(self) -> str:
        return f"""<response_fragment type="tool_call">
{{
    "tool_namespace": "{self.tool_namespace}",
    "tool_name": "{self.tool_name}",
    "tool_args": {json.dumps(self.tool_args)}
}}
</response_fragment>"""

class ToolOutput(Event):
    type: Literal["tool_output"] = "tool_output"
    tool_namespace: str
    tool_name: str
    output: Optional[Dict[str, Any]]
    error: Optional[str]

    def to_prompt_fragment(self) -> str:
        return f"""<tool_output>
{{
    "tool_namespace": "{self.tool_namespace}",
    "tool_name": "{self.tool_name}",
    "output": {json.dumps(self.output)}
}}
</tool_output>"""


class SourceProvider(str, Enum):
    """How the client provided the file."""
    DROPBOX = "DROPBOX"

class Source(BaseModel):
    """References to the file backing the document."""
    provider: SourceProvider
    metadata: str  # Email ID, Dropbox path, etc.
    reference: str  # ARN to S3 object

class DocumentSaveEvent(Event):
    """Event fired when a document has been saved/synced to S3 and is ready for processing."""
    type: Literal[EventType.DOCUMENT_SAVE] = EventType.DOCUMENT_SAVE
    
    # Core document identification (matches DynamoDB schema)
    document_id: str  # File unique identifier
    client_id: str    # Who this file belongs to

    # Source information
    source: Source  # How file was provided and where it's stored
    
    def to_prompt_fragment(self) -> str:
        return f"""<document_save timestamp={self.timestamp.isoformat()}>
{{
    "document_id": "{self.document_id}",
    "client_id": "{self.client_id}",
    "source": {{
        "provider": "{self.source.provider}",
        "metadata": "{self.source.metadata}",
        "reference": "{self.source.reference}"
    }}
}}
</document_save>"""


# Update the union to include the new event type
AgentTriggerEventUnion = Union[ChatRequestEvent, DocumentSaveEvent]