from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID
from enum import Enum


class UserRole(str, Enum):
    ADMIN = "ADMIN"
    USER = "USER"
    MANAGER = "MANAGER"


@dataclass
class User:
    id: UUID
    username: str
    email: str
    hashed_password: str
    role: UserRole
    created_at: datetime
    extra_metadata: Optional[Dict[str, Any]] = None 