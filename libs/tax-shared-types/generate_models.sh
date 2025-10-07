#!/bin/bash

# Generate Pydantic models from JSON schemas
set -e

# Get the script directory (lib root)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Create or activate virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

echo "Activating virtual environment..."
source venv/bin/activate

# Install datamodel-codegen if not already installed
if ! command -v datamodel-codegen &> /dev/null; then
    echo "Installing datamodel-codegen..."
    pip install datamodel-codegen[http]
fi

# Base directories
JSON_SCHEMA_BASE="json_schema"
OUTPUT_BASE="src/tax_shared_types"

# Find all JSON schema files and generate corresponding Python files
find "$JSON_SCHEMA_BASE" -name "*.json" -type f | while read -r json_file; do
    echo "Processing: $json_file"

    # Get relative path from the json_schema base
    rel_path="${json_file#$JSON_SCHEMA_BASE/}"

    # Change extension to .py
    output_path="${rel_path%.json}.py"

    # Full output path
    full_output_path="$OUTPUT_BASE/$output_path"

    # Create output directory if it doesn't exist
    output_dir="$(dirname "$full_output_path")"
    mkdir -p "$output_dir"

    echo "  Generating: $full_output_path"

    # Generate the Python model
    datamodel-codegen \
        --input "$json_file" \
        --output "$full_output_path" \
        --input-file-type jsonschema \
        --output-model-type pydantic_v2.BaseModel
done

echo "Model generation complete!"