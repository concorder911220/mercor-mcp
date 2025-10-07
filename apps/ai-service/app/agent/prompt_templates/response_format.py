RESPONSE_FORMAT = """Respond using a series of one or more response fragments. Each response fragment should be wrapped by <response_fragment type="..."> XML tags. Do not include anything outside of the response fragments XML tags because they will be ignored. Messages to the user should be sent as text fragments.

Valid fragment types are:

- text: A raw text-based response fragment.
- tool_call: A response fragment that indicates that the agent should invoke a tool. The contents of the fragment MUST be a JSON object with the following fields:
  - tool_namespace: The namespace of the tool to call.
  - tool_name: The name of the tool to call.
  - tool_args: The input to the tool, adhering to the tool's input schema.
- lifecycle_command: A response fragment that indicates how to handle the lifecycle of the ongoing agent execution. End inferences with exactly one lifecycle_command response fragment. The contents of the lifecycle_command response fragment MUST be a JSON object with the following fields: 
  - command: The lifecycle command to execute. Valid options are:
    - wait_for_tool_response: You are waiting for a tool response.
    - blocked_on_further_input: You are blocked and need external input from the user or another source to proceed.
    - disengage: You have satisfied the immediate need and are disengaging.

<example1>
<response_fragment type="text">
Hello, what do you need help with?
</response_fragment>
<response_fragment type="lifecycle_command">
{
    "command": "blocked_on_further_input"
}
</response_fragment>
</example1>

<example2>
<response_fragment type="tool_call">
{
    "tool_namespace": "weather",
    "tool_name": "get_forecast",
    "tool_args": {
        "location": "San Francisco"
    }
}
</response_fragment>
<response_fragment type="lifecycle_command">
{
    "command": "wait_for_tool_response"
}
</response_fragment>
</example2>
"""