# AI Service with Anthropic Claude Integration

A FastAPI-based AI service that integrates with Anthropic's Claude API and provides Server-Sent Events (SSE) streaming for real-time chat responses.

## Features

- 🚀 FastAPI with async/await support
- 🤖 Anthropic Claude API integration
- 📡 Server-Sent Events (SSE) streaming
- 📎 Support for S3 attachments (images)
- 💬 Chat history management
- 🔧 Environment-based configuration
- 🛡️ CORS support
- 📚 Auto-generated API documentation

## Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Environment Setup

Copy the environment example file and configure your settings:

```bash
cp env.example .env
```

Edit `.env` and add your Anthropic API key:

```env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL=claude-3-sonnet-20240229
```

### 3. Run the Service

```bash
python -m app.main
```

Or using uvicorn directly:

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The service will be available at `http://localhost:8000`

## API Documentation

Once running, visit:
- **Interactive API docs**: http://localhost:8000/docs
- **Alternative API docs**: http://localhost:8000/redoc

## API Endpoints

### POST /chat

Streaming chat endpoint with SSE support.

**Request Body:**
```json
{
  "query": "What is the capital of France?",
  "messages": [
    {
      "role": "user",
      "content": "Hello"
    },
    {
      "role": "assistant", 
      "content": "Hi! How can I help you?"
    }
  ],
  "attachments": [
    "https://s3.amazonaws.com/bucket/image.jpg"
  ]
}
```

**Response:**
Server-Sent Events stream with the following format:

```
data: {"content": "The", "finish_reason": null}
data: {"content": " capital", "finish_reason": null}
data: {"content": " of", "finish_reason": null}
data: {"content": " France", "finish_reason": null}
data: {"content": " is", "finish_reason": null}
data: {"content": " Paris.", "finish_reason": null}
data: {"content": "", "finish_reason": "stop", "usage": {"input_tokens": 15, "output_tokens": 8}}
```

### GET /

Root endpoint returning service information.

### GET /health

Health check endpoint.

## Client Usage Examples

### JavaScript/TypeScript

```javascript
const response = await fetch('http://localhost:8000/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    query: "What is the capital of France?",
    messages: [
      { role: "user", content: "Hello" },
      { role: "assistant", content: "Hi! How can I help you?" }
    ],
    attachments: ["https://s3.amazonaws.com/bucket/image.jpg"]
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      console.log('Received:', data);
      
      if (data.finish_reason) {
        console.log('Stream finished');
        break;
      }
    }
  }
}
```

### Python

```python
import requests
import json

response = requests.post(
    'http://localhost:8000/chat',
    json={
        'query': 'What is the capital of France?',
        'messages': [
            {'role': 'user', 'content': 'Hello'},
            {'role': 'assistant', 'content': 'Hi! How can I help you?'}
        ],
        'attachments': ['https://s3.amazonaws.com/bucket/image.jpg']
    },
    stream=True
)

for line in response.iter_lines():
    if line:
        line = line.decode('utf-8')
        if line.startswith('data: '):
            data = json.loads(line[6:])
            print('Received:', data)
            
            if data.get('finish_reason'):
                print('Stream finished')
                break
```

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `ANTHROPIC_API_KEY` | Your Anthropic API key | Required |
| `ANTHROPIC_MODEL` | Claude model to use | `claude-3-sonnet-20240229` |
| `HOST` | Server host | `0.0.0.0` |
| `PORT` | Server port | `8000` |

## Project Structure

```
ai-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application
│   ├── config.py            # Configuration management
│   ├── models.py            # Pydantic models
│   └── anthropic_client.py  # Anthropic API client
├── requirements.txt         # Python dependencies
├── env.example             # Environment variables template
└── README.md              # This file
```

## Development

### Running in Development Mode

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing

You can test the API using curl:

```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "What is the capital of France?",
    "messages": [],
    "attachments": []
  }'
```

## Error Handling

The service includes comprehensive error handling:

- Invalid API keys
- Network connectivity issues
- Malformed requests
- Anthropic API errors

All errors are returned as SSE events with appropriate error messages.

## Security Considerations

- Configure CORS appropriately for production
- Use environment variables for sensitive data
- Consider rate limiting for production use
- Validate attachment URLs before processing

## Agent System Architecture

This architecture enables **specialized agents** that are **type-safe**, **performant**, and **easily extensible** while maintaining **clear separation of concerns**.

### Key Principles

#### **1. Strongly Typed Everything**
**Principle**: Every component uses Pydantic models and type hints for compile-time safety.

- **Template Variables**: Each prompt template has its own typed variable class (`AccountingTemplateVars`, `DocumentExtractionTemplateVars`)
- **Event Types**: All events use enums (`EventType`, `SystemPromptTemplate`) instead of strings
- **Agent Configs**: Configuration uses typed models with validation
- **Tool Definitions**: MCP tools have strongly typed parameters and return values

#### **2. Agent-Specific Configurability**
**Principle**: Each agent can be independently configured for different behaviors without code changes.

