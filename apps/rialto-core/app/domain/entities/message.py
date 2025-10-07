from dataclasses import dataclass
from datetime import time
from typing import Optional, Any, Dict
from uuid import UUID


@dataclass
class Message:
    id: UUID
    message_type: str
    content: str
    role: str
    timestamp: time
    extra_metadata: Optional[Dict[str, Any]]
    task_id: UUID 