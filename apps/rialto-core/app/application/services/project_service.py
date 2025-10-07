# Standard library imports
import base64
import json
import logging
import time
from typing import Optional
import uuid

# Third-party imports
import boto3
from botocore.exceptions import ClientError, NoCredentialsError

# Local application imports
from app.core.config import settings
from app.application.schemas.project import (
    Export,
    ExportStatus,
    ProjectExportRequest,
    ProjectExportResponse,
    ProjectListResponse,
    ProjectMetadata,
    ProjectQueryParams,
    ProjectResponse,
)
from app.application.services.dynamo_transformers import DynamoTransformers
from app.application.services.dynamo_project_service import DynamoProjectService

logger = logging.getLogger(__name__)


class ProjectService:
    # Hardcoded page size - no configurable limits
    PAGE_SIZE = 20
    
    def __init__(self):
        self.transformers = DynamoTransformers()
        self.s3_client = None
        self._dynamo_service = None
    
    def _get_dynamo_service(self):
        """Get or initialize DynamoProjectService with proper transformers"""
        if self._dynamo_service is None:
            self._dynamo_service = DynamoProjectService()
        return self._dynamo_service
    
    def _encode_cursor(self, last_evaluated_key: dict) -> str:
        """Encode DynamoDB LastEvaluatedKey as cursor"""
        cursor_json = json.dumps(last_evaluated_key)
        return base64.b64encode(cursor_json.encode()).decode()
    
    def _decode_cursor(self, cursor: str) -> dict:
        """Decode cursor to get DynamoDB LastEvaluatedKey"""
        try:
            cursor_json = base64.b64decode(cursor.encode()).decode()
            return json.loads(cursor_json)
        except Exception as e:
            logger.warning(f"Invalid cursor format: {e}")
            raise ValueError("Invalid cursor format")
    
    def _get_s3_client(self) -> boto3.client:
        """Get or initialize S3 client"""
        if self.s3_client is None:
            try:
                logger.info(f"Initializing S3 client with region: {settings.aws_region}")
                self.s3_client = boto3.client('s3', region_name=settings.aws_region)
            except Exception as e:
                logger.error(f"Failed to initialize S3 client: {e}")
                raise Exception("Failed to initialize S3 client")
        return self.s3_client
    

    def _sign_s3_url(self, s3_url: str, duration_seconds: int = 3600) -> str:
        """
        Sign an S3 URL with the current user's credentials

        Args:
            s3_url: S3 URL to sign, e.g., s3://my-bucket/my-folder/my-file.pdf

        Returns:
            Signed S3 URL
        """
        try:
            s3_client = self._get_s3_client()
            bucket_name = s3_url.split('/')[2]
            key = '/'.join(s3_url.split('/')[3:])
            return s3_client.generate_presigned_url('get_object', Params={'Bucket': bucket_name, 'Key': key}, ExpiresIn=duration_seconds)
        except Exception as e:
            logger.error(f"Failed to sign S3 URL: {e}")
            raise Exception(f"Failed to sign S3 URL: {str(e)}")
    
    def get_projects(self, user_id: str, query_params: Optional[ProjectQueryParams] = None) -> ProjectListResponse:
        """
        Get projects for a specific user using GSI with cursor-based pagination

        Args:
            user_id: User ID to query projects for
            query_params: Optional ProjectQueryParams with filters and pagination

        Returns:
            ProjectListResponse: Paginated response with projects and next cursor
        """
        # Handle optional query_params
        if query_params is None:
            query_params = ProjectQueryParams()

        logger.info(f"Getting projects for user {user_id} with filters: type={query_params.type}, year={query_params.year}, status={query_params.status}, pageToken={'present' if query_params.pageToken else 'none'}")

        # Handle pagination cursor
        exclusive_start_key = None
        if query_params.pageToken:
            try:
                exclusive_start_key = self._decode_cursor(query_params.pageToken)
            except ValueError:
                # Invalid cursor, return empty result
                logger.warning(f"Invalid pageToken provided: {query_params.pageToken}")
                return ProjectListResponse(projects=[], nextPageToken=None)

        # Use DynamoProjectService to query projects
        dynamo_service = self._get_dynamo_service()
        dynamo_projects, last_evaluated_key = dynamo_service.query_projects(
            user_id, query_params, exclusive_start_key
        )

        # Transform Dynamo schemas to API schemas
        project_metadata_list = []
        for dynamo_project in dynamo_projects:
            try:
                project_metadata = self.transformers.dynamo_to_api_project_metadata(dynamo_project)
                project_metadata_list.append(project_metadata)
            except (ValueError, TypeError, KeyError) as e:
                logger.warning(f"Failed to transform project: {dynamo_project.id}, error: {e}")
                continue

        # Generate next page token if there are more items
        nextPageToken = None
        if last_evaluated_key:
            nextPageToken = self._encode_cursor(last_evaluated_key)
            logger.info(f"Pagination: More pages available, nextPageToken generated")
        else:
            logger.info(f"Pagination: No more pages available")

        logger.info(f"Query completed: Retrieved {len(project_metadata_list)} projects")
        return ProjectListResponse(
            projects=project_metadata_list,
            nextPageToken=nextPageToken
        )
    
    def get_project_by_id(self, project_id: str, user_id: str) -> Optional[ProjectMetadata]:
        """
        Get a specific project by ID, ensuring it belongs to the user.

        Args:
            project_id: Project ID (format: acacia1.project.<uuid>)
            user_id: User ID to verify ownership

        Returns:
            ProjectMetadata or None if not found or not owned by user
        """
        logger.info(f"Getting project {project_id} from DynamoDB for user {user_id}")

        try:
            # Use DynamoProjectService to get the dynamo metadata
            dynamo_service = self._get_dynamo_service()
            dynamo_metadata = dynamo_service.get_dynamo_project_metadata(project_id)

            if not dynamo_metadata:
                logger.info(f"Project {project_id} not found in DynamoDB")
                return None

            # Validate ownership (authorization)
            if dynamo_metadata.userId != user_id:
                logger.info(f"Project {project_id} not owned by user {user_id}")
                return None

            # Transform to API schema
            project_metadata = self.transformers.dynamo_to_api_project_metadata(dynamo_metadata)

            logger.info(f"Successfully retrieved project {project_id} from DynamoDB")
            return project_metadata

        except NoCredentialsError as e:
            logger.error("AWS credentials not found")
            raise Exception("AWS credentials not found. Please check your AWS configuration.")
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            logger.error(f"DynamoDB get_item failed - Code: {error_code}, Message: {error_message}")
            raise Exception(f"DynamoDB query failed: {error_message}")
        except Exception as e:
            logger.error(f"Unexpected error during DynamoDB get_item: {e}")
            raise Exception(f"Failed to retrieve project: {str(e)}")
    
    def get_project(self, project_id: str, user_id: str) -> Optional[ProjectResponse]:
        """
        Get project information including documents, revisions, and engagements
        
        Args:
            project_id: Project ID (format: acacia1.project.<uuid>)
            user_id: User ID to verify ownership
            
        Returns:
            ProjectResponse or None if not found or not owned by user
        """
        try:
            # Get project metadata from DynamoDB with authorization
            project_metadata = self.get_project_by_id(project_id, user_id)
            if not project_metadata:
                return None
            
            # TODO: Implement document retrieval from DynamoDB
            # For now, return empty documents list
            # This would typically query a documents table or related service
            documents = []
            
            logger.info(f"Successfully retrieved project details for {project_id} from DynamoDB")
            return ProjectResponse(metadata=project_metadata, documents=documents)
            
        except Exception as e:
            logger.error(f"Failed to get project details {project_id}: {e}")
            raise Exception(f"Failed to retrieve project details: {str(e)}")
    
    def write_project(self, project_metadata: ProjectMetadata, user_id: str) -> ProjectMetadata:
        """
        Write a project metadata object to DynamoDB

        Args:
            project_metadata: ProjectMetadata object to write to DynamoDB
            user_id: User ID for the project (required for dynamo schema)

        Returns:
            ProjectMetadata written to DynamoDB
        """
        try:
            # Transform API schema to Dynamo schema
            dynamo_metadata = self.transformers.api_to_dynamo_project_metadata(project_metadata, user_id)

            # Use DynamoProjectService to write with proper transformations
            dynamo_service = self._get_dynamo_service()
            success = dynamo_service.write_dynamo_project_metadata(dynamo_metadata)

            if not success:
                raise Exception("Failed to write project metadata to DynamoDB")

            return project_metadata
        except Exception as e:
            logger.error(f"Failed to write project metadata to DynamoDB: {e}")
            raise Exception(f"Failed to write project metadata: {str(e)}")

    def create_export(self, project_id: str, export_request: ProjectExportRequest, user_id: str) -> Optional[ProjectExportResponse]:
        """
        Create a specific export for a specific project
        """
        try:
            # Get project metadata from DynamoDB with authorization
            project_metadata = self.get_project_by_id(project_id, user_id)
            if not project_metadata:
                return None

            current_timestamp = int(time.time() * 1000)  # Unix timestamp in milliseconds
            export = Export(
                id=f'acacia.project-export.{str(uuid.uuid4())}',
                name=export_request.name if export_request.name else f'Export for {export_request.type.value}',
                status=ExportStatus.IN_PROGRESS,
                requestedAt=current_timestamp,
                lastUpdated=current_timestamp
            )

            exports = project_metadata.exports or []
            exports.append(export)
            project_metadata.exports = exports

            # TODO fetch documents for export
            # TODO construct and send SQS message

            self.write_project(project_metadata, user_id)

            return ProjectExportResponse(export=export)

        
        except Exception as e:
            logger.error(f"Failed to create export for project {project_id}: {e}")
            raise Exception(f"Failed to create export: {str(e)}")