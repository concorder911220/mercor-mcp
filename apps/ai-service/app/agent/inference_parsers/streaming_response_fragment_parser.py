import re
from typing import List

import logging
from .response_fragments import CompleteTextResponseFragment, ResponseFragment, PartialTextResponseFragment, ToolCallResponseFragment, LifecycleCommandResponseFragment, ResponseFragmentType, RESPONSE_FRAGMENT_TYPE_GROUP_INDEX, OPENING_RESPONSE_FRAGMENT_TAG_PATTERN, CLOSING_RESPONSE_FRAGMENT_TAG_PATTERN, RESPONSE_FRAGMENT_CONTENT_GROUP_INDEX, COMPLETE_RESPONSE_FRAGMENT_CONTENT_PATTERN, RESPONSE_FRAGMENT_CONTENT_GROUP_INDEX, ResponseFragmentType

logger = logging.getLogger(__name__)

class StreamingResponseFragmentParser:

    def __init__(self):
        self.buffer = ""
        self.cumulative_inference_output = ""

    # find the first instance of the opening response fragment tag pattern in the input string and return the type attribute value
    # E.g., <response_fragment type="text"> should return "text"
    def _extract_response_fragment_type(self, input_string: str) -> str:
        opening_tag_search = re.search(OPENING_RESPONSE_FRAGMENT_TAG_PATTERN, input_string)
        if opening_tag_search:
            return opening_tag_search.group(RESPONSE_FRAGMENT_TYPE_GROUP_INDEX)
        raise ValueError(f"No opening response fragment XML tag found for pattern: {OPENING_RESPONSE_FRAGMENT_TAG_PATTERN} in input string: {input_string}")

    # Removes anything and including the first instance of the opening response fragment tag pattern in the input string
    # May include a partial XML opening tag
    def _strip_opening_response_fragment_tag(self, input_string: str) -> str:
        # input_string = input_string.strip()
        opening_match = re.search(OPENING_RESPONSE_FRAGMENT_TAG_PATTERN, input_string)
        if opening_match:
            return input_string[opening_match.end():]
        
        # Check for partial opening tags at the beginning of the string
        # The complete opening tag pattern is '<response_fragment type="X">'
        # We need to check for partial tags like '="text">', 'text">', '">', '>', etc.
        
        # Get all known fragment types from ResponseFragmentType enum
        all_types = [ftype.value for ftype in ResponseFragmentType]
        
        # Check each possible fragment type for partial opening tags
        for fragment_type in all_types:
            example_opening_tag = f'<response_fragment type="{fragment_type}">'
            
            # Iteratively check if input_string startswith a partial opening tag
            # Check from the end of the tag backwards to find the longest match
            for i in range(len(example_opening_tag), 0, -1):
                partial_tag = example_opening_tag[-i:]  # Get suffix of tag
                if input_string.startswith(partial_tag):
                    return input_string[len(partial_tag):].lstrip()
        
        return input_string

    # May include a partial XML tag
    def _strip_closing_response_fragment_tag(self, input_string: str) -> str:
        # input_string = input_string.strip()
        closing_match = re.search(CLOSING_RESPONSE_FRAGMENT_TAG_PATTERN, input_string)
        if closing_match:
            return input_string[:closing_match.start()].rstrip()

        closing_tag = '</response_fragment>'
        # Iteratively check if input_string endswith a partial closing tag, e.g. '</response_fragment>', '</response_fragment', '</response_fragmen', etc. until '<'.
        # Its _possible_ but unlikely the input string ends with a '<' which doesn't end up being a closing tag.
        for i in range(len(closing_tag), 0, -1):
            iteratiely_smaller_partial_tag = closing_tag[:i]
            if input_string.endswith(iteratiely_smaller_partial_tag):
                return input_string[:-len(iteratiely_smaller_partial_tag)].rstrip()
        return input_string
    
    # Removes the opening and closing response fragment tags from the input string
    def _strip_xml_tags_from_text_chunk(self, input_string: str) -> str:
        opening_stripped_string = self._strip_opening_response_fragment_tag(input_string)
        closing_stripped_string = self._strip_closing_response_fragment_tag(opening_stripped_string)
        return closing_stripped_string

    def _extract_response_fragement_content(self, input_string: str) -> str:
        complete_fragment_content_search = re.search(COMPLETE_RESPONSE_FRAGMENT_CONTENT_PATTERN, input_string, re.DOTALL)
        if complete_fragment_content_search:
            content = complete_fragment_content_search.group(RESPONSE_FRAGMENT_CONTENT_GROUP_INDEX)
            return content.strip('\n\r')
        return None

    # Remove everthing before and including the first instance of the closing response fragment tag pattern in the buffer
    def _pop_fragment_from_buffer(self):
        closing_match = re.search(CLOSING_RESPONSE_FRAGMENT_TAG_PATTERN, self.buffer)
        if closing_match:
            self.buffer = self.buffer[closing_match.end():]

    # Emits fragments or partial fragments found in the output rolling buffer.
    def process_chunk(self, chunk: str) -> List[ResponseFragment]:
        response_fragments = []
        self.buffer += chunk
        self.cumulative_inference_output += chunk

        opening_tag_search = re.search(OPENING_RESPONSE_FRAGMENT_TAG_PATTERN, self.buffer)
        closing_tag_search = re.search(CLOSING_RESPONSE_FRAGMENT_TAG_PATTERN, self.buffer)
        is_opening_tag_present = opening_tag_search is not None
        is_closing_tag_present = closing_tag_search is not None

        # Doesn't handle case buffer contains more after the popped fragment. 
        # Most likely to happen if chunk size is larger than the smallest response fragment.
        if is_opening_tag_present:
            fragment_type = self._extract_response_fragment_type(self.buffer)

            # Process fragment types which support incremental output here.
            if fragment_type == ResponseFragmentType.TEXT:
                cleaned_chunk = self._strip_xml_tags_from_text_chunk(chunk)
                if cleaned_chunk:
                    response_fragments.append(PartialTextResponseFragment(raw_content=cleaned_chunk))

            if is_closing_tag_present:
                # Process fragment types which do not support incremental output here.
                if fragment_type == ResponseFragmentType.TEXT:
                    text_content = self._extract_response_fragement_content(self.buffer)
                    response_fragments.append(CompleteTextResponseFragment(raw_content=text_content))
                
                if fragment_type == ResponseFragmentType.TOOL_CALL:
                    tool_call_content = self._extract_response_fragement_content(self.buffer)
                    response_fragments.append(ToolCallResponseFragment(raw_content=tool_call_content))

                if fragment_type == ResponseFragmentType.LIFECYCLE_COMMAND:
                    lifecycle_command_content = self._extract_response_fragement_content(self.buffer)
                    response_fragments.append(LifecycleCommandResponseFragment(raw_content=lifecycle_command_content))

                # Pop the fragment from the buffer once we've processed it. There may be the start of a new fragment in the buffer.
                logger.debug(f"Popping {fragment_type} fragment from response buffer")
                self._pop_fragment_from_buffer()

        return response_fragments
