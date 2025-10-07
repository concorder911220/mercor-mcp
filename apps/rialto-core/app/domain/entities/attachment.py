from dataclasses import dataclass
from datetime import datetime
from typing import Optional
from uuid import UUID


@dataclass
class Attachment:
    id: UUID
    message_id: UUID
    filename: str
    content_type: str
    file_size: int
    s3_url: str
    s3_key: str
    created_at: datetime
