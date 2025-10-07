#!/usr/bin/env python3
"""
Extract MCP Server Package

A comprehensive document extraction server for the Model Context Protocol (MCP),
providing AI-powered structured data extraction from unstructured documents.
"""

__version__ = "1.0.0"
__author__ = "Extract MCP Server Team"
__description__ = "Document extraction integration for MCP with AI-powered analysis"

from .server import mcp
from . import tools

__all__ = [
    'mcp',
    'tools'
]
