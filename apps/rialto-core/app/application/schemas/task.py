from pydantic import BaseModel
from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID


class TaskBase(BaseModel):
    version: int
    request: str
    parent_id: Optional[UUID] = None
    current_status: str
    current_status_timestamp: datetime
    current_status_note: Optional[str] = None
    timeline: datetime
    context: Optional[Dict[str, Any]] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    user_id: UUID
    client_id: UUID
    message_id: Optional[UUID] = None


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    version: Optional[int] = None
    request: Optional[str] = None
    parent_id: Optional[UUID] = None
    current_status: Optional[str] = None
    current_status_timestamp: Optional[datetime] = None
    current_status_note: Optional[str] = None
    timeline: Optional[datetime] = None
    context: Optional[Dict[str, Any]] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    user_id: Optional[UUID] = None
    client_id: Optional[UUID] = None
    message_id: Optional[UUID] = None


class TaskResponse(TaskBase):
    id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True 