- **Per-Agent Toolsets**: Different tool namespaces per agent (`["extract", "dropbox"]` vs `["outlook", "quickbooks"]`)
- **Custom Prompts**: Each agent type has its own system prompt template
- **Flexible Parameters**: Temperature, max iterations, and model selection per agent
- **Event-Driven Routing**: Agents automatically selected based on incoming event type

#### **3. Lazy Loading of Required Dependencies**
**Principle**: Only load and process what each agent actually needs, when it needs it.

- **Variable Lazy Loading**: Each prompt template declares its required dependencies - only those variables are loaded and passed
- **Tool Lazy Loading**: Agents only get tools from their allowed namespaces - unused tools are never loaded
- **Dependency Filtering**: System automatically filters to only required dependencies per template
- **On-Demand Processing**: Tools and exemplars fetched only when needed, not pre-loaded


### Cookbook

#### 1. Adding a Variable to a Prompt Template

To add a new variable to an existing prompt template:

**Step 1: Update the Template String**
Edit `app/agent/prompt_templates/agent_prompt_template.py`:

```python
ACCOUNTING_AGENT_PROMPT_TEMPLATE = f"""You are an AI accountant. The user_id is {{user_id}}.
Today is {{today}}. The time is {{time}}.

## New Variable Section
{{new_variable}}

## Available Tools
{{tools}}
...
"""
```

**Step 2: Update the Variable Class**
Edit `app/agent/prompt_templates/variables.py`:

```python
class AccountingTemplateVars(BaseTemplateVars):
    """Variables specific to the accounting general prompt template."""
    tools: List[Tool]
    exemplars: List[Exemplar]
    event_history: List[Event]
    current_event: Event
    new_variable: str  # Add your new variable here
```

**Step 3: Update the Constructor**
Edit `app/agent/prompt_templates/constructors.py`:

```python
def construct_prompt(self, vars: AccountingTemplateVars) -> str:
    """Construct prompt for accounting general template."""
    tools_section = self._construct_tools_section(vars.tools)
    current_event_section = self._construct_current_event_section(vars.current_event)
    event_history_section = self._construct_event_history_section(vars.event_history)
    exemplars_section = self._construct_exemplars_section(vars.exemplars)
    
    constructed_prompt = self.template.format(
        user_id=vars.user_id,
        today=vars.today,
        time=vars.time,
        response_format=RESPONSE_FORMAT,
        tools=tools_section,
        exemplars=exemplars_section,
        event_history=event_history_section,
        current_event=current_event_section,
        new_variable=vars.new_variable  # Add your new variable here
    )
    
    return constructed_prompt
```

**Note**: The system automatically handles **lazy loading** through `construct_prompt_from_dependencies()` - only the variables your template actually needs are loaded and passed. You don't need to manually update agent logic for new variables.

#### 2. Adding a New Agent

To create a completely new agent with its own prompt template:

**Step 1: Add System Prompt Template Enum**
Edit `app/agent/agent_config.py`:

```python
class SystemPromptTemplate(str, Enum):
    """Available system prompt templates."""
    ACCOUNTING_GENERAL = "accounting_general_prompt_template"
    DOCUMENT_EXTRACTION = "document_extraction_prompt_template"
    NEW_AGENT = "new_agent_prompt_template"  # Add your new template
```

**Step 2: Create the Template String**

Edit `app/agent/prompt_templates/agent_prompt_template.py`:

```python
NEW_AGENT_PROMPT_TEMPLATE = f"""You are a specialized AI agent. The user_id is {{user_id}}.

## Your Mission
{{mission_description}}

## Available Tools
{{tools}}

## Response Format
{{response_format}}
"""
```

**Step 3: Create Variable Class**
Edit `app/agent/prompt_templates/variables.py`:

```python
class NewAgentTemplateVars(BaseTemplateVars):
    """Variables specific to the new agent prompt template."""
    tools: List[Tool]
    current_event: Event
    mission_description: str
    # Add any other variables your agent needs

# Update the mapping
TEMPLATE_VAR_TYPES = {
    SystemPromptTemplate.ACCOUNTING_GENERAL: AccountingTemplateVars,
    SystemPromptTemplate.DOCUMENT_EXTRACTION: DocumentExtractionTemplateVars,
    SystemPromptTemplate.NEW_AGENT: NewAgentTemplateVars,  # Add your mapping
}
```

**Step 4: Create Constructor**
Edit `app/agent/prompt_templates/constructors.py`:

```python
class NewAgentPromptConstructor(BasePromptConstructor):
    """Constructor for new agent prompt template."""
    
    def __init__(self):
        super().__init__(NEW_AGENT_PROMPT_TEMPLATE)
    
    def get_required_dependencies(self) -> List[str]:
        """Define what dependencies this agent needs."""
        return ["tools", "current_event"]  # Adjust based on your needs
    
    def construct_prompt(self, vars: NewAgentTemplateVars) -> str:
        """Construct prompt for new agent template."""
        tools_section = self._construct_tools_section(vars.tools)
        current_event_section = self._construct_current_event_section(vars.current_event)
        
        constructed_prompt = self.template.format(
            user_id=vars.user_id,
            response_format=RESPONSE_FORMAT,
            tools=tools_section,
            current_event=current_event_section,
            mission_description=vars.mission_description
        )
        
        self._log_prompt_stats(constructed_prompt)
        return constructed_prompt
```

