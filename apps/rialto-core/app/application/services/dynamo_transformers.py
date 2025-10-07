"""
DynamoDB transformation utilities for converting between:
1. Raw DynamoDB items and Dynamo Pydantic shapes
2. Dynamo Pydantic shapes and API Pydantic shapes
"""
import logging
from typing import Dict, Any, Optional

from app.application.schemas.dynamo.dynamo_project import (
    DynamoExport,
    DynamoExportStatus,
    DynamoExportType,
    DynamoProjectMetadata,
    DynamoProjectType,
    DynamoProjectYear,
    DynamoProjectStatus,
)

from app.application.schemas.project import (
    ClientInfo,
    Export,
    ProjectMetadata,
    ProjectTags,
    ProjectType,
    ProjectYear,
    ProjectStatus,
)

from rialto_shared_types import ExportType, ExportStatus

logger = logging.getLogger(__name__)


class DynamoTransformers:
    """Utility class for transforming between DynamoDB items and Pydantic shapes"""

    @staticmethod
    def dynamodb_item_to_dynamo_project_metadata(item: Dict[str, Any]) -> Optional[DynamoProjectMetadata]:
        """
        Transform raw DynamoDB item to DynamoProjectMetadata

        Args:
            item: Raw DynamoDB item dict

        Returns:
            DynamoProjectMetadata or None if transformation fails
        """
        try:
            print(f"Item: {item}")
            dynamo_project_metadata = DynamoProjectMetadata.model_validate(item)
            print(f"Dynamo project metadata: {dynamo_project_metadata.model_dump_json()}")
            return dynamo_project_metadata

        except (ValueError, TypeError, KeyError) as e:
            logger.error(f"Failed to transform DynamoDB item to DynamoProjectMetadata: {item}, error: {e}")
            return None

    @staticmethod
    def dynamo_project_metadata_to_dynamodb_item(metadata: DynamoProjectMetadata) -> Dict[str, Any]:
        """
        Transform DynamoProjectMetadata to raw DynamoDB item format

        Args:
            metadata: DynamoProjectMetadata object

        Returns:
            Dict suitable for DynamoDB put_item
        """
        return metadata.model_dump(mode='json', exclude_none=True)

    @staticmethod
    def dynamo_to_api_project_metadata(dynamo_metadata: DynamoProjectMetadata) -> ProjectMetadata:
        """
        Transform DynamoProjectMetadata to API ProjectMetadata

        Args:
            dynamo_metadata: DynamoProjectMetadata object

        Returns:
            ProjectMetadata for API responses
        """
        print(f"Dynamo metadata: {dynamo_metadata}")

        # Transform client info
        client = ClientInfo(
            id=dynamo_metadata.clientId,
            name=dynamo_metadata.clientName,
            email=dynamo_metadata.clientEmail
        )

        # Transform tags
        tags = ProjectTags(year=ProjectYear(dynamo_metadata.year.value))

        # Transform exports
        exports = None
        if dynamo_metadata.exports:
            api_exports = []
            for dynamo_export in dynamo_metadata.exports:
                api_export = Export(
                    id=dynamo_export.id,
                    type=ExportType(dynamo_export.type.value),
                    name=dynamo_export.name,
                    status=ExportStatus(dynamo_export.status.value),
                    requestedAt=dynamo_export.requestedAt,
                    lastUpdated=dynamo_export.lastUpdated,
                    size_kb=dynamo_export.size_kb,
                    downloadUrl=dynamo_export.downloadUrl
                )
                api_exports.append(api_export)
            exports = api_exports

        return ProjectMetadata(
            id=dynamo_metadata.id,
            client=client,
            type=ProjectType(dynamo_metadata.type.value),
            tags=tags,
            name=dynamo_metadata.name,
            status=ProjectStatus(dynamo_metadata.status.value),
            lastUpdated=dynamo_metadata.lastUpdated,
            exports=exports
        )

    @staticmethod
    def api_to_dynamo_project_metadata(api_metadata: ProjectMetadata, user_id: str) -> DynamoProjectMetadata:
        """
        Transform API ProjectMetadata to DynamoProjectMetadata

        Args:
            api_metadata: ProjectMetadata from API
            user_id: User ID to include in DynamoProjectMetadata

        Returns:
            DynamoProjectMetadata for DynamoDB operations
        """
        # Transform exports
        exports = None
        if api_metadata.exports:
            dynamo_exports = []
            for api_export in api_metadata.exports:
                dynamo_export = DynamoExport(
                    id=api_export.id,
                    type=DynamoExportType(api_export.type.value),
                    name=api_export.name,
                    status=DynamoExportStatus(api_export.status.value),
                    requestedAt=api_export.requestedAt,
                    lastUpdated=api_export.lastUpdated,
                    size_kb=api_export.size_kb,
                    downloadUrl=api_export.downloadUrl
                )
                dynamo_exports.append(dynamo_export)
            exports = dynamo_exports

        return DynamoProjectMetadata(
            id=api_metadata.id,
            clientId=api_metadata.client.id if api_metadata.client else None,
            clientName=api_metadata.client.name if api_metadata.client else None,
            clientEmail=api_metadata.client.email if api_metadata.client else None,
            year=DynamoProjectYear(api_metadata.tags.year.value) if api_metadata.tags else None,
            type=DynamoProjectType(api_metadata.type.value),
            name=api_metadata.name,
            status=DynamoProjectStatus(api_metadata.status.value),
            userId=user_id,
            lastUpdated=api_metadata.lastUpdated,
            exports=exports
        )

