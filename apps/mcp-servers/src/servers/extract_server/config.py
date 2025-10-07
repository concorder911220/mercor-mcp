#!/usr/bin/env python3
"""
Extract MCP Server Configuration

Configuration management for the Extract MCP server including
Anthropic API settings and extraction parameters.
"""

import os
from typing import Optional
from pydantic_settings import BaseSettings


class ExtractSettings(BaseSettings):
    """Configuration settings for Extract MCP server."""
    
    # Anthropic API Configuration
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-3-sonnet-20240229"
    
    # Extraction Configuration
    MAX_FILE_SIZE: int = 50 * 1024 * 1024  # 50MB
    DEFAULT_TIMEOUT: int = 300  # 5 minutes
    MAX_FILES_PER_REQUEST: int = 10
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # Ignore extra environment variables
    
    def validate(self):
        """Validate required configuration."""
        if not self.ANTHROPIC_API_KEY:
            raise ValueError("ANTHROPIC_API_KEY is required for extraction functionality")


# Global settings instance
settings = ExtractSettings()
