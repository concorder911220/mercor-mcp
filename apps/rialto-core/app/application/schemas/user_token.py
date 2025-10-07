from pydantic import BaseModel
from datetime import datetime
from typing import Any, Dict, Optional
from uuid import UUID
from enum import Enum


class ServiceType(str, Enum):
    OUTLOOK = "OUTLOOK"
    SALESFORCE = "SALESFORCE"
    DROPBOX = "DROPBOX"
    EMONEY = "EMONEY"
    QUICKBOOKS = "QUICKBOOKS"


class UserTokenBase(BaseModel):
    user_id: UUID
    service_type: ServiceType
    token: Dict[str, Any]
    expires_at: datetime


class UserTokenCreate(UserTokenBase):
    pass


class UserTokenUpdate(BaseModel):
    user_id: Optional[UUID] = None
    service_type: Optional[ServiceType] = None
    token: Optional[Dict[str, Any]] = None
    expires_at: Optional[datetime] = None


class UserTokenResponse(UserTokenBase):
    id: UUID

    class Config:
        from_attributes = True 