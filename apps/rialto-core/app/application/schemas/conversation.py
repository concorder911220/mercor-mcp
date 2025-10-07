from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from uuid import UUID


class ConversationBase(BaseModel):
    title: str


class ConversationCreate(ConversationBase):
    user_id: UUID


class ConversationUpdate(BaseModel):
    title: Optional[str] = None


class ConversationResponse(ConversationBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: Optional[datetime] = None
    messages: Optional[List["MessageResponse"]] = []

    class Config:
        from_attributes = True


# Import here to avoid circular imports
from app.application.schemas.message import MessageResponse
ConversationResponse.model_rebuild()