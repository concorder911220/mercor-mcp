import type { 
  ChatMessage, 
  ChatServiceOptions, 
  ConversationCreatedEvent, 
  ChatResponseEvent, 
  ChatCompleteEvent,
  ChatRequest 
} from '../types/index';
import { FileUploadResponse } from '../redux/data-types/message';
import { getApiUrl } from '../redux/basicApi';

class ChatService {
  private options: ChatServiceOptions;
  private conversationId: string | null = null;
  private baseUrl: string;
  private currentStreamingMessage: ChatMessage | null = null;
  private messagesMap: Map<string, ChatMessage> = new Map();

  constructor(options: ChatServiceOptions, conversationId?: string) {
    this.options = options;
    // Don't set conversationId if it's 'new' - let it be created by the server
    this.conversationId = (conversationId && conversationId !== 'new') ? conversationId : null;
    this.baseUrl = getApiUrl();
    this.options.onConnectionStatusChange('connected');
  }

  private handleStreamEvent(eventType: string, data: any) {
    switch (eventType) {
      case 'conversation_created':
        // First event when conversation is created
        const meta: ConversationCreatedEvent = data;
        this.conversationId = meta.conversation_id;
        if (this.options.onConversationCreated) {
          this.options.onConversationCreated(meta.conversation_id);
        }
        break;

      case 'chat_response':
        // Streaming message content chunks
        const responseEvent: ChatResponseEvent = data;
        
        if (!this.currentStreamingMessage || this.currentStreamingMessage.id !== responseEvent.message_id) {
          // Create new streaming message
          this.currentStreamingMessage = {
            id: responseEvent.message_id,
            role: 'assistant',
            content: responseEvent.content,
            timestamp: new Date(),
            isStreaming: true,
            conversation_id: responseEvent.conversation_id,
            type: 'normal'
          };
          this.messagesMap.set(responseEvent.message_id, this.currentStreamingMessage);
        } else {
          // Append to existing streaming message with smart spacing
          this.currentStreamingMessage = {
            ...this.currentStreamingMessage,
            content: this.currentStreamingMessage.content + responseEvent.content
          };
          this.messagesMap.set(responseEvent.message_id, this.currentStreamingMessage);
        }
        
        // Check if streaming is complete
        if (responseEvent.finish_reason === 'stop') {
          this.currentStreamingMessage = {
            ...this.currentStreamingMessage,
            isStreaming: false
          };
          this.messagesMap.set(responseEvent.message_id, this.currentStreamingMessage);
        }
        
        this.options.onMessage(this.currentStreamingMessage);
        break;

      case 'chat_complete':
        // End of streaming conversation
        const completeEvent: ChatCompleteEvent = data;
        if (this.currentStreamingMessage) {
          this.currentStreamingMessage = {
            ...this.currentStreamingMessage,
            isStreaming: false
          };
          this.messagesMap.set(this.currentStreamingMessage.id, this.currentStreamingMessage);
          this.options.onMessage(this.currentStreamingMessage);
          this.currentStreamingMessage = null;
        }
        // Always call onStreamComplete when chat is complete, regardless of currentStreamingMessage
        this.options.onStreamComplete();
        // Ensure connection status is set back to connected after streaming completes
        this.options.onConnectionStatusChange('connected');
        break;

      case 'error':
        console.error('Stream error:', data);
        this.options.onConnectionStatusChange('error');
        break;
        
      default:
        // Handle new message types based on data.type property
        if (data?.type) {
          this.handleSpecialMessageType(data);
        }
        break;
    }
  }
  
  private handleSpecialMessageType(data: any) {
    switch (data.type) {
      case 'debug':
        this.createSpecialMessage('debug', {
          message: data.message || 'Debug message',
          finish_reason: data.finish_reason
        });
        break;
        
      case 'mcp_tools_executing':
        this.createSpecialMessage('mcp_tools_executing', {
          tools_executing: data.tools_executing || [],
          message: `Executing tools: ${(data.tools_executing || []).join(', ')}`
        });
        break;
        
      case 'mcp_progress':
        this.createSpecialMessage('mcp_progress', {
          progress_message: data.message,
          message: data.message || 'Progress update'
        });
        break;
        
      case 'mcp_tool_result':
        this.createSpecialMessage('mcp_tool_result', {
          tool_name: data.tool_name,
          tool_result: data.result || {},
          message: `Tool ${data.tool_name} completed ${data.success ? 'successfully' : 'with errors'}`
        });
        break;
        
      case 'content_delta':
        // Handle content deltas similar to chat_response
        if (this.currentStreamingMessage && data.content) {
          this.currentStreamingMessage = {
            ...this.currentStreamingMessage,
            content: this.currentStreamingMessage.content + data.content
          };
          
          if (data.finish_reason) {
            this.currentStreamingMessage.isStreaming = false;
          }
          
          this.messagesMap.set(this.currentStreamingMessage.id, this.currentStreamingMessage);
          this.options.onMessage(this.currentStreamingMessage);
        }
        break;
        
      default:
        console.log('Unhandled message type:', data.type, data);
        break;
    }
  }
  
