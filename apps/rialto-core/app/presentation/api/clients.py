from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.infrastructure.database.connection import get_db
from app.application.services.client_service import ClientService
from app.application.schemas.client import ClientCreate, ClientUpdate, ClientResponse

router = APIRouter(prefix="/clients", tags=["clients"])


@router.post("/", response_model=ClientResponse, status_code=status.HTTP_201_CREATED)
def create_client(client_data: ClientCreate, db: Session = Depends(get_db)):
    """Create a new client"""
    client_service = ClientService(db)
    try:
        return client_service.create_client(client_data)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=List[ClientResponse])
def get_clients(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all clients with pagination"""
    client_service = ClientService(db)
    return client_service.get_clients(skip=skip, limit=limit)


@router.get("/{client_id}", response_model=ClientResponse)
def get_client(client_id: UUID, db: Session = Depends(get_db)):
    """Get a client by ID"""
    client_service = ClientService(db)
    client = client_service.get_client_by_id(client_id)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/email/{email}", response_model=ClientResponse)
def get_client_by_email(email: str, db: Session = Depends(get_db)):
    """Get a client by email"""
    client_service = ClientService(db)
    client = client_service.get_client_by_email(email)
    if not client:
        raise HTTPException(status_code=404, detail="Client not found")
    return client


@router.get("/user/{user_id}", response_model=List[ClientResponse])
def get_clients_by_user(user_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get clients by user ID"""
    client_service = ClientService(db)
    return client_service.get_clients_by_user(user_id, skip=skip, limit=limit)


@router.put("/{client_id}", response_model=ClientResponse)
def update_client(client_id: UUID, client_data: ClientUpdate, db: Session = Depends(get_db)):
    """Update a client"""
    client_service = ClientService(db)
    try:
        client = client_service.update_client(client_id, client_data)
        if not client:
            raise HTTPException(status_code=404, detail="Client not found")
        return client
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{client_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_client(client_id: UUID, db: Session = Depends(get_db)):
    """Delete a client"""
    client_service = ClientService(db)
    if not client_service.delete_client(client_id):
        raise HTTPException(status_code=404, detail="Client not found") 