from pydantic import BaseModel, Field
from typing import Optional, List
from enum import Enum

from rialto_shared_types.export_requests import ExportType, ExportStatus

class ProjectType(str, Enum):
    INDIVIDUAL_TAX_RETURN = "INDIVIDUAL_TAX_RETURN"


class ProjectYear(int, Enum):
    YEAR_2020 = 2020
    YEAR_2021 = 2021
    YEAR_2022 = 2022
    YEAR_2023 = 2023
    YEAR_2024 = 2024
    YEAR_2025 = 2025
    YEAR_2026 = 2026


class ProjectStatus(str, Enum):
    REQUESTED = "REQUESTED"  # Docs outstanding, waiting on the client
    PROCESSING = "PROCESSING"  # Automated validations/extractions are being run
    READY_FOR_REVIEW = "READY_FOR_REVIEW"  # Draft project is prepared and ready to be checked
    IN_REVIEW = "IN_REVIEW"  # Project is under review
    FILED = "FILED"  # Project has been submitted


class DocumentType(str, Enum):
    W2 = "W2"  # W-2 Wage and Tax Statement
    DIV_1099 = "1099_DIV"  # 1099-DIV Dividend and Distribution Statement
    K1 = "K1"  # Schedule K-1 Partner's Share of Income
    ORGANIZER = "ORGANIZER"  # Tax organizer document


class DocumentStatus(str, Enum):
    REQUESTED = "REQUESTED"  # We've asked for the document
    RECEIVED = "RECEIVED"  # Document has been submitted
    PROCESSING = "PROCESSING"  # System is validating and extracting information
    REJECTED = "REJECTED"  # Document didn't meet requirements and needs resubmission
    READY_FOR_REVIEW = "READY_FOR_REVIEW"  # Everything is ready for final review
    APPROVED = "APPROVED"  # Approved and complete


class FileStatus(str, Enum):
    UPLOADED = "UPLOADED"  # File has been uploaded to our system
    PROCESSING = "PROCESSING"  # File is being processed/analyzed
    APPROVED = "APPROVED"  # File is approved and current for this document
    REJECTED = "REJECTED"  # File was rejected or superseded


class ProviderType(str, Enum):
    DROPBOX = "DROPBOX"
    EMAIL = "EMAIL"
    QUICKBOOKS = "QUICKBOOKS"
    OUTLOOK = "OUTLOOK"


class FinancialProvider(str, Enum):
    VANGUARD = "VANGUARD"
    SCHWAB = "SCHWAB"
    FIDELITY = "FIDELITY"
    AMERITRADE = "AMERITRADE"
    ETRADE = "ETRADE"
    MORGAN_STANLEY = "MORGAN_STANLEY"
    MERRILL_LYNCH = "MERRILL_LYNCH"

class SourceInfo(BaseModel):
    type: ProviderType  # How the file was obtained (DROPBOX, EMAIL, etc.)
    ref: str  # Reference to the original source (path, email id, etc.)


class FileInfo(BaseModel):
    id: str  # Format: acacia1.file.<uuid>
    status: FileStatus  # Current status of this specific file
    uploadedAt: int  # Unix timestamp in milliseconds when the file was uploaded
    source: SourceInfo
    uri: str  # Signed S3 URL to our internal stored copy


class EngagementSourceType(str, Enum):
    EMAIL = "EMAIL"  # Email communication with client


class EngagementSource(BaseModel):
    type: EngagementSourceType
    ref: str  # Email message ID or thread ID for tracking


class EngagementInfo(BaseModel):
    id: str  # Format: acacia1.engagement.<uuid>
    timestamp: int  # Unix timestamp in milliseconds
    source: EngagementSource


class DocumentInfo(BaseModel):
    id: str  # Format: acacia1.file.<uuid>
    type: DocumentType
    provider: Optional[FinancialProvider] = None  # Financial institution
    required: bool
    status: DocumentStatus
    files: List[FileInfo]  # Files that satisfy this document request
    engagements: List[EngagementInfo]


class Export(BaseModel):
    id: str
    type: ExportType
    name: str
    status: ExportStatus
    requestedAt: int  # Unix timestamp in milliseconds
    lastUpdated: Optional[int] = Field(None, alias="lastUpdated")  # Unix timestamp in milliseconds
    size_kb: Optional[int] = None
    downloadUrl: Optional[str] = None


class ClientInfo(BaseModel):
    id: Optional[str] = None  # Format: acacia1.client.<uuid>
    name: Optional[str] = None
    email: Optional[str] = None


class ProjectTags(BaseModel):
    year: Optional[ProjectYear] = None  # Project year (only supported tag for now)

class ProjectMetadata(BaseModel):
    id: str  # Format: acacia1.project.<uuid> - REQUIRED
    client: Optional[ClientInfo] = None
    type: ProjectType  # REQUIRED
    tags: Optional[ProjectTags] = None  # Project tags (currently only year supported)
    name: str  # REQUIRED
    status: ProjectStatus  # REQUIRED
    lastUpdated: Optional[int] = Field(None, alias="lastUpdated")  # Unix timestamp in milliseconds
    exports: Optional[List[Export]] = None
    
    class Config:
        populate_by_name = True


class ProjectResponse(BaseModel):
    metadata: ProjectMetadata
    documents: List[DocumentInfo]


class ProjectListResponse(BaseModel):
    projects: List[ProjectMetadata]
    nextPageToken: Optional[str] = None


class ProjectQueryParams(BaseModel):
    type: Optional[ProjectType] = None
    year: Optional[ProjectYear] = None  # Filter by year tag
    client_id: Optional[str] = None  # Format: acacia1.client.<uuid>
    status: Optional[ProjectStatus] = None
    pageToken: Optional[str] = None  # Base64 encoded page token for pagination


class ProjectExportRequest(BaseModel):
    type: ExportType
    id: Optional[str] = None
    name: Optional[str] = None
    status: Optional[ExportStatus] = None


class ProjectExportResponse(BaseModel):
    export: Export
