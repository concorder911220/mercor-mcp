from dataclasses import dataclass
from datetime import datetime
from typing import Any, Dict
from uuid import UUID
from enum import Enum


class ServiceType(str, Enum):
    OUTLOOK = "OUTLOOK"
    SALESFORCE = "SALESFORCE"
    DROPBOX = "DROPBOX"
    EMONEY = "EMONEY"
    QUICKBOOKS = "QUICKBOOKS"


@dataclass
class UserToken:
    id: UUID
    user_id: UUID
    service_type: ServiceType
    token: Dict[str, Any]
    expires_at: datetime 