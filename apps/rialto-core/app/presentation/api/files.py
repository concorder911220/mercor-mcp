from fastapi import APIRouter, status, UploadFile, File, Form, Depends, HTTPException
from fastapi.responses import RedirectResponse
from typing import List

from app.application.services.file_service import FileService
from app.application.schemas.file import FileUploadResponse, FileListResponse, FileDeleteResponse
from app.application.schemas.auth import AuthenticatedUser
from app.core.dependencies import get_current_user, get_current_admin_user

router = APIRouter(prefix="/files", tags=["files"])


@router.post("/upload", response_model=FileUploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Upload a file to S3 and return upload result
    
    Requires authentication. Files are uploaded to user-specific folders.
    Supports: .jpg, .jpeg, .png, .pdf, .doc, .docx (configurable)
    Max size: 10MB (configurable)
    
    Args:
        file: File to upload
        current_user: Authenticated user context
        
    Returns:
        FileUploadResponse: Upload result with S3 URL and metadata
        
    Raises:
        401: Authentication required
        413: File too large
        415: File type not allowed
        500: Upload failed
    """
    file_service = FileService()
    return await file_service.upload_file(file, str(current_user.user_id))


@router.get("/my-files", response_model=List[FileListResponse])
async def list_user_files(
    current_user: AuthenticatedUser = Depends(get_current_user),
    limit: int = 50
):
    """
    List files uploaded by the current user
    
    Requires authentication. Only shows files belonging to the authenticated user.
    
    Args:
        current_user: Authenticated user context
        limit: Maximum number of files to return (default: 50)
        
    Returns:
        List[FileListResponse]: List of user's uploaded files
        
    Raises:
        401: Authentication required
        500: Failed to list files
    """
    file_service = FileService()
    return await file_service.list_user_files(str(current_user.user_id), limit)


@router.get("/download/{s3_key:path}")
async def download_file(
    s3_key: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Download a file by S3 key (user can only download their own files)
    
    Requires authentication. Users can only download files they uploaded.
    Returns a redirect to the S3 signed URL.
    
    Args:
        s3_key: S3 key of the file to download
        current_user: Authenticated user context
        
    Returns:
        RedirectResponse: Redirect to signed S3 URL
        
    Raises:
        401: Authentication required
        403: File doesn't belong to user
        404: File not found
        500: Download failed
    """
    file_service = FileService()
    
    # Verify the file belongs to the current user
    if not s3_key.startswith(f"chat/{current_user.user_id}/"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only download your own files."
        )
    
    signed_url = await file_service.get_signed_download_url(s3_key)
    return RedirectResponse(url=signed_url)


@router.delete("/{s3_key:path}", response_model=FileDeleteResponse)
async def delete_file(
    s3_key: str,
    current_user: AuthenticatedUser = Depends(get_current_user)
):
    """
    Delete a file by S3 key (user can only delete their own files)
    
    Requires authentication. Users can only delete files they uploaded.
    
    Args:
        s3_key: S3 key of the file to delete
        current_user: Authenticated user context
        
    Returns:
        FileDeleteResponse: Deletion result
        
    Raises:
        401: Authentication required
        403: File doesn't belong to user
        404: File not found
        500: Deletion failed
    """
    file_service = FileService()
    
    # Verify the file belongs to the current user
    if not s3_key.startswith(f"chat/{current_user.user_id}/"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. You can only delete your own files."
        )
    
    return await file_service.delete_file(s3_key)


@router.get("/admin/all-files", response_model=List[FileListResponse])
async def list_all_files(
    current_user: AuthenticatedUser = Depends(get_current_admin_user),
    limit: int = 100,
    user_id: str = None
):
    """
    List all files in the system (admin only)
    
    Requires admin role. Can filter by user_id or list all files.
    
    Args:
        current_user: Authenticated admin user
        limit: Maximum number of files to return (default: 100)
        user_id: Optional user ID to filter files
        
    Returns:
        List[FileListResponse]: List of files (all or filtered by user)
        
    Raises:
        401: Authentication required
        403: Admin access required
        500: Failed to list files
    """
    file_service = FileService()
    if user_id:
        return await file_service.list_user_files(user_id, limit)
    else:
        return await file_service.list_all_files(limit)


@router.delete("/admin/{s3_key:path}", response_model=FileDeleteResponse)
async def admin_delete_file(
    s3_key: str,
    current_user: AuthenticatedUser = Depends(get_current_admin_user)
):
    """
    Delete any file in the system (admin only)
    
    Requires admin role. Can delete any file regardless of owner.
    
    Args:
        s3_key: S3 key of the file to delete
        current_user: Authenticated admin user
        
    Returns:
        FileDeleteResponse: Deletion result
        
    Raises:
        401: Authentication required
        403: Admin access required
        404: File not found
        500: Deletion failed
    """
    file_service = FileService()
    return await file_service.delete_file(s3_key)
