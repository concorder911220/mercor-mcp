from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import Optional
import logging
import uuid

from app.application.services.project_service import ProjectService
from app.application.services.sqs_service import sqs_service
from app.application.schemas.project import Export, ProjectExportRequest, ProjectExportResponse, ProjectListResponse, ProjectQueryParams, ProjectType, ProjectStatus, ProjectYear, ProjectResponse
from app.application.schemas.auth import AuthenticatedUser
from app.core.dependencies import get_current_user, get_project_service
from rialto_shared_types.export_requests import TaxPrepExportRequest, ExportStatus

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/projects", tags=["projects"])


@router.get("", response_model=ProjectListResponse)
@router.get("/", response_model=ProjectListResponse)
def get_projects(
    type: Optional[ProjectType] = Query(None, description="Filter by project type"),
    year: Optional[ProjectYear] = Query(None, description="Filter by year tag"),
    project_status: Optional[ProjectStatus] = Query(None, alias="status", description="Filter by project status"),
    page_token: Optional[str] = Query(None, alias="pageToken", description="Page token for pagination (base64 encoded)"),
    current_user: AuthenticatedUser = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """
    Get projects for the authenticated user with cursor-based pagination and optional filtering
    
    Returns only projects belonging to the authenticated user. Supports filtering by:
    - type: Project type (INDIVIDUAL_TAX_RETURN)
    - year: Filter by year tag (2020-2026)
    - status: Project status (REQUESTED, PROCESSING, READY_FOR_REVIEW, IN_REVIEW, FILED)
    
    Pagination:
    - Page size is fixed at 20 projects per page
    - Use 'pageToken' parameter to get next page
    - Response includes 'nextPageToken' field (null if no more pages)
    - Results are sorted by lastUpdated descending (newest first)
    
    Args:
        type: Optional project type filter
        year: Optional year tag filter
        status: Optional status filter
        page_token: Optional page token for pagination (from previous response)
        current_user: Authenticated user context
        
    Returns:
        ProjectListResponse: Paginated response with projects and nextPageToken
        
    Raises:
        401: Authentication required
        500: Failed to retrieve projects
    """
    try:
        # TODO: Remove this hardcoded override for testing
        test_user_id = "acacia1.user.ac4acaf3-1172-42a6-9c02-c9298024b88d"
        
        # Create query parameters (optional)
        query_params = None
        if any([type, year, project_status, page_token]):
            query_params = ProjectQueryParams(
                type=type,
                year=year,
                status=project_status,
                pageToken=page_token
            )
        
        # Get projects from service
        response = project_service.get_projects(test_user_id, query_params)
        
        return response
        
    except Exception as e:
        # Log the error for debugging
        logger.error(f"Error retrieving projects: {str(e)}", exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve projects: {str(e)}"
        )


@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: str,
    current_user: AuthenticatedUser = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """
    Get a specific project by ID with detailed document information
    
    Only returns the project if it belongs to the authenticated user.
    Authorization is handled by DynamoDB GSI query.
    
    Args:
        project_id: Project ID (format: acacia1.project.<uuid>)
        current_user: Authenticated user context
        
    Returns:
        ProjectResponse: Project details with overview and documents
        
    Raises:
        401: Authentication required
        404: Project not found or not owned by user
        500: Failed to retrieve project
    """
    try:
        # TODO: Remove this hardcoded override for testing
        test_user_id = "acacia1.user.ac4acaf3-1172-42a6-9c02-c9298024b88d"
        
        project_details = project_service.get_project(project_id, test_user_id)
        
        if not project_details:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )
        
        return project_details
        
    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging
        logger.error(f"Error retrieving project {project_id}: {str(e)}", exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve project: {str(e)}"
        )


@router.post("/{project_id}/exports", response_model=ProjectExportResponse)
def exports(
    project_id: str,
    export_request: ProjectExportRequest,
    current_user: AuthenticatedUser = Depends(get_current_user),
    project_service: ProjectService = Depends(get_project_service)
):
    """
    Creates or updates an existing export for a specific project
    
    Only returns the export if it belongs to the authenticated user.
    Authorization is handled by DynamoDB GSI query.
    
    Args:
        project_id: Project ID (format: acacia1.project.<uuid>)
        export_request: Export request
        current_user: Authenticated user context
        project_service: Project service
        
    Returns:
        ProjectExportResponse: Export details
        
    Raises:
        401: Authentication required
        404: Project not found or not owned by user
        500: Failed to create export
    """
    try:
        # TODO: Remove this hardcoded override for testing
        test_user_id = "acacia1.user.ac4acaf3-1172-42a6-9c02-c9298024b88d"

        print(f"Export for project {project_id} with request {export_request}")

        project_metadata = project_service.get_project_by_id(project_id, test_user_id)
        current_export = None
        if not project_metadata:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Project not found"
            )

        current_time_ms = int(datetime.now().timestamp() * 1000)
        if export_request.id:
            # Update existing export
            exports = project_metadata.exports or []
            current_export = next((e for e in exports if e.id == export_request.id), None)
            other_exports = [e for e in exports if e.id != export_request.id]
            if not current_export:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Export not found"
                )
            current_export.status = export_request.status if export_request.status else current_export.status
            current_export.lastUpdated = current_time_ms
            project_metadata.exports = other_exports + [current_export]
        else:
            # Create new export if one of same type not already in-flight
            existing_export = next((e for e in project_metadata.exports or [] if e.type == export_request.type and e.status not in [ExportStatus.AVAILABLE, ExportStatus.FAILED]), None)
            if (
                existing_export
                and existing_export.requestedAt
                and (current_time_ms - existing_export.requestedAt) < 12 * 60 * 60 * 1000  # 12 hours in ms
            ):
                # If requested less than 12 hours ago, return existing without update
                current_export = existing_export
                return ProjectExportResponse(export=current_export)

            # Create new export
            current_export = Export(
                id=f'acacia.project-export.{str(uuid.uuid4())}',
                type=export_request.type,
                name=export_request.name if export_request.name else f'Export on {datetime.now().strftime("%Y-%m-%d")}',
                status=ExportStatus.IN_PROGRESS,
                requestedAt=current_time_ms,
                lastUpdated=current_time_ms
            )

            exports = project_metadata.exports or []
            exports.append(current_export)
            project_metadata.exports = exports

            # Assume Tax Prep export request
            tax_export_request = TaxPrepExportRequest(
                type=export_request.type,
                taxDocs=[]  # TODO fetch tax docs from database
            )

            # Send message to SQS queue using the encapsulated service method
            sqs_service.send_tax_export_request(
                project_id=project_id,
                export_id=current_export.id,
                user_id=test_user_id,
                export_request=tax_export_request
            )

        project_service.write_project(project_metadata, test_user_id)
        return ProjectExportResponse(export=current_export)

    except HTTPException:
        raise
    except Exception as e:
        # Log the error for debugging
        logger.error(f"Error retrieving project {project_id}: {str(e)}", exc_info=True)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process export: {str(e)}"
        )
