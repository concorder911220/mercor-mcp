from typing import AsyncGenerator
from rialto_shared_types.agent_interface import AgentOutboundFragment
from sse_starlette.sse import ServerSentEvent
import logging

logger = logging.getLogger(__name__)

'''
This is a transformer that converts AgentOutboundFragment objects into SSE-compatible events.
'''
async def sse_transformer(generator: AsyncGenerator[AgentOutboundFragment, None]) -> AsyncGenerator[str, None]:
    """Transform agent output fragments to SSE format."""
    async for fragment in generator:
        if fragment:
            logger.info(f"Emitting fragment: {fragment.type}, {fragment.id}")
            yield ServerSentEvent(fragment.to_json(), event=fragment.type, id=fragment.id)