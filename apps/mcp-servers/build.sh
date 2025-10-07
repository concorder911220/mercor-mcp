#!/bin/bash

# Build script for MCP Servers Docker container

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Building MCP Servers Docker container...${NC}"

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}Warning: .env file not found. Creating from env.example...${NC}"
    if [ -f env.example ]; then
        cp env.example .env
        echo -e "${YELLOW}Please update .env file with your actual configuration values.${NC}"
    else
        echo -e "${RED}Error: env.example file not found. Please create a .env file manually.${NC}"
        exit 1
    fi
fi

# Build the Docker image
echo -e "${GREEN}Building Docker image...${NC}"
docker build -t mcp-servers .

echo -e "${GREEN}Build completed successfully!${NC}"
echo -e "${GREEN}To run the container:${NC}"
echo -e "${YELLOW}  docker run -p 8002:8002 --env-file .env mcp-servers${NC}"
echo -e "${GREEN}Or use docker-compose:${NC}"
echo -e "${YELLOW}  docker-compose up${NC}"
