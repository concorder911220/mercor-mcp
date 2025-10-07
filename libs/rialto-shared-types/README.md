# Rialto Shared Types

This library contains shared Pydantic models and types used across Rialto services.

## Installation

From the monorepo root:

```bash
pip install -e libs/rialto-shared-types
```

## Usage

```python
from rialto_shared_types.user import UserRole, UserBase
from rialto_shared_types.task import TaskBase, TaskStatus
from rialto_shared_types.message import MessageRole, Message
```

## Development

Install in development mode:

```bash
pip install -e "libs/rialto-shared-types[dev]"
```

Run tests:

```bash
pytest libs/rialto-shared-types/tests/
```