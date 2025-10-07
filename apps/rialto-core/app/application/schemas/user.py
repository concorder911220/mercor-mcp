from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"
    MANAGER = "MANAGER"


class UserBase(BaseModel):
    username: str
    email: EmailStr
    role: UserRole
    extra_metadata: Optional[Dict[str, Any]] = None


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None
    extra_metadata: Optional[Dict[str, Any]] = None


class UserResponse(UserBase):
    id: UUID
    created_at: datetime

    class Config:
        from_attributes = True 