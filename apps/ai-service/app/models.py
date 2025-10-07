from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from enum import Enum

class MessageRole(str, Enum):
    """Message role enumeration."""
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class Message(BaseModel):
    """Chat message model."""
    role: MessageRole
    content: str

# Import RemoteFile from shared library
from rialto_shared_types import RemoteFile

class ChatRequest(BaseModel):
    """Chat request model."""
    query: str = Field(..., description="The user's query")
    messages: List[Message] = Field(default=[], description="Message history")
    attachments: List[RemoteFile] = Field(default=[], description="List of S3 URLs for attachments")
    user_id: str = Field(..., description="The user's ID")
    
    class Config:
        json_schema_extra = {
            "example": {
                "query": "What is the capital of France?",
                "messages": [
                    {"role": "user", "content": "Hello"},
                    {"role": "assistant", "content": "Hi! How can I help you?"}
                ],
                "attachments": [
                    {
                        "url": "https://s3.amazonaws.com/bucket/file1.pdf",
                        "content_type": "application/pdf"
                    }
                ]
            }
        }

class ErrorResponse(BaseModel):
    """Error response model."""
    error: str
    detail: Optional[str] = None 