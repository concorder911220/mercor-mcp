from pydantic import BaseModel
from uuid import UUID
from typing import Optional


class DocumentBase(BaseModel):
    title: str
    client_id: UUID
    document_link: str


class DocumentCreate(DocumentBase):
    pass


class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    client_id: Optional[UUID] = None
    document_link: Optional[str] = None


class DocumentResponse(DocumentBase):
    id: UUID

    class Config:
        from_attributes = True 