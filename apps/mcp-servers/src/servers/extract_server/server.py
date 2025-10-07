from mcp.server.fastmcp import FastMCP

mcp = FastMCP("Extract MCP Server", stateless_http=True)

# Import all extract tools to register with MCP
from .tools.document_extraction import (
    extract_from_url,
    extract_from_dropbox_file,
    extract_with_schema
)

from .tools.schema_operations import (
    infer_document_schema,
    validate_extracted_data
)
