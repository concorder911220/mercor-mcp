from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session

from app.infrastructure.repositories.task_repository import TaskRepository
from app.application.schemas.task import TaskCreate, TaskUpdate, TaskResponse


class TaskService:
    def __init__(self, db: Session):
        self.task_repository = TaskRepository(db)

    def create_task(self, task_data: TaskCreate) -> TaskResponse:
        db_task = self.task_repository.create(task_data)
        return TaskResponse.model_validate(db_task)

    def get_task_by_id(self, task_id: UUID) -> Optional[TaskResponse]:
        db_task = self.task_repository.get_by_id(task_id)
        if not db_task:
            return None
        return TaskResponse.model_validate(db_task)

    def get_tasks(self, skip: int = 0, limit: int = 100) -> List[TaskResponse]:
        db_tasks = self.task_repository.get_all(skip=skip, limit=limit)
        return [TaskResponse.model_validate(task) for task in db_tasks]

    def get_tasks_by_user(self, user_id: UUID, skip: int = 0, limit: int = 100) -> List[TaskResponse]:
        db_tasks = self.task_repository.get_by_user_id(user_id, skip=skip, limit=limit)
        return [TaskResponse.model_validate(task) for task in db_tasks]

    def get_tasks_by_client(self, client_id: UUID, skip: int = 0, limit: int = 100) -> List[TaskResponse]:
        db_tasks = self.task_repository.get_by_client_id(client_id, skip=skip, limit=limit)
        return [TaskResponse.model_validate(task) for task in db_tasks]

    def get_tasks_by_status(self, status: str, skip: int = 0, limit: int = 100) -> List[TaskResponse]:
        db_tasks = self.task_repository.get_by_status(status, skip=skip, limit=limit)
        return [TaskResponse.model_validate(task) for task in db_tasks]

    def get_subtasks(self, parent_id: UUID, skip: int = 0, limit: int = 100) -> List[TaskResponse]:
        db_tasks = self.task_repository.get_by_parent_id(parent_id, skip=skip, limit=limit)
        return [TaskResponse.model_validate(task) for task in db_tasks]

    def update_task(self, task_id: UUID, task_data: TaskUpdate) -> Optional[TaskResponse]:
        db_task = self.task_repository.update(task_id, task_data)
        if not db_task:
            return None
        return TaskResponse.model_validate(db_task)

    def delete_task(self, task_id: UUID) -> bool:
        return self.task_repository.delete(task_id) 