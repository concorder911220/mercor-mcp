"""Template-specific prompt constructors."""

from typing import List, Any
from datetime import datetime
import os
import json

from .variables import AccountingTemplateVars, DocumentExtractionTemplateVars, TEMPLATE_VAR_TYPES
from .agent_prompt_template import ACCOUNTING_AGENT_PROMPT_TEMPLATE, DOCUMENT_EXTRACTION_PROMPT_TEMPLATE
from .response_format import RESPONSE_FORMAT
from ..tool_gateway import Tool
from ..exemplar_provider import Exemplar
from ..agent_config import SystemPromptTemplate
from rialto_shared_types.events import Event
from ...config import settings


class BasePromptConstructor:
    """Base class for prompt constructors."""
    
    def __init__(self, template: str):
        self.template = template
    
    def get_required_dependencies(self) -> List[str]:
        """Return list of required dependency names for this constructor."""
        raise NotImplementedError("Subclasses must implement get_required_dependencies")
    
    def construct_prompt_from_dependencies(self, user_id: str, today: str, time: str, 
                                         tools: List[Tool], exemplars: List[Exemplar], 
                                         event_history: List[Event], current_event: Event) -> str:
        """
        Construct prompt using only the dependencies this constructor actually needs.
        
        This method handles the dependency filtering and variable creation logic,
        delegating the actual prompt construction to the subclass.
        """
        # Get what dependencies this constructor actually needs
        required_deps = self.get_required_dependencies()
        
        # Build dependency dict with all potential dependencies
        available_deps = {
            "tools": tools,
            "exemplars": exemplars,
            "event_history": event_history,
            "current_event": current_event
        }
        
        # Filter to only required dependencies
        filtered_deps = {dep: available_deps[dep] for dep in required_deps if dep in available_deps}

        # Map constructor class to template enum
        constructor_to_template = {
            "AccountingPromptConstructor": SystemPromptTemplate.ACCOUNTING_GENERAL,
            "DocumentExtractionPromptConstructor": SystemPromptTemplate.DOCUMENT_EXTRACTION,
        }
        
        constructor_name = self.__class__.__name__
        if constructor_name not in constructor_to_template:
            raise ValueError(f"Unknown prompt constructor type: {constructor_name}")
        
        template_enum = constructor_to_template[constructor_name]
        var_class = TEMPLATE_VAR_TYPES[template_enum]
        
        vars = var_class(
            user_id=user_id,
            today=today,
            time=time,
            response_format="",  # Will be filled by constructor
            **filtered_deps  # Only pass required dependencies
        )
        
        return self.construct_prompt(vars)
    
    def _construct_tools_section(self, tools: List[Tool]) -> str:
        """Construct the tools section from available tools."""
        tool_sections = []
        for tool in tools:
            tool_def_json = {
                "tool_namespace": tool.namespace,
                "tool_name": tool.name,
                "description": tool.description,
                "input_schema": tool.input_schema.model_dump(exclude_none=True)
            }
            tool_def_json_pretty = json.dumps(tool_def_json, indent=2, allow_nan=False, separators=(", ", ": "))
            
            tool_sections.append(f"""### Tool: {tool.namespace}/{tool.name}
{tool_def_json_pretty}""")
        
        return "\n\n".join(tool_sections)
    
    def _construct_current_event_section(self, current_event: Event) -> str:
        """Construct the current event section."""
        return current_event.to_prompt_fragment()
    
    def _construct_event_history_section(self, event_history: List[Event]) -> str:
        """Construct the event history section."""
        return "\n".join([event.to_prompt_fragment() for event in event_history])
    
    def _construct_exemplars_section(self, exemplars: List[Exemplar]) -> str:
        """Construct the exemplars section."""
        exemplar_sections = []
        for exemplar in exemplars:
            # This would need to be implemented based on Exemplar structure
            exemplar_sections.append(f"### {exemplar.title}\n{exemplar.content}")
        return "\n\n".join(exemplar_sections)
    
    def _log_prompt_stats(self, constructed_prompt: str) -> None:
        """Log prompt statistics and optionally save to file."""
        length_characters = len(constructed_prompt)
        length_words = len(constructed_prompt.split())
        length_tokens = length_words * 1.33
        print(f"Prompt length: {length_characters} characters, {length_words} words, {length_tokens} tokens")

        if settings.debug:
            os.makedirs("/tmp/inference_traces/", exist_ok=True)
            timestamp = datetime.now().isoformat()
            file_path = f"/tmp/inference_traces/input_prompt_{timestamp}.txt"
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(constructed_prompt)


class AccountingPromptConstructor(BasePromptConstructor):
    """Constructor for accounting general prompt template."""
    
    def __init__(self):
        super().__init__(ACCOUNTING_AGENT_PROMPT_TEMPLATE)
    
    def get_required_dependencies(self) -> List[str]:
        """Accounting template needs all dependencies."""
        return ["tools", "exemplars", "event_history", "current_event"]
    
    def construct_prompt(self, vars: AccountingTemplateVars) -> str:
        """Construct prompt for accounting general template."""
        tools_section = self._construct_tools_section(vars.tools)
        current_event_section = self._construct_current_event_section(vars.current_event)
        event_history_section = self._construct_event_history_section(vars.event_history)
        exemplars_section = self._construct_exemplars_section(vars.exemplars)
        
        constructed_prompt = self.template.format(
            user_id=vars.user_id,
            today=vars.today,
            time=vars.time,
            response_format=RESPONSE_FORMAT,
            tools=tools_section,
            exemplars=exemplars_section,
            event_history=event_history_section,
            current_event=current_event_section
        )
        
        self._log_prompt_stats(constructed_prompt)
        return constructed_prompt


class DocumentExtractionPromptConstructor(BasePromptConstructor):
    """Constructor for document extraction prompt template."""
    
    def __init__(self):
        super().__init__(DOCUMENT_EXTRACTION_PROMPT_TEMPLATE)
    
    def get_required_dependencies(self) -> List[str]:
        """Positive affirmation template doesn't need any external dependencies."""
        return []
    
    def construct_prompt(self, vars: DocumentExtractionTemplateVars) -> str:
        """Construct prompt for positive affirmation template."""
        # Positive affirmation template only needs basic variables
        constructed_prompt = self.template.format(
            user_id=vars.user_id,
            response_format=RESPONSE_FORMAT
        )
        
        self._log_prompt_stats(constructed_prompt)
        return constructed_prompt
