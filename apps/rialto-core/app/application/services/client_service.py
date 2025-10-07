from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.repositories.client_repository import ClientRepository
from app.application.schemas.client import ClientCreate, ClientUpdate, ClientResponse


class ClientService:
    def __init__(self, db: Session):
        self.client_repository = ClientRepository(db)

    def create_client(self, client_data: ClientCreate) -> ClientResponse:
        # Check if client already exists
        existing_client = self.client_repository.get_by_email(client_data.email)
        if existing_client:
            raise ValueError("Client with this email already exists")

        db_client = self.client_repository.create(client_data)
        return ClientResponse.model_validate(db_client)

    def get_client_by_id(self, client_id: UUID) -> Optional[ClientResponse]:
        db_client = self.client_repository.get_by_id(client_id)
        if not db_client:
            return None
        return ClientResponse.model_validate(db_client)

    def get_client_by_email(self, email: str) -> Optional[ClientResponse]:
        db_client = self.client_repository.get_by_email(email)
        if not db_client:
            return None
        return ClientResponse.model_validate(db_client)

    def get_clients(self, skip: int = 0, limit: int = 100) -> List[ClientResponse]:
        db_clients = self.client_repository.get_all(skip=skip, limit=limit)
        return [ClientResponse.model_validate(client) for client in db_clients]

    def get_clients_by_user(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[ClientResponse]:
        db_clients = self.client_repository.get_by_user_id(user_id, skip=skip, limit=limit)
        return [ClientResponse.model_validate(client) for client in db_clients]

    def update_client(self, client_id: UUID, client_data: ClientUpdate) -> Optional[ClientResponse]:
        # Check if email is being changed and already exists
        if client_data.email:
            existing_client = self.client_repository.get_by_email(client_data.email)
            if existing_client and existing_client.id != client_id:
                raise ValueError("Client with this email already exists")

        db_client = self.client_repository.update(client_id, client_data)
        if not db_client:
            return None
        return ClientResponse.model_validate(db_client)

    def delete_client(self, client_id: UUID) -> bool:
        return self.client_repository.delete(client_id) 