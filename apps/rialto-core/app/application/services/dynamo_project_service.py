"""
DynamoDB Project Service - Enhanced service methods that use DynamoDB Pydantic shapes and transformers
"""
import logging
from typing import Optional, List, Tuple

import boto3
from boto3.dynamodb.conditions import Attr, Key
from botocore.exceptions import ClientError, NoCredentialsError

from app.core.config import settings
from app.application.schemas.dynamo.dynamo_project import (
    DynamoProjectMetadata,
    DynamoProjectType,
    DynamoProjectYear,
    DynamoProjectStatus,
)
from app.application.schemas.project import ProjectQueryParams
from app.application.services.dynamo_transformers import DynamoTransformers

logger = logging.getLogger(__name__)


class DynamoProjectService:
    """
    Enhanced service methods that use DynamoDB Pydantic shapes and transformers
    """

    # Hardcoded page size - no configurable limits
    PAGE_SIZE = 20

    def __init__(self):
        self.dynamodb_resource = None
        self.transformers = DynamoTransformers()

    def _get_dynamodb_resource(self):
        """Get or initialize DynamoDB resource (higher-level API)"""
        if self.dynamodb_resource is None:
            try:
                logger.info(f"Initializing DynamoDB resource with region: {settings.aws_region}")
                self.dynamodb_resource = boto3.resource(
                    'dynamodb',
                    region_name=settings.aws_region
                )
            except Exception as e:
                logger.error(f"Failed to initialize DynamoDB resource: {e}")
                raise Exception("Failed to initialize DynamoDB resource")
        return self.dynamodb_resource

    def _build_filter_conditions(self, query_params: ProjectQueryParams) -> List:
        """
        Build DynamoDB filter conditions with enum validation

        Args:
            query_params: ProjectQueryParams with filters

        Returns:
            list: DynamoDB filter conditions
        """
        conditions = []

        if query_params.type:
            conditions.append(Attr('type').eq(query_params.type.value))

        if query_params.year:
            conditions.append(Attr('year').eq(query_params.year.value))

        if query_params.status:
            conditions.append(Attr('status').eq(query_params.status.value))

        return conditions

    def query_projects(self, user_id: str, query_params: Optional[ProjectQueryParams] = None,
                      exclusive_start_key: Optional[dict] = None) -> Tuple[List[DynamoProjectMetadata], Optional[dict]]:
        """
        Query projects for a specific user using GSI with cursor-based pagination

        Args:
            user_id: User ID to query projects for
            query_params: Optional ProjectQueryParams with filters
            exclusive_start_key: DynamoDB LastEvaluatedKey for pagination

        Returns:
            Tuple of (list of DynamoProjectMetadata, LastEvaluatedKey for next page or None)
        """
        # Handle optional query_params
        if query_params is None:
            query_params = ProjectQueryParams()

        logger.info(f"Getting projects for user {user_id} with filters: type={query_params.type}, year={query_params.year}, status={query_params.status}")

        # Build filter conditions with enum validation
        conditions = self._build_filter_conditions(query_params)

        # Log filter status for debugging
        if conditions:
            logger.info(f"Applied {len(conditions)} filter conditions")
        else:
            logger.info("No filters applied - returning all projects for user")

        # Build filter expression from conditions
        filter_expression = None
        if conditions:
            filter_expression = conditions[0]
            for condition in conditions[1:]:
                filter_expression = filter_expression & condition

        # Query parameters for GSI
        query_kwargs = {
            'IndexName': 'userId-index',
            'KeyConditionExpression': Key('userId').eq(user_id),
            'Limit': self.PAGE_SIZE,
            'ScanIndexForward': False  # Sort by lastUpdated descending (newest first)
        }

        if filter_expression:
            query_kwargs['FilterExpression'] = filter_expression

        # Handle pagination with DynamoDB's LastEvaluatedKey
        if exclusive_start_key:
            query_kwargs['ExclusiveStartKey'] = exclusive_start_key
            logger.info(f"Pagination: Continuing from LastEvaluatedKey")
        else:
            logger.info("Pagination: Starting from beginning (first page)")

        # Execute DynamoDB query
        try:
            dynamodb_resource = self._get_dynamodb_resource()
            table = dynamodb_resource.Table(settings.projects_table_name)
            logger.info(f"Executing DynamoDB query on userId-index with params: Limit={query_kwargs['Limit']}, ScanIndexForward={query_kwargs['ScanIndexForward']}, HasFilter={filter_expression is not None}")

            response = table.query(**query_kwargs)
        except NoCredentialsError as e:
            logger.error("AWS credentials not found")
            raise Exception("AWS credentials not found. Please check your AWS configuration.")
        except ClientError as e:
            error_code = e.response.get('Error', {}).get('Code', 'Unknown')
            error_message = e.response.get('Error', {}).get('Message', str(e))
            logger.error(f"DynamoDB query failed - Code: {error_code}, Message: {error_message}")
            raise Exception(f"DynamoDB query failed: {error_message}")
        except Exception as e:
            logger.error(f"Unexpected error during DynamoDB query: {e}")
            raise Exception(f"Failed to query projects: {str(e)}")

        # Convert DynamoDB items to DynamoProjectMetadata objects using transformers
        projects = []
        excluded_count = 0
        for item in response.get('Items', []):
            # Transform DynamoDB item to Dynamo schema
            dynamo_metadata = self.transformers.dynamodb_item_to_dynamo_project_metadata(item)

            if not dynamo_metadata:
                excluded_count += 1
                continue

            projects.append(dynamo_metadata)

        # Log final results
        logger.info(f"Query completed: Retrieved {len(projects)} projects from DynamoDB (excluded {excluded_count} invalid items)")

        # Return projects and LastEvaluatedKey for pagination
        return projects, response.get('LastEvaluatedKey')

    def get_dynamo_project_metadata(self, project_id: str) -> Optional[DynamoProjectMetadata]:
        """
        Get DynamoProjectMetadata directly from DynamoDB using proper transformations

        Args:
            project_id: Project ID to retrieve

        Returns:
            DynamoProjectMetadata or None if not found
        """
        try:
            dynamodb_resource = self._get_dynamodb_resource()
            table = dynamodb_resource.Table(settings.projects_table_name)
            response = table.get_item(Key={'id': project_id})

            if 'Item' not in response:
                return None

            return self.transformers.dynamodb_item_to_dynamo_project_metadata(response['Item'])

        except Exception as e:
            logger.error(f"Failed to get DynamoDB project metadata for {project_id}: {e}")
            return None

    def write_dynamo_project_metadata(self, metadata: DynamoProjectMetadata) -> bool:
        """
        Write DynamoProjectMetadata to DynamoDB using proper transformations

        Args:
            metadata: DynamoProjectMetadata to write

        Returns:
            True if successful, False otherwise
        """
        try:
            dynamodb_resource = self._get_dynamodb_resource()
            table = dynamodb_resource.Table(settings.projects_table_name)
            item = self.transformers.dynamo_project_metadata_to_dynamodb_item(metadata)
            table.put_item(Item=item)
            return True

        except Exception as e:
            logger.error(f"Failed to write DynamoDB project metadata for {metadata.id}: {e}")
            return False