  private createSpecialMessage(type: 'debug' | 'mcp_tools_executing' | 'mcp_progress' | 'mcp_tool_result', options: {
    message: string;
    tools_executing?: string[];
    progress_message?: string;
    tool_name?: string;
    tool_result?: any;
    finish_reason?: string | null;
  }) {
    const messageId = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const specialMessage: ChatMessage = {
      id: messageId,
      role: 'assistant',
      content: options.message,
      timestamp: new Date(),
      isStreaming: false,
      conversation_id: this.conversationId || undefined,
      type: type,
      metadata: {
        ...(options.tools_executing && { tools_executing: options.tools_executing }),
        ...(options.progress_message && { progress_message: options.progress_message }),
        ...(options.tool_name && { tool_name: options.tool_name }),
        ...(options.tool_result && { tool_result: options.tool_result }),
        ...(options.finish_reason !== undefined && { finish_reason: options.finish_reason })
      }
    };
    
    this.messagesMap.set(messageId, specialMessage);
    this.options.onMessage(specialMessage);
  }

  async sendMessage(content: string, fileUploads?: FileUploadResponse[]): Promise<void> {
    try {
      this.options.onConnectionStatusChange('connecting');

      // Add user message to UI immediately
      const userMessage: ChatMessage = {
        id: `temp_${Date.now()}`,
        role: 'user',
        content: content,
        timestamp: new Date(),
        isStreaming: false,
        conversation_id: this.conversationId || undefined
      };
      this.messagesMap.set(userMessage.id, userMessage);
      this.options.onMessage(userMessage);

      // Transform file uploads to attachment format
      const attachments = fileUploads?.map(upload => ({
        filename: upload.metadata.original_filename,
        s3_url: upload.s3_url,
        s3_key: upload.s3_key,
        content_type: upload.metadata.content_type,
        file_size: upload.metadata.file_size
      })) || [];

      const requestBody: ChatRequest = {
        query: content,
        attachments: attachments
      };

      // Include conversation_id if we have one (existing conversation)
      if (this.conversationId) {
        requestBody.conversation_id = this.conversationId;
      }

      // Get JWT token from localStorage
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${this.baseUrl}/chat/`, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Try to refresh token first
          const refreshToken = localStorage.getItem('refresh_token');
          
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh_token: refreshToken }),
              });

              if (refreshResponse.ok) {
                const data = await refreshResponse.json();
                const { access_token, refresh_token: newRefreshToken } = data;
                
                // Update tokens in localStorage
                localStorage.setItem('auth_token', access_token);
                if (newRefreshToken) {
                  localStorage.setItem('refresh_token', newRefreshToken);
                }
                
                // Retry the original request with new token
                const newHeaders: Record<string, string> = {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${access_token}`,
                };

                const retryResponse = await fetch(`${this.baseUrl}/chat/`, {
                  method: 'POST',
                  headers: newHeaders,
                  body: JSON.stringify(requestBody)
                });

                if (retryResponse.ok) {
                  // Continue with the retry response
                  const reader = retryResponse.body?.getReader();
                  const decoder = new TextDecoder();

                  if (!reader) {
                    throw new Error('Response body is not readable');
                  }

                  let buffer = '';
                  let currentEventType = '';

                  try {
                    while (true) {
                      const { done, value } = await reader.read();
                      // ... continue with existing streaming logic
                      if (done) break;
                      // Handle streaming as before
                    }
                  } finally {
                    reader.releaseLock();
                  }
                  return;
                }
              }
            } catch (refreshError) {
              console.error('Token refresh failed:', refreshError);
            }
          }
          
          // If refresh failed or no refresh token, redirect to login
          localStorage.removeItem('auth_token');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('refresh_token');
          window.location.href = '/login';
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      this.options.onConnectionStatusChange('connected');

      // Handle SSE streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Response body is not readable');
      }

      let buffer = '';
      let currentEventType = '';

      try {
        while (true) {
          const { done, value } = await reader.read();

          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');

          // Keep the last incomplete line in the buffer
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.trim() === '') continue;

            if (line.startsWith('event: ')) {
              currentEventType = line.slice(7).trim();
              continue;
            }

            if (line.startsWith('data: ')) {
              const dataLine = line.slice(6); // Remove "data: " prefix

              try {
                const eventData = JSON.parse(dataLine);
                this.handleStreamEvent(currentEventType, eventData);
              } catch (e) {
                // Skip malformed JSON
                console.warn('Failed to parse SSE data:', dataLine);
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }

    } catch (error) {
      console.error('Failed to send message:', error);
      this.options.onConnectionStatusChange('error');
      throw error;
    }
  }

  disconnect() {
    // No persistent connection to close in this approach
    this.options.onConnectionStatusChange('disconnected');
    this.currentStreamingMessage = null;
    this.messagesMap.clear();
  }

  getConversationId(): string | null {
    return this.conversationId;
  }

  // Update conversation ID (used when navigating to existing conversation)
  updateConversationId(conversationId: string | null): void {
    this.conversationId = conversationId;
  }
}

export default ChatService;
