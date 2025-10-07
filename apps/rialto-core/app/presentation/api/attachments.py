from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.infrastructure.database.connection import get_db
from app.application.services.attachment_service import AttachmentService
from app.application.schemas.attachment import AttachmentCreate, AttachmentUpdate, AttachmentResponse

router = APIRouter(prefix="/attachments", tags=["attachments"])


@router.post("/", response_model=AttachmentResponse, status_code=status.HTTP_201_CREATED)
def create_attachment(attachment_data: AttachmentCreate, db: Session = Depends(get_db)):
    """Create a new attachment"""
    attachment_service = AttachmentService(db)
    try:
        return attachment_service.create_attachment(attachment_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[AttachmentResponse])
def get_attachments(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all attachments with pagination"""
    attachment_service = AttachmentService(db)
    return attachment_service.get_attachments(skip=skip, limit=limit)


@router.get("/{attachment_id}", response_model=AttachmentResponse)
def get_attachment(attachment_id: UUID, db: Session = Depends(get_db)):
    """Get an attachment by ID"""
    attachment_service = AttachmentService(db)
    attachment = attachment_service.get_attachment_by_id(attachment_id)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment


@router.get("/message/{message_id}", response_model=List[AttachmentResponse])
def get_attachments_by_message(message_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all attachments for a specific message"""
    attachment_service = AttachmentService(db)
    try:
        return attachment_service.get_attachments_by_message(message_id, skip=skip, limit=limit)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{attachment_id}", response_model=AttachmentResponse)
def update_attachment(attachment_id: UUID, attachment_data: AttachmentUpdate, db: Session = Depends(get_db)):
    """Update an attachment"""
    attachment_service = AttachmentService(db)
    attachment = attachment_service.update_attachment(attachment_id, attachment_data)
    if not attachment:
        raise HTTPException(status_code=404, detail="Attachment not found")
    return attachment


@router.delete("/{attachment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_attachment(attachment_id: UUID, db: Session = Depends(get_db)):
    """Delete an attachment"""
    attachment_service = AttachmentService(db)
    if not attachment_service.delete_attachment(attachment_id):
        raise HTTPException(status_code=404, detail="Attachment not found")


@router.delete("/message/{message_id}", status_code=status.HTTP_200_OK)
def delete_attachments_by_message(message_id: UUID, db: Session = Depends(get_db)):
    """Delete all attachments for a message"""
    attachment_service = AttachmentService(db)
    deleted_count = attachment_service.delete_attachments_by_message(message_id)
    return {"deleted_count": deleted_count, "message": f"Deleted {deleted_count} attachments"}
