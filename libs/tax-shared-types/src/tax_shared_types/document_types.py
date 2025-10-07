"""Tax document types and related Pydantic models."""

import importlib
from enum import Enum
from typing import Any, Union

from pydantic import BaseModel, Field

# Import all the tax form models
from .tax_forms.core.w2 import TaxFormW2
from .tax_forms.core.k1 import TaxFormScheduleK1
from .tax_forms.core.div1099 import TaxForm1099Div
from .tax_forms.core.int1099 import TaxForm1099Int


class TaxDocumentType(str, Enum):
    """Supported tax document types matching tax-shared-types schemas."""
    W2 = "w2"
    FORM_1099_DIV = "1099div"
    FORM_1099_INT = "1099int"
    SCHEDULE_K1 = "k1"


# Union type for all supported tax document values
TaxDocumentSchemaUnion = Union[
    TaxFormW2,
    TaxForm1099Div, 
    TaxForm1099Int,
    TaxFormScheduleK1
]


class TaxDocument(BaseModel):
    """A tax document with its type and value."""
    type: TaxDocumentType = Field(..., description="The type of tax document")
    value: TaxDocumentSchemaUnion = Field(..., description="The tax document data conforming to the tax-shared-types schema")
    
    class Config:
        use_enum_values = True