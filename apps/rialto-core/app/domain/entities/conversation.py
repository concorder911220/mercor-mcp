from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class Conversation:
    id: UUID
    user_id: UUID
    title: str
    created_at: datetime
    updated_at: Optional[datetime] = None