import re
from typing import List

import logging
from .response_fragments import ResponseFragment, CompleteTextResponseFragment, ToolCallResponseFragment, LifecycleCommandResponseFragment, ResponseFragmentType, COMPLETE_RESPONSE_FRAGMENT_CONTENT_PATTERN

logger = logging.getLogger(__name__)

class NonStreamingResponseFragmentParser:

    TYPE_MATCH_INDEX = 0
    VALUE_MATCH_INDEX = 1

    def __init__(self):
        pass

    def parse(self, complete_inference_output: str) -> List[ResponseFragment]:
        # extract each <response_fragment type="(...)">(...)</response_fragment>
        response_fragments_matches = re.findall(COMPLETE_RESPONSE_FRAGMENT_CONTENT_PATTERN, complete_inference_output, re.DOTALL)

        response_fragments = []
        for response_fragment_match in response_fragments_matches:
            type = response_fragment_match[self.TYPE_MATCH_INDEX]
            value = response_fragment_match[self.VALUE_MATCH_INDEX]
            
            if type == ResponseFragmentType.TEXT:
                response_fragments.append(CompleteTextResponseFragment(type=ResponseFragmentType.TEXT, raw_content=value))
            elif type == ResponseFragmentType.TOOL_CALL:
                response_fragments.append(ToolCallResponseFragment(type=ResponseFragmentType.TOOL_CALL, raw_content=value))
            elif type == ResponseFragmentType.LIFECYCLE_COMMAND:
                response_fragments.append(LifecycleCommandResponseFragment(type=ResponseFragmentType.LIFECYCLE_COMMAND, raw_content=value))
            else:
                raise ValueError(f"Unknown response fragment type: {type}")

        return response_fragments