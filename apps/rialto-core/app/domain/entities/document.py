from dataclasses import dataclass
from uuid import UUID


@dataclass
class Document:
    id: UUID
    title: str
    client_id: UUID
    document_link: str 