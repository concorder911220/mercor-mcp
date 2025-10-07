from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.infrastructure.database.models import TaskModel
from app.application.schemas.task import TaskCreate, TaskUpdate


class TaskRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, task_data: TaskCreate) -> TaskModel:
        db_task = TaskModel(**task_data.model_dump())
        self.db.add(db_task)
        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def get_by_id(self, task_id: UUID) -> Optional[TaskModel]:
        return self.db.query(TaskModel).filter(TaskModel.id == task_id).first()

    def get_all(self, skip: int = 0, limit: int = 100) -> List[TaskModel]:
        return self.db.query(TaskModel).offset(skip).limit(limit).all()

    def get_by_user_id(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[TaskModel]:
        return self.db.query(TaskModel).filter(TaskModel.user_id == user_id).offset(skip).limit(limit).all()

    def get_by_client_id(self, client_id: UUID, skip: int = 0, limit: int = 100) -> List[TaskModel]:
        return self.db.query(TaskModel).filter(TaskModel.client_id == client_id).offset(skip).limit(limit).all()

    def get_by_parent_id(self, parent_id: UUID, skip: int = 0, limit: int = 100) -> List[TaskModel]:
        return self.db.query(TaskModel).filter(TaskModel.parent_id == parent_id).offset(skip).limit(limit).all()

    def get_by_status(self, status: str, skip: int = 0, limit: int = 100) -> List[TaskModel]:
        return self.db.query(TaskModel).filter(TaskModel.current_status == status).offset(skip).limit(limit).all()

    def update(self, task_id: UUID, task_data: TaskUpdate) -> Optional[TaskModel]:
        db_task = self.get_by_id(task_id)
        if not db_task:
            return None

        update_data = task_data.model_dump(exclude_unset=True)
        
        for field, value in update_data.items():
            setattr(db_task, field, value)

        self.db.commit()
        self.db.refresh(db_task)
        return db_task

    def delete(self, task_id: UUID) -> bool:
        db_task = self.get_by_id(task_id)
        if not db_task:
            return False

        self.db.delete(db_task)
        self.db.commit()
        return True 