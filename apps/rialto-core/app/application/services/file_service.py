from fastapi import UploadFile, HTTPException
from datetime import datetime
import boto3
from botocore.exceptions import NoCredentialsError, ClientError
import os
import logging
from typing import List

from app.application.schemas.file import FileUploadResponse, FileListResponse, FileDeleteResponse
from app.core.config import settings

logger = logging.getLogger(__name__)


class FileService:
    def __init__(self):
        self.s3_client = None
    
    def _get_s3_client(self):
        """Get or initialize S3 client"""
        if self.s3_client is None:
            try:
                logger.info(f"Initializing S3 client with region: {settings.aws_region}")
                self.s3_client = boto3.client(
                    's3',
                    region_name=settings.aws_region
                )
            except Exception as e:
                logger.error(f"❌ Failed to initialize S3 client: {e}")
                raise HTTPException(status_code=500, detail="Failed to initialize S3 client")
        return self.s3_client

    async def upload_file(self, file: UploadFile, user_id: str) -> FileUploadResponse:
        # Read file content
        file_content = await file.read()
        
        # Check file size
        if len(file_content) > settings.max_file_size:
            raise HTTPException(
                status_code=413, 
                detail=f"File too large. Maximum size: {settings.max_file_size / (10*1024*1024):.1f}MB"
            )
        
        # Check file type
        allowed_types = settings.get_allowed_file_types()
        file_extension = f".{file.filename.split('.')[-1].lower()}" if '.' in file.filename else ""
        if file_extension not in allowed_types:
            raise HTTPException(
                status_code=415,
                detail=f"File type not allowed. Supported types: {', '.join(allowed_types)}"
            )
        
        # Generate S3 key with the requested format: chat/user_id/filename
        timestamp = datetime.utcnow().strftime("%Y%m%d%H%M%S%f")
        s3_key = f"chat/{user_id}/{timestamp}_{file.filename}"
        
        # Get S3 client
        s3_client = self._get_s3_client()
        
        # Upload to S3
        try:
            logger.info(f"📤 Uploading to S3: {s3_key}")
            s3_client.put_object(
                Bucket=settings.s3_bucket_name,
                Key=s3_key,
                Body=file_content,
                ContentType=file.content_type,
                Metadata={
                    'user_id': user_id,
                    'original_filename': file.filename,
                    'upload_timestamp': datetime.utcnow().isoformat()
                }
            )
            
            # Generate S3 URL
            s3_url = f"https://{settings.s3_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"
            logger.info(f"✅ File uploaded to S3: {s3_url}")
            
        except NoCredentialsError:
            logger.error("❌ AWS credentials not found")
            raise HTTPException(status_code=500, detail="AWS credentials not found")
        except ClientError as e:
            logger.error(f"❌ S3 upload failed: {e}")
            raise HTTPException(status_code=500, detail=f"S3 upload failed: {str(e)}")
        
        # Prepare metadata
        metadata = {
            "original_filename": file.filename,
            "content_type": file.content_type,
            "file_size": len(file_content),
            "upload_timestamp": datetime.utcnow().isoformat(),
            "s3_bucket": settings.s3_bucket_name,
            "s3_region": settings.aws_region
        }
        
        return FileUploadResponse(
            success=True,
            s3_url=s3_url,
            s3_key=s3_key,
            metadata=metadata,
            message="File uploaded successfully"
        )
    
    async def list_user_files(self, user_id: str, limit: int = 50) -> List[FileListResponse]:
        """List files uploaded by a specific user"""
        try:
            s3_client = self._get_s3_client()
            prefix = f"chat/{user_id}/"
            
            response = s3_client.list_objects_v2(
                Bucket=settings.s3_bucket_name,
                Prefix=prefix,
                MaxKeys=limit
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    s3_key = obj['Key']
                    s3_url = f"https://{settings.s3_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"
                    
                    # Get object metadata
                    try:
                        head_response = s3_client.head_object(Bucket=settings.s3_bucket_name, Key=s3_key)
                        metadata = head_response.get('Metadata', {})
                        
                        files.append(FileListResponse(
                            s3_key=s3_key,
                            s3_url=s3_url,
                            filename=metadata.get('original_filename', s3_key.split('/')[-1]),
                            content_type=head_response.get('ContentType', 'application/octet-stream'),
                            file_size=obj['Size'],
                            upload_timestamp=obj['LastModified'],
                            user_id=user_id
                        ))
                    except Exception as e:
                        logger.warning(f"Failed to get metadata for {s3_key}: {e}")
                        continue
            
            return files
            
        except Exception as e:
            logger.error(f"Failed to list user files: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")
    
    async def list_all_files(self, limit: int = 100) -> List[FileListResponse]:
        """List all files in the system (admin only)"""
        try:
            s3_client = self._get_s3_client()
            prefix = "chat/"
            
            response = s3_client.list_objects_v2(
                Bucket=settings.s3_bucket_name,
                Prefix=prefix,
                MaxKeys=limit
            )
            
            files = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    s3_key = obj['Key']
                    s3_url = f"https://{settings.s3_bucket_name}.s3.{settings.aws_region}.amazonaws.com/{s3_key}"
                    
                    # Extract user_id from s3_key (format: chat/user_id/filename)
                    path_parts = s3_key.split('/')
                    user_id = path_parts[1] if len(path_parts) >= 3 else "unknown"
                    
                    # Get object metadata
                    try:
                        head_response = s3_client.head_object(Bucket=settings.s3_bucket_name, Key=s3_key)
                        metadata = head_response.get('Metadata', {})
                        
                        files.append(FileListResponse(
                            s3_key=s3_key,
                            s3_url=s3_url,
                            filename=metadata.get('original_filename', s3_key.split('/')[-1]),
                            content_type=head_response.get('ContentType', 'application/octet-stream'),
                            file_size=obj['Size'],
                            upload_timestamp=obj['LastModified'],
                            user_id=user_id
                        ))
                    except Exception as e:
                        logger.warning(f"Failed to get metadata for {s3_key}: {e}")
                        continue
            
            return files
            
        except Exception as e:
            logger.error(f"Failed to list all files: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")
    
    async def get_signed_download_url(self, s3_key: str, expiration: int = 3600) -> str:
        """Generate a signed URL for downloading a file"""
        try:
            s3_client = self._get_s3_client()
            
            # Check if file exists
            try:
                s3_client.head_object(Bucket=settings.s3_bucket_name, Key=s3_key)
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    raise HTTPException(status_code=404, detail="File not found")
                raise
            
            # Generate signed URL
            signed_url = s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': settings.s3_bucket_name, 'Key': s3_key},
                ExpiresIn=expiration
            )
            
            return signed_url
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to generate signed URL: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to generate download URL: {str(e)}")
    
    async def delete_file(self, s3_key: str) -> FileDeleteResponse:
        """Delete a file from S3"""
        try:
            s3_client = self._get_s3_client()
            
            # Check if file exists
            try:
                s3_client.head_object(Bucket=settings.s3_bucket_name, Key=s3_key)
            except ClientError as e:
                if e.response['Error']['Code'] == '404':
                    raise HTTPException(status_code=404, detail="File not found")
                raise
            
            # Delete the file
            s3_client.delete_object(Bucket=settings.s3_bucket_name, Key=s3_key)
            
            logger.info(f"✅ File deleted from S3: {s3_key}")
            
            return FileDeleteResponse(
                success=True,
                s3_key=s3_key,
                message="File deleted successfully"
            )
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Failed to delete file: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}") 