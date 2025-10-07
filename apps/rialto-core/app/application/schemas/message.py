from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Dict, List
from uuid import UUID


class MessageBase(BaseModel):
    message_type: str
    content: str
    role: str
    timestamp: datetime
    extra_metadata: Optional[Dict[str, Any]] = None
    conversation_id: UUID


class MessageCreate(MessageBase):
    pass


class MessageUpdate(BaseModel):
    message_type: Optional[str] = None
    content: Optional[str] = None
    role: Optional[str] = None
    timestamp: Optional[datetime] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    conversation_id: Optional[UUID] = None


class MessageResponse(MessageBase):
    id: UUID
    attachments: Optional[List["AttachmentResponse"]] = []

    class Config:
        from_attributes = True


# Chat specific schemas
class ChatMessage(BaseModel):
    content: str
    role: str  # 'user' or 'assistant'
    timestamp: Optional[datetime] = None


class ChatAttachment(BaseModel):
    """Attachment data for chat requests (without id and message_id)"""
    filename: str
    content_type: str
    file_size: int
    s3_url: str
    s3_key: str


class ChatRequest(BaseModel):
    query: str
    messages: Optional[List[ChatMessage]] = []
    attachments: Optional[List[ChatAttachment]] = []
    conversation_id: Optional[UUID] = None
    user_id: Optional[UUID] = None


class ChatStreamResponse(BaseModel):
    content: str
    finish_reason: Optional[str] = None
    conversation_id: Optional[UUID] = None
    message_id: Optional[UUID] = None


class ConversationCreatedResponse(BaseModel):
    conversation_id: UUID
    title: str
    created: bool = True


# Import here to avoid circular imports
from app.application.schemas.attachment import AttachmentResponse
MessageResponse.model_rebuild() 