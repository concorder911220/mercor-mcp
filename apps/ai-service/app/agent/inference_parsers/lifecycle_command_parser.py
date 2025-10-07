from ...agent.model.lifecycle_command import LifecycleCommand
from .json_fragment_parser import JsonFragmentParser

class LifecycleCommandParser(JsonFragmentParser):
    def __init__(self):
        super().__init__()

    def parse(self, fragment_value: str) -> LifecycleCommand:
        fragment_json = self.extract_json_from_fragment(fragment_value)

        # Check for required fields
        if "command" not in fragment_json:
            raise ValueError("Missing 'command' in lifecycle command fragment")

        command_value = fragment_json["command"]

        # Validate that the command is a valid LifecycleCommand enum value
        try:
            return LifecycleCommand(command_value)
        except ValueError:
            valid_commands = [cmd.value for cmd in LifecycleCommand]
            raise ValueError(f"Invalid lifecycle command '{command_value}'. Valid commands are: {valid_commands}")