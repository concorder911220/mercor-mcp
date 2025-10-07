from datetime import datetime, timezone
import uuid
from rialto_shared_types.events import ToolSelection
from .json_fragment_parser import JsonFragmentParser

class ToolCallParser(JsonFragmentParser):
    def __init__(self):
        super().__init__()

    def parse(self, fragment_value: str) -> ToolSelection:
        fragment_json = self.extract_json_from_fragment(fragment_value)

        # Check for required fields and collect all errors
        errors = []
        if "tool_namespace" not in fragment_json:
            errors.append("Missing 'tool_namespace' in tool call fragment")
        if "tool_name" not in fragment_json:
            errors.append("Missing 'tool_name' in tool call fragment")
        if "tool_args" not in fragment_json:
            errors.append("Missing 'tool_args' in tool call fragment")
        if errors:
            raise ValueError("; ".join(errors))

        return ToolSelection(
            id=f"rialto1.tool-selection.{str(uuid.uuid4())}",
            timestamp=datetime.now(timezone.utc),
            tool_namespace=fragment_json["tool_namespace"],
            tool_name=fragment_json["tool_name"],
            tool_args=fragment_json["tool_args"]
        )

