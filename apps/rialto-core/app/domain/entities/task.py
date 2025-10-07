from dataclasses import dataclass
from datetime import datetime
from typing import Optional, Any, Dict
from uuid import UUID


@dataclass
class Task:
    id: UUID
    version: int
    request: str
    parent_id: Optional[UUID]
    current_status: str
    current_status_timestamp: datetime
    current_status_note: Optional[str]
    timeline: datetime
    context: Optional[Dict[str, Any]]
    extra_metadata: Optional[Dict[str, Any]]
    created_at: datetime
    updated_at: datetime
    user_id: UUID
    client_id: UUID 