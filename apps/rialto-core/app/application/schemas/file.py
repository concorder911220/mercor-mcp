from pydantic import BaseModel
from typing import Dict, Any
from datetime import datetime


class FileUploadResponse(BaseModel):
    success: bool
    s3_url: str
    s3_key: str
    metadata: Dict[str, Any]
    message: str


class FileListResponse(BaseModel):
    s3_key: str
    s3_url: str
    filename: str
    content_type: str
    file_size: int
    upload_timestamp: datetime
    user_id: str


class FileDeleteResponse(BaseModel):
    success: bool
    s3_key: str
    message: str 