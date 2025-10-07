"""Tax Shared Types - Shared Pydantic models for tax documents."""

__version__ = "0.1.0"

from .document_types import TaxDocumentType, TaxDocument, TaxForm1099Div, TaxForm1099Int
from .tax_forms.core.w2 import TaxFormW2
from .tax_forms.core.k1 import TaxFormScheduleK1

__all__ = [
    "TaxDocumentType",
    "TaxDocument", 
    "TaxFormW2",
    "TaxFormScheduleK1",
    "TaxForm1099Div",
    "TaxForm1099Int",
]
