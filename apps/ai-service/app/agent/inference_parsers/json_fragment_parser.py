import json
from abc import ABC, abstractmethod
from typing import Any, Dict


class JsonFragmentParser(ABC):
    """Base class for parsing JSON fragments from string content.

    Handles the common logic of extracting and parsing JSON from a string
    that may contain additional text before/after the JSON object.
    """

    def __init__(self):
        pass

    def extract_json_from_fragment(self, fragment_value: str) -> Dict[str, Any]:
        """Extract and parse JSON from a fragment string.

        Args:
            fragment_value: String that may contain JSON with surrounding text

        Returns:
            Parsed JSON dictionary

        Raises:
            ValueError: If no valid JSON object is found or JSON is invalid
        """
        # Skip any string content before the first '{' and after the final '}'
        first_brace = fragment_value.find('{')
        last_brace = fragment_value.rfind('}')
        if first_brace == -1 or last_brace == -1 or last_brace < first_brace:
            raise ValueError("No valid JSON object found in fragmentValue")

        fragment_json_str = fragment_value[first_brace:last_brace+1]

        try:
            fragment_json = json.loads(fragment_json_str)
        except json.JSONDecodeError:
            raise ValueError(f"Invalid JSON in fragmentValue: {fragment_value}")

        return fragment_json

    @abstractmethod
    def parse(self, fragment_value: str) -> Any:
        """Parse the fragment value into the specific model type.

        Args:
            fragment_value: String containing the fragment to parse

        Returns:
            Parsed model instance
        """
        pass
