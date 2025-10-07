"""Agent configuration management for event-based agent routing."""

import json
from enum import Enum
from pathlib import Path
from typing import List, Optional
from pydantic import BaseModel
from rialto_shared_types.events import EventType

class Model(str, Enum):
    """Available AI models."""
    CLAUDE_3_5_SONNET_20241022 = "claude-3-5-sonnet-20241022"  # Latest Sonnet (default)
    CLAUDE_3_5_HAIKU_20241022 = "claude-3-5-haiku-20241022"    # Fastest/cheapest
    CLAUDE_3_OPUS_20240229 = "claude-3-opus-20240229"          # Most powerful
    CLAUDE_3_SONNET_20240229 = "claude-3-sonnet-20240229"      # Balanced
    CLAUDE_3_HAIKU_20240307 = "claude-3-haiku-20240307"       # Fast

class SystemPromptTemplate(str, Enum):
    """Available system prompt templates."""
    ACCOUNTING_GENERAL = "accounting_general_prompt_template"
    DOCUMENT_EXTRACTION = "document_extraction_prompt_template"

class AgentConfig(BaseModel):
    """Configuration for a specific agent."""
    system_prompt_template: SystemPromptTemplate
    allowed_tool_namespaces: List[str]
    max_iterations: int = 10
    temperature: float = 0.1
    model: Optional[Model] = None

class EventToAgentMapping(BaseModel):
    """Maps event types to agent configurations."""
    event_type: EventType
    agent_config: AgentConfig

def load_agent_config_from_file(config_path: str = "config/agent_config.json") -> List[EventToAgentMapping]:
    """
    Load agent configuration from a JSON file and convert it to a list of mappings.
    
    This function reads the JSON configuration file, validates the structure, and converts
    string values back to their corresponding enum types. It handles event-to-agent mappings.
    
    Args:
        config_path (str): Path to the JSON configuration file. Defaults to 
                          "config/agent_config.json".
    
    Returns:
        List[EventToAgentMapping]: A list of event-to-agent mappings with:
            - All string values converted to proper enum types
            - Ready for use with AgentConfigResolver
    
    Raises:
        FileNotFoundError: If the configuration file doesn't exist at the specified path.
        ValueError: If the JSON structure is invalid or enum values are unrecognized.
        KeyError: If required fields are missing from the configuration.
    
    Business Logic:
        1. Validates the configuration file exists
        2. Parses JSON and extracts mappings
        3. Converts string event types to EventType enums
        4. Converts string prompt templates to SystemPromptTemplate enums
        5. Converts string models to Model enums (if specified)
        6. Creates EventToAgentMapping objects
        7. Returns a list of mappings ready for event processing
    """
    
    config_file = Path(config_path)
    if not config_file.exists():
        raise FileNotFoundError(f"Agent config file not found: {config_path}")
    
    with open(config_file, 'r') as f:
        config_data = json.load(f)
    
    # Convert string enums back to enum values
    mappings = []
    for mapping_data in config_data.get("mappings", []):
        # Convert event_type string to enum
        event_type = EventType(mapping_data["event_type"])
        
        # Convert agent_config
        agent_config_data = mapping_data["agent_config"]
        agent_config = AgentConfig(
            system_prompt_template=SystemPromptTemplate(agent_config_data["system_prompt_template"]),
            allowed_tool_namespaces=agent_config_data["allowed_tool_namespaces"],
            max_iterations=agent_config_data.get("max_iterations", 10),
            temperature=agent_config_data.get("temperature", 0.1),
            model=Model(agent_config_data["model"]) if agent_config_data.get("model") else None
        )
        
        mappings.append(EventToAgentMapping(
            event_type=event_type,
            agent_config=agent_config
        ))
    
    return mappings
