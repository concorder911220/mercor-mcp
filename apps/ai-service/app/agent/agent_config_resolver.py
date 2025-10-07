"""Event processor for determining appropriate agent configurations."""

from typing import Dict, Any, List
from rialto_shared_types.events import EventType, AgentTriggerEventUnion
from .agent_config import AgentConfig, EventToAgentMapping

import logging

class AgentConfigResolver:
    """Resolves appropriate agent configurations for different event types."""
    
    def __init__(self, mappings: List[EventToAgentMapping]):
        self.mappings = mappings
    
    def resolve(self, event: AgentTriggerEventUnion) -> AgentConfig:
        """Resolve the appropriate agent configuration for an event."""
        
        # Find the first mapping that matches the event type
        for mapping in self.mappings:
            if mapping.event_type == event.type:
                agent_config = mapping.agent_config
                
                logger = logging.getLogger(__name__)
                logger.info(f"Selected agent config for event type '{event.type}':")
                logger.info(f"  - System prompt template: {agent_config.system_prompt_template}")
                logger.info(f"  - Allowed tool namespaces: {agent_config.allowed_tool_namespaces}")
                logger.info(f"  - Max iterations: {agent_config.max_iterations}")
                logger.info(f"  - Temperature: {agent_config.temperature}")
                logger.info(f"  - Model: {agent_config.model or 'default'}")
                
                return agent_config
        
        # Raise exception if no specific mapping found
        available_types = [mapping.event_type.value for mapping in self.mappings]
        raise ValueError(f"No agent configuration found for event type '{event.type.value}'. Available types: {available_types}")
    
    def get_available_event_types(self) -> List[EventType]:
        """Get all event types that can be processed."""
        return list(set(mapping.event_type for mapping in self.mappings))
    
    def get_agent_config_summary(self) -> Dict[str, Any]:
        """Get a summary of all configured agent mappings."""
        return {
            "total_mappings": len(self.mappings),
            "event_types": [et.value for et in self.get_available_event_types()]
        }