**Step 5: Register the Constructor**
Edit `app/agent/prompt_templates/__init__.py`:

```python
from .constructors import AccountingPromptConstructor, DocumentExtractionPromptConstructor, NewAgentPromptConstructor

PROMPT_CONSTRUCTOR_MAP = {
    SystemPromptTemplate.ACCOUNTING_GENERAL: AccountingPromptConstructor,
    SystemPromptTemplate.DOCUMENT_EXTRACTION: DocumentExtractionPromptConstructor,
    SystemPromptTemplate.NEW_AGENT: NewAgentPromptConstructor,  # Add your constructor
}
```

**Step 6: Add Agent Configuration**
Edit `config/agent_config.json`:

```json
{
  "mappings": [
    {
      "event_type": "new_event_type",
      "agent_config": {
        "system_prompt_template": "new_agent_prompt_template",
        "allowed_tool_namespaces": ["extract", "dropbox"],
        "max_iterations": 8,
        "temperature": 0.2,
        "model": "claude-3-5-sonnet-20241022"
      }
    }
  ],
  "default_agent": {
    "system_prompt_template": "accounting_general_prompt_template",
    "allowed_tool_namespaces": ["dropbox", "outlook", "quickbooks", "extract"],
    "max_iterations": 10
  }
}
```

#### 3. Adding a New Agent-Invokable Event

To create a new event type that can trigger agents:

**Step 1: Define the Event Type**
Edit `libs/rialto-shared-types/src/rialto_shared_types/events.py`:

```python
class EventType(str, Enum):
    """All supported event types that can trigger agents."""
    CHAT_REQUEST = "chat_request"
    DOCUMENT_SAVE = "document_save"
    NEW_EVENT = "new_event"  # Add your new event type

class NewEvent(Event):
    """Your new event description."""
    type: Literal[EventType.NEW_EVENT] = EventType.NEW_EVENT
    
    # Add your event-specific fields
    custom_field: str
    another_field: Optional[int] = None
    
    def to_prompt_fragment(self) -> str:
        return f"""<new_event timestamp={self.timestamp.isoformat()}>
{{
    "custom_field": "{self.custom_field}",
    "another_field": {self.another_field}
}}
</new_event>"""

# Update the union to include your new event
AgentTriggerEventUnion = Union[ChatRequestEvent, DocumentSaveEvent, NewEvent]
```

**Step 2: Update Event Exports**
Edit `libs/rialto-shared-types/src/rialto_shared_types/__init__.py`:

```python
from .events import (
    Event,
    ChatRequestEvent,
    ChatResponseEvent,
    ToolSelection,
    ToolOutput,
    AgentTriggerEventUnion,
    EventType,
    DocumentSaveEvent,
    NewEvent,  # Add your new event
    SourceProvider,
    Source,
)
```

**Step 3: Configure Agent for New Event**
Edit `config/agent_config.json`:

```json
{
  "mappings": [
    {
      "event_type": "new_event",
      "agent_config": {
        "system_prompt_template": "accounting_general_prompt_template",
        "allowed_tool_namespaces": ["dropbox", "outlook", "quickbooks"],
        "max_iterations": 8,
        "temperature": 0.2,
        "model": "claude-3-5-sonnet-20241022"
      }
    }
  ],
  "default_agent": {
    "system_prompt_template": "accounting_general_prompt_template",
    "allowed_tool_namespaces": ["dropbox", "outlook", "quickbooks", "extract"],
    "max_iterations": 10
  }
}
```

#### 4. Adding a New Tool to an Agent

To give an agent access to new MCP tools:

**Step 1: Create the MCP Tool**
Create a new tool in `apps/mcp-servers/src/servers/`:

```python
# apps/mcp-servers/src/servers/new_service_server/tools/new_tool.py
import mcp
from mcp.types import Tool

@mcp.tool()
async def new_tool_function(param1: str, param2: int) -> str:
    """
    Description of what this tool does.
    
    Args:
        param1: Description of parameter 1
        param2: Description of parameter 2
        
    Returns:
        Description of return value
    """
    # Your tool implementation here
    return f"Processed {param1} with {param2}"
```

**Step 2: Register the Tool**
Add the tool to your MCP server's tool list in the server file.

**Step 3: Update Agent Configuration**
Edit `config/agent_config.json` to include the new tool namespace:

```json
{
  "mappings": [
    {
      "event_type": "document_save",
      "agent_config": {
        "system_prompt_template": "document_extraction_prompt_template",
        "allowed_tool_namespaces": ["extract", "dropbox", "new_service"],  # Add new namespace
        "max_iterations": 5
      }
    }
  ]
}
```