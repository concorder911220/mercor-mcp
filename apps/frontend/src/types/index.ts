// Import types from generated backend schema
import { components } from './backend-schema';

// Type aliases for backend schema types with frontend extensions
export type Task = Partial<components['schemas']['TaskSummary']> & {
  // Required frontend fields
  id: string;
  // Optional frontend-specific fields for compatibility
  description?: string;
  status?: 'pending' | 'in-progress' | 'completed' | 'failed' | 'WAITING' | 'FOR_REVIEW' | 'IN_PROGRESS' | 'ONGOING' | 'COMPLETED';
  client?: string;
  type?: string[];
  owner?: string;
  timeline?: string | null;
};

export type TaskDetail = components['schemas']['TaskDetail'];

// Backend Meeting format
export interface BackendMeeting {
  id: string;
  title: string;
  description?: string | null;
  start_time: string;
  end_time: string;
  attendees: string[];
  location?: string | null;
  meeting_url?: string | null;
  calendar_provider: string;
  external_id?: string | null;
  account?: string[] | null;
  created_at?: string;
  updated_at?: string;
}

// MSGraph Meeting format - exported for component use
export interface MSGraphMeeting {
  id: string;
  subject: string;
  start: { dateTime: string };
  end: { dateTime: string };
  attendees: Array<{
    emailAddress: { name: string; address: string };
    status: { response: string; time: string | null };
    type: string;
  }>;
  location: {
    displayName: string;
    locationType?: string;
  };
  "@odata.etag": string;
  organizer: {
    emailAddress: { name: string; address: string };
  };
}

// Union type for both formats
export type Meeting = BackendMeeting | MSGraphMeeting;

export type CoreAgentRequest = components['schemas']['CoreAgentRequest'];
export type CoreAgentResponse = components['schemas']['CoreAgentResponse'];
export type MessageDetail = components['schemas']['MessageDetail'];

// Extended message response with user_input_request compatibility
export type MessageResponse = components['schemas']['MessageResponse'] | {
  success: boolean;
  message: string;
  task_id: string;
  parent_task_id?: string | null;
  status: string;
  user_input_request?: {
    actual_child_task_id: string;
    agent_name: string;
    message: string;
    context: {
      child_task_id: string;
      created_at: string;
    };
  } | null;
};

// Frontend-specific types
export interface TaskCardProps {
  task: Task;
}

export interface DateSection {
  date: {
    month: string;
    day: string;
  };
  items: Meeting[];
}

// Chat types for SSE streaming
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
  conversation_id?: string;
  // Extended types for debug and MCP tool messages
  type?: 'normal' | 'debug' | 'mcp_tools_executing' | 'mcp_progress' | 'mcp_tool_result';
  metadata?: {
    // For debug messages
    finish_reason?: string | null;
    
    // For MCP tool execution
    tools_executing?: string[];
    
    // For MCP progress
    progress_message?: string;
    
    // For MCP tool results
    tool_name?: string;
    tool_result?: {
      original_response?: any;
      requires_action?: boolean;
      action_type?: string | null;
      action_data?: any;
      processed_data?: any;
      success?: boolean;
      finish_reason?: string | null;
    };
    
    // General metadata
    [key: string]: any;
  };
}

// Conversation types for the new backend API
// These types match the actual JSON response from the backend
export interface ConversationMessage {
  id: string;  // UUID serialized as string in JSON
  message_type: string;
  content: string;
  role: string;
  timestamp: string;  // datetime serialized as ISO string in JSON
  extra_metadata?: Record<string, any> | null;
  conversation_id: string;  // UUID serialized as string in JSON
  attachments?: any[];
}

export interface Conversation {
  id: string;  // UUID serialized as string in JSON
  title: string;
  user_id: string;  // UUID serialized as string in JSON
  created_at: string;  // datetime serialized as ISO string in JSON
  updated_at?: string | null;  // datetime serialized as ISO string in JSON
  messages: ConversationMessage[];
}

// For list endpoints (getAllConversations, getUserConversations)
// Backend returns conversations with empty messages array for performance
export interface ConversationSummary {
  id: string;  // UUID serialized as string in JSON
  title: string;
  user_id: string;  // UUID serialized as string in JSON
  created_at: string;  // datetime serialized as ISO string in JSON
  updated_at?: string | null;  // datetime serialized as ISO string in JSON
  messages: ConversationMessage[];  // Always empty array from backend
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface ChatServiceOptions {
  onMessage: (message: ChatMessage) => void;
  onConnectionStatusChange: (status: ConnectionStatus) => void;
  onStreamComplete: () => void;
  onConversationCreated?: (conversationId: string) => void;
}

export interface ConversationCreatedEvent {
  conversation_id: string;
  title: string;
  created: boolean;
}

export interface ChatResponseEvent {
  content: string;
  finish_reason: string | null;
  conversation_id: string;
  message_id: string;
}

export interface ChatCompleteEvent {
  conversation_id: string;
  message_id: string;
  user_message_id: string;
  complete: boolean;
}

export interface ChatRequest {
  query: string;
  conversation_id?: string;
  attachments?: any[];
} 