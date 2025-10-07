from typing import Dict, Any, List, Optional
from pydantic import BaseModel
import requests
import json
import re
import logging

from ..config import settings

logger = logging.getLogger(__name__)

class JsonSchema(BaseModel):
    """Represents a JSON Schema for tool input/output validation."""
    type: str
    properties: Optional[Dict[str, Any]] = None
    required: Optional[List[str]] = None
    items: Optional[Dict[str, Any]] = None
    title: Optional[str] = None
    default: Optional[Any] = None
    anyOf: Optional[List[Dict[str, Any]]] = None
    additionalProperties: Optional[Any] = None

class Tool(BaseModel):
    """Represents a tool that can be used by the agent."""
    namespace: str
    name: str
    description: str
    input_schema: JsonSchema
    output_schema: JsonSchema

logger = logging.getLogger(__name__)

class ToolGateway:
    """
    Provides access to available tools.
    """

    MCP_SERVER_NAMESPACES = [
        "dropbox",
        "outlook",
        "quickbooks",
        "extract"
    ]

    def __init__(self, mcp_domain: str):
        logger.info(f"Initializing ToolGateway with MCP domain: {mcp_domain}")
        self.mcp_domain = mcp_domain
        self.tools: Dict[str, Tool] = {}
        self._discover_tools()
    
    def _get_headers(self) -> Dict[str, str]:
        """Get headers for MCP server requests including authentication"""
        headers = {
            "Content-Type": "application/json",
            "Accept": "application/json, text/event-stream"
        }
        
        if settings.mcp_server_auth_token:
            headers["Authorization"] = f"Bearer {settings.mcp_server_auth_token}"
            logger.info("Added MCP server authentication token to request")
        else:
            logger.warning("MCP server auth token not configured - requests will be unauthenticated")
            
        return headers

    def _discover_tools(self):
        """Discover all available tools from MCP servers."""
        errors = []
        for server in self.MCP_SERVER_NAMESPACES:
            try:
                server_tools = self._fetch_tools_from_server(server)
                logger.info(f"Found {len(server_tools)} tools on {server}")
                for tool_data in server_tools:
                    tool = self._parse_tool(tool_data, server)
                    self.tools[f"{tool.namespace}/{tool.name}"] = tool
            except Exception as e:
                errors.append(f"Failed to discover tools from {server}: {e}")
        
        for tool in self.tools.values():
            logger.debug(f"Discovered Tool: {tool.namespace}/{tool.name}")

        logger.info(f"Found {len(self.tools)} tools across {len(self.MCP_SERVER_NAMESPACES)} MCP servers")

        if len(errors) > 0:
            raise Exception(f"ToolGateway unable to discover tools for some servers: {errors}")

    def _fetch_tools_from_server(self, server: str) -> List[Dict[str, Any]]:
        """Fetch tools from a specific MCP server."""
        url = f"{self.mcp_domain}/{server}/mcp"

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/list",
            "params": {}
        }

        response = requests.post(url, json=payload, headers=self._get_headers())
        response.raise_for_status()

        # Parse SSE response
        response_text = response.text
        data = self._parse_sse_response(response_text)

        if "error" in data:
            raise Exception(f"MCP error: {data['error']}")

        return data.get("result", {}).get("tools", [])

    def _parse_tool(self, tool_data: Dict[str, Any], server: str) -> Tool:
        """Parse tool data from MCP server response into Tool object."""
        input_schema = JsonSchema(**tool_data["inputSchema"])
        output_schema = JsonSchema(**tool_data["outputSchema"])
        
        return Tool(
            namespace=server,
            name=tool_data["name"],
            description=tool_data["description"],
            input_schema=input_schema,
            output_schema=output_schema
        )

    def list_tools(self) -> List[Tool]:
        """List all available tools."""
        return list(self.tools.values())

    def _parse_sse_response(self, response_text: str) -> Dict[str, Any]:
        """Parse Server-Sent Events response to extract JSON data."""
        lines = response_text.strip().split('\n')
        json_data = None

        for line in lines:
            line = line.strip()
            if line.startswith('data: '):
                json_str = line[6:]  # Remove 'data: ' prefix
                try:
                    json_data = json.loads(json_str)
                    break  # Use the first data line found
                except json.JSONDecodeError as e:
                    logger.error(f"Failed to parse JSON from SSE data: {e}")
                    continue

        if json_data is None:
            raise Exception(f"No valid JSON data found in SSE response: {response_text}")

        return json_data

    def get_tool(self, name: str) -> Optional[Tool]:
        """Get a specific tool by name."""
        return self.tools.get(name)

    def tool_call(self, namespace: str, tool_name: str, params: Dict[str, Any]) -> Dict[str, Any]:
        """Call a tool with the given parameters."""
        logger.info(f"Calling tool: {namespace}/{tool_name}")
        tool = self.get_tool(f"{namespace}/{tool_name}")
        if not tool:
            raise ValueError(f"Tool '{namespace}/{tool_name}' not found")

        url = f"{self.mcp_domain}/{tool.namespace}/mcp"

        payload = {
            "jsonrpc": "2.0",
            "id": 1,
            "method": "tools/call",
            "params": {
                "name": tool_name,
                "arguments": params
            }
        }

        response = requests.post(url, json=payload, headers=self._get_headers())
        response.raise_for_status()

        # Parse SSE response
        response_text = response.text
        data = self._parse_sse_response(response_text)

        if "error" in data:
            raise Exception(f"MCP error: {data['error']}")

        return data.get("result", {})