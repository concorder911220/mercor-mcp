from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.database.models import ClientModel
from app.application.schemas.client import ClientCreate, ClientUpdate


class ClientRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, client_data: ClientCreate) -> ClientModel:
        
        db_client = ClientModel(
            name=client_data.name,
            email=client_data.email,
            contact_phone=client_data.contact_phone,
            client_settings=client_data.client_settings,
            extra_metadata=client_data.extra_metadata,
            user_id=client_data.user_id
        )
        self.db.add(db_client)
        self.db.commit()
        self.db.refresh(db_client)
        return db_client

    def get_by_id(self, client_id: UUID) -> Optional[ClientModel]:
        return self.db.query(ClientModel).filter(ClientModel.id == client_id).first()

    def get_by_email(self, email: str) -> Optional[ClientModel]:
        return self.db.query(ClientModel).filter(ClientModel.email == email).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[ClientModel]:
        return self.db.query(ClientModel).offset(skip).limit(limit).all()

    def get_by_user_id(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[ClientModel]:
        return self.db.query(ClientModel).filter(ClientModel.user_id == user_id).offset(skip).limit(limit).all()

    def update(self, client_id: UUID, client_data: ClientUpdate) -> Optional[ClientModel]:
        db_client = self.get_by_id(client_id)
        if not db_client:
            return None

        update_data = client_data.model_dump(exclude_unset=True)
        
        if "password" in update_data:
            update_data["password"] = f"hashed_{update_data['password']}"

        for field, value in update_data.items():
            setattr(db_client, field, value)

        self.db.commit()
        self.db.refresh(db_client)
        return db_client

    def delete(self, client_id: UUID) -> bool:
        db_client = self.get_by_id(client_id)
        if not db_client:
            return False

        self.db.delete(db_client)
        self.db.commit()
        return True 