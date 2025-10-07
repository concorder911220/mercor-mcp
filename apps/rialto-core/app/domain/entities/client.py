from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID


@dataclass
class Client:
    id: UUID
    name: str
    email: str
    contact_phone: str
    created_at: datetime
    client_settings: Optional[Dict[str, Any]]
    extra_metadata: Optional[Dict[str, Any]]
    user_id: UUID 