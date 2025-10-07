from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from uuid import UUID


class AttachmentBase(BaseModel):
    filename: str
    content_type: str
    file_size: int
    s3_url: str
    s3_key: str


class AttachmentCreate(AttachmentBase):
    message_id: UUID


class AttachmentUpdate(BaseModel):
    filename: Optional[str] = None
    content_type: Optional[str] = None
    file_size: Optional[int] = None
    s3_url: Optional[str] = None
    s3_key: Optional[str] = None


class AttachmentResponse(AttachmentBase):
    id: UUID
    message_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True
