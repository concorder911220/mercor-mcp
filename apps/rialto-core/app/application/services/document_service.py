from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.repositories.document_repository import DocumentRepository
from app.application.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse


class DocumentService:
    def __init__(self, db: Session):
        self.document_repository = DocumentRepository(db)

    def create_document(self, document_data: DocumentCreate) -> DocumentResponse:
        db_document = self.document_repository.create(document_data)
        return DocumentResponse.model_validate(db_document)

    def get_document_by_id(self, document_id: UUID) -> Optional[DocumentResponse]:
        db_document = self.document_repository.get_by_id(document_id)
        if not db_document:
            return None
        return DocumentResponse.model_validate(db_document)

    def get_documents(self, skip: int = 0, limit: int = 100) -> List[DocumentResponse]:
        db_documents = self.document_repository.get_all(skip=skip, limit=limit)
        return [DocumentResponse.model_validate(document) for document in db_documents]

    def get_documents_by_client(self, client_id: UUID, skip: int = 0, limit: int = 100) -> List[DocumentResponse]:
        db_documents = self.document_repository.get_by_client_id(client_id, skip=skip, limit=limit)
        return [DocumentResponse.model_validate(document) for document in db_documents]

    def search_documents_by_title(self, title: str, skip: int = 0, limit: int = 100) -> List[DocumentResponse]:
        db_documents = self.document_repository.get_by_title(title, skip=skip, limit=limit)
        return [DocumentResponse.model_validate(document) for document in db_documents]

    def update_document(self, document_id: UUID, document_data: DocumentUpdate) -> Optional[DocumentResponse]:
        db_document = self.document_repository.update(document_id, document_data)
        if not db_document:
            return None
        return DocumentResponse.model_validate(db_document)

    def delete_document(self, document_id: UUID) -> bool:
        return self.document_repository.delete(document_id) 