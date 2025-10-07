# Rialto Shared Types

This library contains shared Pydantic models and types used across Rialto services.

## Installation

From the monorepo root:

```bash
pip install -e libs/tax-shared-types
```

## Usage

```python
from tax_shared_types.user import UserRole, UserBase
from tax_shared_types.task import TaskBase, TaskStatus
from tax_shared_types.message import MessageRole, Message
```

## Development

Install in development mode:

```bash
pip install -e "libs/tax-shared-types[dev]"
```

Run tests:

```bash
pytest libs/tax-shared-types/tests/
```

## Generating Pydantic models from JSON schema

Use the automated script to generate all Pydantic models from JSON schemas:

```bash
./generate_models.sh
```

This script will:
- Create/activate a virtual environment
- Install datamodel-codegen if needed
- Process all JSON schema files in `json_schema/` subdirectories
- Generate corresponding Python files in `src/tax_shared_types/` maintaining directory structure
- Map `json_schema/tax_forms/w2.json` → `src/tax_shared_types/tax_forms/w2.py`

### Manual generation (if needed)

```bash
datamodel-codegen --input json_schema/tax_forms/w2.json --output src/tax_shared_types/tax_forms/w2.py --input-file-type jsonschema
```