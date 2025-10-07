from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional, List, Union, Dict, Any
from enum import Enum


class DynamoProjectType(str, Enum):
    INDIVIDUAL_TAX_RETURN = "INDIVIDUAL_TAX_RETURN"


class DynamoProjectYear(int, Enum):
    YEAR_2020 = 2020
    YEAR_2021 = 2021
    YEAR_2022 = 2022
    YEAR_2023 = 2023
    YEAR_2024 = 2024
    YEAR_2025 = 2025
    YEAR_2026 = 2026


class DynamoProjectStatus(str, Enum):
    REQUESTED = "REQUESTED"  # Docs outstanding, waiting on the client
    PROCESSING = "PROCESSING"  # Automated validations/extractions are being run
    READY_FOR_REVIEW = "READY_FOR_REVIEW"  # Draft project is prepared and ready to be checked
    IN_REVIEW = "IN_REVIEW"  # Project is under review
    FILED = "FILED"  # Project has been submitted


class DynamoDocumentType(str, Enum):
    W2 = "W2"  # W-2 Wage and Tax Statement
    DIV_1099 = "1099_DIV"  # 1099-DIV Dividend and Distribution Statement
    K1 = "K1"  # Schedule K-1 Partner's Share of Income
    ORGANIZER = "ORGANIZER"  # Tax organizer document


class DynamoDocumentStatus(str, Enum):
    REQUESTED = "REQUESTED"  # We've asked for the document
    RECEIVED = "RECEIVED"  # Document has been submitted
    PROCESSING = "PROCESSING"  # System is validating and extracting information
    REJECTED = "REJECTED"  # Document didn't meet requirements and needs resubmission
    READY_FOR_REVIEW = "READY_FOR_REVIEW"  # Everything is ready for final review
    APPROVED = "APPROVED"  # Approved and complete


class DynamoFileStatus(str, Enum):
    UPLOADED = "UPLOADED"  # File has been uploaded to our system
    PROCESSING = "PROCESSING"  # File is being processed/analyzed
    APPROVED = "APPROVED"  # File is approved and current for this document
    REJECTED = "REJECTED"  # File was rejected or superseded


class DynamoProviderType(str, Enum):
    DROPBOX = "DROPBOX"
    EMAIL = "EMAIL"
    QUICKBOOKS = "QUICKBOOKS"
    OUTLOOK = "OUTLOOK"


class DynamoFinancialProvider(str, Enum):
    VANGUARD = "VANGUARD"
    SCHWAB = "SCHWAB"
    FIDELITY = "FIDELITY"
    AMERITRADE = "AMERITRADE"
    ETRADE = "ETRADE"
    MORGAN_STANLEY = "MORGAN_STANLEY"
    MERRILL_LYNCH = "MERRILL_LYNCH"

class DynamoExportStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    AVAILABLE = "AVAILABLE"
    FAILED = "FAILED"

class DynamoExportType(str, Enum):
    DRAKE_TAX = "DRAKE_TAX"
    INTUIT_PRO_SERIES = "INTUIT_PRO_SERIES"
    INTUIT_LACERTE_TAX = "INTUIT_LACERTE_TAX"
    ULTRA_TAX_SOFTWARE = "ULTRA_TAX_SOFTWARE"
    ATX = "ATX"
    CCH_AXCESS_TAX = "CCH_AXCESS_TAX"
    CCH_PRO_SYSTEMS_FX_TAX = "CCH_PRO_SYSTEMS_FX_TAX"

    CLIENT_BINDER = "CLIENT_BINDER"
    TIE_OUTS = "TIE_OUTS"

class DynamoSourceInfo(BaseModel):
    type: DynamoProviderType  # How the file was obtained (DROPBOX, EMAIL, etc.)
    ref: str  # Reference to the original source (path, email id, etc.)


class DynamoFileInfo(BaseModel):
    id: str  # Format: acacia1.file.<uuid>
    status: DynamoFileStatus  # Current status of this specific file
    uploadedAt: int  # Unix timestamp in milliseconds when the file was uploaded
    source: DynamoSourceInfo
    uri: str  # Signed S3 URL to our internal stored copy


class DynamoEngagementSourceType(str, Enum):
    EMAIL = "EMAIL"  # Email communication with client


class DynamoEngagementSource(BaseModel):
    type: DynamoEngagementSourceType
    ref: str  # Email message ID or thread ID for tracking


class DynamoEngagementInfo(BaseModel):
    id: str  # Format: acacia1.engagement.<uuid>
    timestamp: int  # Unix timestamp in milliseconds
    source: DynamoEngagementSource


class DynamoDocumentInfo(BaseModel):
    id: str  # Format: acacia1.file.<uuid>
    type: DynamoDocumentType
    provider: Optional[DynamoFinancialProvider] = None  # Financial institution
    required: bool
    status: DynamoDocumentStatus
    files: List[DynamoFileInfo]  # Files that satisfy this document request
    engagements: List[DynamoEngagementInfo]


class DynamoExport(BaseModel):
    id: str
    type: DynamoExportType
    name: str
    status: DynamoExportStatus
    requestedAt: int  # Unix timestamp in milliseconds
    lastUpdated: Optional[int] = Field(None, alias="lastUpdated")  # Unix timestamp in milliseconds
    size_kb: Optional[int] = None
    downloadUrl: Optional[str] = None


class DynamoClientInfo(BaseModel):
    id: Optional[str] = None  # Format: acacia1.client.<uuid>
    name: Optional[str] = None
    email: Optional[str] = None


class DynamoProjectTags(BaseModel):
    year: Optional[DynamoProjectYear] = None  # Project year (only supported tag for now)

class DynamoProjectMetadata(BaseModel):
    id: str  # Format: acacia1.project.<uuid> - REQUIRED
    clientId: Optional[str] = None
    clientName: Optional[str] = None
    clientEmail: Optional[str] = None
    year: Optional[DynamoProjectYear] = None
    type: DynamoProjectType  # REQUIRED
    name: str  # REQUIRED
    status: DynamoProjectStatus  # REQUIRED
    userId: str  # REQUIRED, the owner of this project
    lastUpdated: Optional[int] = Field(None, alias="lastUpdated")  # Unix timestamp in milliseconds
    exports: Optional[List[DynamoExport]] = None
    
    class DynamoConfig:
        populate_by_name = True
