"""Prompt template loader for dynamic template selection with strong typing."""

from .constructors import AccountingPromptConstructor, DocumentExtractionPromptConstructor
from .variables import TEMPLATE_VAR_TYPES
from ..agent_config import SystemPromptTemplate

# Map configuration values to prompt constructors
PROMPT_CONSTRUCTOR_MAP = {
    SystemPromptTemplate.ACCOUNTING_GENERAL: AccountingPromptConstructor,
    SystemPromptTemplate.DOCUMENT_EXTRACTION: DocumentExtractionPromptConstructor,
}

def get_prompt_constructor(template_name: SystemPromptTemplate):
    """
    Get the appropriate prompt constructor for a given template name.
    
    Args:
        template_name: The SystemPromptTemplate enum value
        
    Returns:
        The appropriate prompt constructor instance
        
    Raises:
        KeyError: If the template name is not found in the map
    """
    if template_name not in PROMPT_CONSTRUCTOR_MAP:
        raise KeyError(f"Prompt template '{template_name}' not found. Available templates: {list(PROMPT_CONSTRUCTOR_MAP.keys())}")
    
    constructor_class = PROMPT_CONSTRUCTOR_MAP[template_name]
    return constructor_class()

def get_template_var_type(template_name: SystemPromptTemplate):
    """
    Get the variable type class for a given template name.
    
    Args:
        template_name: The SystemPromptTemplate enum value
        
    Returns:
        The Pydantic model class for template variables
        
    Raises:
        KeyError: If the template name is not found in the map
    """
    if template_name not in TEMPLATE_VAR_TYPES:
        raise KeyError(f"Template variable type for '{template_name}' not found. Available types: {list(TEMPLATE_VAR_TYPES.keys())}")
    
    return TEMPLATE_VAR_TYPES[template_name]
