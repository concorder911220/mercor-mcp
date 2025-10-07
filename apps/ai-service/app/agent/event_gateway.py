from typing import List, Optional
from pydantic import BaseModel
import logging

from rialto_shared_types.events import Event

logger = logging.getLogger(__name__)

class EventHistoryRequest(BaseModel):
    agent_execution_id: str
    event_type_inclusion_filter: Optional[List[str]] = None
    event_type_exclusion_filter: Optional[List[str]] = None

class EventHistoryResponse(BaseModel):
    events: List[Event]

class EventGateway:
    """
    Provides a gateway to the event bus.
    """

    def __init__(self):
        logger.info(f"Initializing EventGateway")

    def get_event_history(self, request: EventHistoryRequest) -> EventHistoryResponse:
        logger.warning("EventGateway.get_event_history is not implemented")
        return EventHistoryResponse(events=[])

    def publish_event(self, event: Event):
        raise NotImplementedError("EventGateway.publish_event is not implemented")
