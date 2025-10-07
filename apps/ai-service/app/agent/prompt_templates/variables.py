"""Template variable definitions for strong typing."""

from typing import List
from pydantic import BaseModel
from ..tool_gateway import Tool
from ..exemplar_provider import Exemplar
from rialto_shared_types.events import Event
from ..agent_config import SystemPromptTemplate


class BaseTemplateVars(BaseModel):
    """Base variables required by all templates."""
    user_id: str
    today: str
    time: str
    response_format: str


class AccountingTemplateVars(BaseTemplateVars):
    """Variables required for accounting general prompt template."""
    tools: List[Tool]
    exemplars: List[Exemplar]
    event_history: List[Event]
    current_event: Event


class DocumentExtractionTemplateVars(BaseTemplateVars):
    """Variables required for positive affirmation prompt template."""
    # No additional dependencies needed for positive affirmations


# Template variable mapping - maps enum values to variable types
TEMPLATE_VAR_TYPES = {
    SystemPromptTemplate.ACCOUNTING_GENERAL: AccountingTemplateVars,
    SystemPromptTemplate.DOCUMENT_EXTRACTION: DocumentExtractionTemplateVars,
}
