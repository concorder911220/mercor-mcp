from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.database.models import DocumentModel
from app.application.schemas.document import DocumentCreate, DocumentUpdate


class DocumentRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, document_data: DocumentCreate) -> DocumentModel:
        db_document = DocumentModel(**document_data.model_dump())
        self.db.add(db_document)
        self.db.commit()
        self.db.refresh(db_document)
        return db_document

    def get_by_id(self, document_id: UUID) -> Optional[DocumentModel]:
        return self.db.query(DocumentModel).filter(DocumentModel.id == document_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[DocumentModel]:
        return self.db.query(DocumentModel).offset(skip).limit(limit).all()

    def get_by_client_id(self, client_id: UUID, skip: int = 0, limit: int = 100) -> List[DocumentModel]:
        return self.db.query(DocumentModel).filter(DocumentModel.client_id == client_id).offset(skip).limit(limit).all()

    def get_by_title(self, title: str, skip: int = 0, limit: int = 100) -> List[DocumentModel]:
        return self.db.query(DocumentModel).filter(DocumentModel.title.ilike(f"%{title}%")).offset(skip).limit(limit).all()

    def update(self, document_id: UUID, document_data: DocumentUpdate) -> Optional[DocumentModel]:
        db_document = self.get_by_id(document_id)
        if not db_document:
            return None

        update_data = document_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_document, field, value)

        self.db.commit()
        self.db.refresh(db_document)
        return db_document

    def delete(self, document_id: UUID) -> bool:
        db_document = self.get_by_id(document_id)
        if not db_document:
            return False

        self.db.delete(db_document)
        self.db.commit()
        return True 