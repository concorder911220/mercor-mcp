from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.infrastructure.database.connection import get_db
from app.application.services.document_service import DocumentService
from app.application.schemas.document import DocumentCreate, DocumentUpdate, DocumentResponse

router = APIRouter(prefix="/documents", tags=["documents"])


@router.post("/", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
def create_document(document_data: DocumentCreate, db: Session = Depends(get_db)):
    """Create a new document"""
    document_service = DocumentService(db)
    return document_service.create_document(document_data)


@router.get("/", response_model=List[DocumentResponse])
def get_documents(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all documents with pagination"""
    document_service = DocumentService(db)
    return document_service.get_documents(skip=skip, limit=limit)


@router.get("/{document_id}", response_model=DocumentResponse)
def get_document(document_id: UUID, db: Session = Depends(get_db)):
    """Get a document by ID"""
    document_service = DocumentService(db)
    document = document_service.get_document_by_id(document_id)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.get("/client/{client_id}", response_model=List[DocumentResponse])
def get_documents_by_client(client_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get documents by client ID"""
    document_service = DocumentService(db)
    return document_service.get_documents_by_client(client_id, skip=skip, limit=limit)


@router.get("/search/{title}", response_model=List[DocumentResponse])
def search_documents_by_title(title: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Search documents by title"""
    document_service = DocumentService(db)
    return document_service.search_documents_by_title(title, skip=skip, limit=limit)


@router.put("/{document_id}", response_model=DocumentResponse)
def update_document(document_id: UUID, document_data: DocumentUpdate, db: Session = Depends(get_db)):
    """Update a document"""
    document_service = DocumentService(db)
    document = document_service.update_document(document_id, document_data)
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    return document


@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_document(document_id: UUID, db: Session = Depends(get_db)):
    """Delete a document"""
    document_service = DocumentService(db)
    if not document_service.delete_document(document_id):
        raise HTTPException(status_code=404, detail="Document not found") 