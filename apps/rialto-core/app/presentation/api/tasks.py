from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.infrastructure.database.connection import get_db
from app.application.services.task_service import TaskService
from app.application.schemas.task import TaskCreate, TaskUpdate, TaskResponse

router = APIRouter(prefix="/tasks", tags=["tasks"])


@router.post("/", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_data: TaskCreate, db: Session = Depends(get_db)):
    """Create a new task"""
    task_service = TaskService(db)
    return task_service.create_task(task_data)


@router.get("/", response_model=List[TaskResponse])
def get_tasks(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get all tasks with pagination"""
    task_service = TaskService(db)
    return task_service.get_tasks(skip=skip, limit=limit)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: UUID, db: Session = Depends(get_db)):
    """Get a task by ID"""
    task_service = TaskService(db)
    task = task_service.get_task_by_id(task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("/user/{user_id}", response_model=List[TaskResponse])
def get_tasks_by_user(user_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get tasks by user ID"""
    task_service = TaskService(db)
    return task_service.get_tasks_by_user(user_id, skip=skip, limit=limit)


@router.get("/client/{client_id}", response_model=List[TaskResponse])
def get_tasks_by_client(client_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get tasks by client ID"""
    task_service = TaskService(db)
    return task_service.get_tasks_by_client(client_id, skip=skip, limit=limit)


@router.get("/status/{status}", response_model=List[TaskResponse])
def get_tasks_by_status(status: str, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get tasks by status"""
    task_service = TaskService(db)
    return task_service.get_tasks_by_status(status, skip=skip, limit=limit)


@router.get("/parent/{parent_id}/subtasks", response_model=List[TaskResponse])
def get_subtasks(parent_id: UUID, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get subtasks by parent task ID"""
    task_service = TaskService(db)
    return task_service.get_subtasks(parent_id, skip=skip, limit=limit)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(task_id: UUID, task_data: TaskUpdate, db: Session = Depends(get_db)):
    """Update a task"""
    task_service = TaskService(db)
    task = task_service.update_task(task_id, task_data)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: UUID, db: Session = Depends(get_db)):
    """Delete a task"""
    task_service = TaskService(db)
    if not task_service.delete_task(task_id):
        raise HTTPException(status_code=404, detail="Task not found") 