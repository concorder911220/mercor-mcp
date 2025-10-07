from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID


class ClientBase(BaseModel):
    name: str
    email: EmailStr
    contact_phone: str
    client_settings: Optional[Dict[str, Any]] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    user_id: UUID


class ClientCreate(ClientBase):
    pass


class ClientUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    contact_phone: Optional[str] = None
    client_settings: Optional[Dict[str, Any]] = None
    extra_metadata: Optional[Dict[str, Any]] = None
    user_id: Optional[UUID] = None


class ClientResponse(ClientBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True 