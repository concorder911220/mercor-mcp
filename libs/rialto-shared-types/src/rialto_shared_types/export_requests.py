"""Tax export request types for Rialto."""

from enum import Enum
from typing import List

from pydantic import BaseModel, Field

from tax_shared_types.document_types import TaxDocument


class ExportStatus(str, Enum):
    IN_PROGRESS = "IN_PROGRESS"
    AVAILABLE = "AVAILABLE"
    FAILED = "FAILED"

class ExportType(str, Enum):
    # Tax Prep Software
    DRAKE_TAX = "DRAKE_TAX"
    INTUIT_PRO_SERIES = "INTUIT_PRO_SERIES"
    INTUIT_LACERTE_TAX = "INTUIT_LACERTE_TAX"
    ULTRA_TAX_SOFTWARE = "ULTRA_TAX_SOFTWARE"
    ATX = "ATX"
    CCH_AXCESS_TAX = "CCH_AXCESS_TAX"
    CCH_PRO_SYSTEMS_FX_TAX = "CCH_PRO_SYSTEMS_FX_TAX"

    # Other export types
    CLIENT_BINDER = "CLIENT_BINDER"
    TIE_OUTS = "TIE_OUTS"

class BaseExportRequest(BaseModel):
    """Base export request."""
    type: ExportType = Field(..., description="The type of export request")

class TaxPrepExportRequest(BaseExportRequest):
    """Request to export tax documents for processing."""
    taxDocs: List[TaxDocument] = Field(
        default_factory=list,
        description="List of tax documents to export"
    )
    
    class Config:
        use_enum_values = True
