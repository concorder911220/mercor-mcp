import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Box, Typography, Alert, Paper } from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { RateReview as ReviewIcon } from '@mui/icons-material';
import { Button } from '@rialto/ui';
import { useGetConversationQuery } from '../redux/conversation/conversationApi';
import { ConversationMessage, ChatMessage, ChatServiceOptions } from '../types/index';
import { UserInput } from '../components/UserInput';
import ChatService from '../services/chatService';
import { FileUploadResponse } from '../redux/data-types/message';
import { SpecialMessageRenderer } from '../components/common/SpecialMessageRenderer';
import ReviewDrawer from '../components/ReviewDrawer';
import { welcomeEmailTemplate } from '../mocks/welcome_email';

// Enhanced markdown renderer with tool call support
const renderSimpleMarkdown = (content: string): string => {
  return content
    // Tool calls - match <tool_call tool="...">...</tool_call>
    .replace(/<tool_call[^>]*tool="([^"]*)"[^>]*>([\s\S]*?)<\/tool_call>/g, (match, toolName, innerContent) => {
      // Extract tool name from namespace/tool format
      const displayToolName = toolName.includes('/') ? toolName.split('/').pop() : toolName;
      const isResult = toolName === 'result';
      
      if (isResult) {
        // Tool result styling with fixed height and scrolling
        return `<div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 12px; margin: 16px 0; font-family: inherit; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #0ea5e9; color: white; padding: 12px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #0284c7;">
            <span style="font-size: 16px;">✅</span>
            <span style="font-weight: 600; font-size: 14px;">Tool Result</span>
          </div>
          <div style="height: 200px; overflow-y: auto; padding: 16px; background-color: white; font-size: 13px; line-height: 1.5; border: 1px solid #e0f2fe;">
            <div style="white-space: pre-wrap; font-family: inherit;">${innerContent.trim()}</div>
          </div>
        </div>`;
      } else {
        // Tool execution styling with fixed height and scrolling
        return `<div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; margin: 16px 0; font-family: inherit; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #475569; color: white; padding: 12px 16px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #334155;">
            <span style="font-size: 16px;">🔧</span>
            <span style="font-weight: 600; font-size: 14px; text-transform: capitalize;">${displayToolName || 'Tool Execution'}</span>
          </div>
          <div style="height: 150px; overflow-y: auto; padding: 16px; background-color: #f8fafc; font-size: 13px; line-height: 1.5; border: 1px solid #e2e8f0;">
            <div style="white-space: pre-wrap; font-family: inherit; color: #64748b;">${innerContent.trim()}</div>
          </div>
        </div>`;
      }
    })
    // Headers
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    // Bold and italic
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    // Code blocks with language detection - enhanced for tool results
    .replace(/```(\w+)?\n?([\s\S]*?)```/g, (match, lang, code) => {
      const language = lang ? ` data-language="${lang}"` : '';
      const isJson = lang === 'json';
      const codeStyle = isJson 
        ? 'color: #1e40af; font-size: 12px; line-height: 1.4; white-space: pre-wrap; word-break: break-word;'
        : 'color: #374151; font-size: 12px; line-height: 1.4;';
      return `<pre${language} style="background-color: #f8f9fa; padding: 12px; border-radius: 6px; border: 1px solid #e9ecef; margin: 8px 0; overflow-x: auto;"><code style="${codeStyle}">${code.trim()}</code></pre>`;
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li>$1</li>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/(<li>.*<\/li>)/gim, '<ul>$1</ul>')
    // Workflow indicators with emoji styling
    .replace(/🔄\s*\*\*(.*?)\*\*/g, '<div style="display: flex; align-items: center; gap: 8px; margin: 8px 0; padding: 8px 12px; background-color: #fef3c7; border-radius: 6px; border-left: 4px solid #f59e0b;"><span style="font-size: 16px;">🔄</span><strong style="color: #92400e;">$1</strong></div>')
    .replace(/⏳\s*\*\*(.*?)\*\*/g, '<div style="display: flex; align-items: center; gap: 8px; margin: 8px 0; padding: 8px 12px; background-color: #e0f2fe; border-radius: 6px; border-left: 4px solid #0284c7;"><span style="font-size: 16px;">⏳</span><strong style="color: #0c4a6e;">$1</strong></div>')
    // Line breaks
    .replace(/\n/g, '<br>');
};

export default function Conversation() {
  const { conversationId } = useParams<{ conversationId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected' | 'error'>('disconnected');
  const [isReviewDrawerOpen, setIsReviewDrawerOpen] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatServiceRef = useRef<ChatService | null>(null);
  const initialMessageSentRef = useRef(false);

  // Extract initial message from navigation state
  const initialMessage = location.state?.initialMessage;
  const fileUploads = location.state?.fileUploads;

  // Fetch conversation data
  const { 
    data: conversation, 
    isLoading: isLoadingConversation, 
    error: conversationError 
  } = useGetConversationQuery(conversationId || '', {
    skip: !conversationId || conversationId === 'new'
  });

  // Convert conversation messages to ChatMessage format
  useEffect(() => {
    if (conversation?.messages) {
      const chatMessages: ChatMessage[] = conversation.messages.map((msg: ConversationMessage) => ({
        id: msg.id,
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
        timestamp: new Date(msg.timestamp),
        isStreaming: false, // Messages from backend are not streaming
        conversation_id: msg.conversation_id
      }));
      setMessages(chatMessages);
    }
  }, [conversation]);

  // Initialize chat service
  useEffect(() => {
    const chatServiceOptions: ChatServiceOptions = {
      onMessage: (message: ChatMessage) => {
        setMessages(prev => {
          const existingIndex = prev.findIndex(m => m.id === message.id);
          if (existingIndex !== -1) {
            // Update existing message
            const newMessages = [...prev];
            newMessages[existingIndex] = message;
            return newMessages;
          } else {
            // Add new message
            return [...prev, message];
          }
        });
      },
      onConnectionStatusChange: (status) => {
        setConnectionStatus(status);
        if (status === 'error') {
          setError('Connection error occurred');
        } else {
          setError(null);
        }
      },
      onStreamComplete: () => {
        setIsLoading(false);
      },
      onConversationCreated: (newConversationId: string) => {
        // If we're in a new conversation, navigate to the actual conversation ID
        if (!conversationId || conversationId === 'new') {
          console.log('🎯 [Conversation] Navigating to new conversation ID:', newConversationId);
          navigate(`/conversation/${newConversationId}`, { replace: true });
        }
      }
    };

    chatServiceRef.current = new ChatService(chatServiceOptions, conversationId);

    return () => {
      chatServiceRef.current?.disconnect();
    };
  }, [conversationId, navigate]);

  const handleSendMessage = useCallback(async (message: string, fileUploads?: FileUploadResponse[]) => {
    if (!message.trim()) return;

    setIsLoading(true);

    try {
      if (!chatServiceRef.current) {
        setError('Chat service not initialized');
        setIsLoading(false);
        return;
      }

      await chatServiceRef.current.sendMessage(message, fileUploads);
    } catch (err) {
      setError('Failed to send message');
      setIsLoading(false);
    }
  }, [conversationId]);

  // Handle initial message from planning page
  useEffect(() => {
    if (initialMessage && !initialMessageSentRef.current && chatServiceRef.current && conversationId === 'new') {
      initialMessageSentRef.current = true;
      handleSendMessage(initialMessage, fileUploads);
    }
  }, [initialMessage, conversationId, fileUploads, handleSendMessage]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (conversationError) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Failed to load conversation</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header
      <Box
        sx={{
          height: theme => theme.spacing(8),
          borderBottom: theme => `1px solid ${theme.palette.divider}`,
          backgroundColor: theme => theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          px: theme => theme.spacing(3),
          flexShrink: 0,
        }}
      >
        <Typography variant="h6" sx={{ 
          fontWeight: theme => theme.typography.fontWeightMedium,
          color: theme => theme.palette.text.primary,
          fontFamily: theme => theme.typography.fontFamily
        }}>
          {conversation?.title || 'New Task'}
        </Typography>
      </Box> */}

      {/* Chat Area - Full Width */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Messages Container - Scrollable */}
          <Box
            sx={{
              flex: 1,
              overflowY: 'auto',
              padding: theme => theme.spacing(2.5),
              backgroundColor: theme => theme.palette.background.paper,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: theme => theme.spacing(180) }}>
            {/* Error Display */}
            {error && (
              <Box sx={{ mb: 2 }}>
                <Alert severity="error">{error}</Alert>
              </Box>
            )}

            {/* Loading Indicator */}
            {isLoadingConversation && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <Typography color="text.secondary">Loading conversation...</Typography>
              </Box>
            )}

            {/* Messages */}
            {messages.length === 0 && !isLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <Typography variant="h5" color="text.secondary">
                  Start a conversation
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Ask me anything to get started!
                </Typography>
              </Box>
            ) : (
              messages.map((message) => (
                <Box
                  key={message.id}
                  sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  <Paper
                    sx={{
                      maxWidth: message.role === 'user' ? '70%' : '100%',
                      padding: theme => message.role === 'user' 
                        ? theme.spacing(1.5, 2)  // 12px 16px
                        : theme.spacing(2.5, 0),  // 20px 0px (no horizontal padding)
                      backgroundColor: theme => message.role === 'user' 
                        ? theme.palette.grey[100]  // surface.tertiary equivalent
                        : theme.palette.background.paper,
                      color: theme => theme.palette.text.primary,
                      borderRadius: theme => message.role === 'user' 
                        ? theme.spacing(1.5)  // 12px
                        : theme.spacing(2),   // 16px
                      boxShadow: theme => message.role === 'user' 
                        ? theme.shadows[1] 
                        : 'none',
                      border: theme => message.role === 'user' 
                        ? 'none' 
                        : 'none',
                      position: 'relative',
                      transition: 'all 0.2s ease-in-out',
                      '&:hover': {}
                    }}
                  >
                    {message.role === 'assistant' ? (
                      // Check if this is a special message type
                      (message.type && ['debug', 'mcp_tools_executing', 'mcp_progress', 'mcp_tool_result'].includes(message.type)) ? (
                        <Box sx={{ p: 0 }}>
                          <SpecialMessageRenderer message={message} />
                        </Box>
                      ) : (
                        <Box sx={{ 
                          fontFamily: theme => theme.typography.fontFamily,
                          lineHeight: 1.6,
                          color: theme => theme.palette.text.primary,
                          // Optimize for tool call boxes
                          '& div[style*="margin: 16px 0"]': {
                            margin: '8px 0 !important'  // Reduce margin between tool boxes
                          },
                          '& h1, & h2, & h3, & h4, & h5, & h6': { 
                            mt: theme => theme.spacing(1.5), 
                            mb: theme => theme.spacing(1), 
                            fontWeight: theme => theme.typography.fontWeightMedium,
                            color: theme => theme.palette.text.primary,
                            fontFamily: theme => theme.typography.fontFamily
                          },
                          '& h1': { fontSize: theme => theme.typography.h5.fontSize },
                          '& h2': { fontSize: theme => theme.typography.h6.fontSize },
                          '& h3': { fontSize: theme => theme.typography.body1.fontSize },
                          '& p': { 
                            mb: theme => theme.spacing(1), 
                            '&:last-child': { mb: 0 },
                            fontFamily: theme => theme.typography.fontFamily,
                            fontSize: theme => theme.typography.body1.fontSize
                          },
                          '& ul, & ol': { 
                            mb: theme => theme.spacing(1), 
                            pl: theme => theme.spacing(2),
                            fontFamily: theme => theme.typography.fontFamily
                          },
                          '& li': { 
                            mb: theme => theme.spacing(0.5),
                            lineHeight: 1.4,
                            fontFamily: theme => theme.typography.fontFamily,
                            fontSize: theme => theme.typography.body1.fontSize
                          },
                          '& strong, & b': {
                            fontWeight: theme => theme.typography.fontWeightMedium,
                            color: theme => theme.palette.text.primary,
                            fontFamily: theme => theme.typography.fontFamily
                          },
                          '& em, & i': {
                            fontStyle: 'italic',
                            fontFamily: theme => theme.typography.fontFamily
                          },
                          '& code': { 
                            backgroundColor: theme => theme.palette.grey[100], 
                            color: theme => theme.palette.text.primary,
                            padding: theme => theme.spacing(0.25, 0.5), 
                            borderRadius: theme => theme.spacing(0.5), 
                            fontFamily: 'ui-monospace, SFMono-Regular, Monaco, monospace',
                            fontSize: '0.85em',
                            border: theme => `1px solid ${theme.palette.divider}`
                          },
                          '& pre': { 
                            backgroundColor: theme => theme.palette.grey[50], 
                            padding: theme => theme.spacing(1.5), 
                            borderRadius: theme => theme.spacing(0.75), 
                            overflow: 'auto',
                            border: theme => `1px solid ${theme.palette.divider}`,
                            mb: theme => theme.spacing(1),
                            fontFamily: 'ui-monospace, SFMono-Regular, Monaco, monospace',
                            fontSize: theme => theme.typography.body2.fontSize,
                            lineHeight: 1.4,
                            '& code': {
                              backgroundColor: 'transparent',
                              padding: 0,
                              border: 'none',
                              fontSize: 'inherit'
                            }
                          },
                          '& blockquote': { 
                            borderLeft: theme => `${theme.spacing(0.375)} solid ${theme.palette.divider}`, 
                            paddingLeft: theme => theme.spacing(1.5), 
                            marginLeft: 0, 
                            fontStyle: 'italic',
                            color: theme => theme.palette.text.secondary,
                            backgroundColor: theme => theme.palette.grey[50],
                            paddingY: theme => theme.spacing(0.5),
                            borderRadius: theme => `0 ${theme.spacing(0.5)} ${theme.spacing(0.5)} 0`,
                            fontFamily: theme => theme.typography.fontFamily,
                            fontSize: theme => theme.typography.body1.fontSize
                          }
                        }}>
                          <div dangerouslySetInnerHTML={{ __html: renderSimpleMarkdown(String(message.content)) }} />
                          {message.isStreaming && (
                            <Box
                              component="span"
                              sx={{
                                display: 'inline-block',
                                width: theme => theme.spacing(0.375),
                                height: theme => theme.spacing(2.5),
                                backgroundColor: theme => theme.palette.success.main,
                                ml: theme => theme.spacing(0.5),
                                borderRadius: theme => theme.spacing(0.25),
                                animation: 'blink 1s infinite',
                                '@keyframes blink': {
                                  '0%, 50%': { opacity: 1 },
                                  '51%, 100%': { opacity: 0 },
                                },
                              }}
                            />
                          )}
                        </Box>
                      )
                    ) : (
                      <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {message.content}
                      </Typography>
                    )}
                    
                    {/* Timestamp */}
                    <Typography
                      variant="caption"
                      sx={{
                        display: 'block',
                        mt: theme => theme.spacing(message.role === 'user' ? 1 : 1.5),
                        opacity: 0.6,
                        textAlign: message.role === 'user' ? 'right' : 'left',
                        fontSize: theme => theme.typography.caption.fontSize,
                        fontWeight: theme => theme.typography.fontWeightMedium,
                        color: theme => theme.palette.text.secondary,
                        letterSpacing: theme => theme.spacing(0.0625)
                      }}
                    >
                      {new Intl.DateTimeFormat('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }).format(message.timestamp)}
                    </Typography>
                  </Paper>
                </Box>
              ))
            )}
            
            {/* Loading indicator for new messages */}
            {isLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', mb: 2 }}>
                <Paper
                  sx={{
                    padding: theme => theme.spacing(2.5, 3),
                    backgroundColor: theme => theme.palette.background.paper,
                    borderRadius: theme => theme.spacing(2),
                    boxShadow: theme => theme.shadows[2],
                    border: theme => `1px solid ${theme.palette.divider}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: theme => theme.spacing(2)
                  }}
                >
                  <Box
                    sx={{
                      width: theme => theme.spacing(2.5),
                      height: theme => theme.spacing(2.5),
                      borderRadius: '50%',
                      backgroundColor: theme => theme.palette.success.main,
                      animation: 'pulse 1.5s ease-in-out infinite',
                      '@keyframes pulse': {
                        '0%': { opacity: 0.6, transform: 'scale(0.8)' },
                        '50%': { opacity: 1, transform: 'scale(1)' },
                        '100%': { opacity: 0.6, transform: 'scale(0.8)' },
                      },
                    }}
                  />
                  <Typography 
                    variant="body2" 
                    sx={{ 
                      color: theme => theme.palette.text.secondary,
                      fontWeight: theme => theme.typography.fontWeightMedium,
                      fontFamily: theme => theme.typography.fontFamily
                    }}
                  >
                    Thinking...
                  </Typography>
                </Paper>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
            </Box>
          </Box>

          {/* Input Area - Fixed at Bottom */}
          <Box
            sx={{
              padding: theme => theme.spacing(0, 10), // No top/bottom padding, 40px horizontal
              backgroundColor: theme => theme.palette.background.paper,
              flexShrink: 0,
              display: 'flex',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            <Box sx={{ width: '100%', maxWidth: theme => theme.spacing(180) }}>
              <UserInput
                onSendMessage={handleSendMessage}
                disabled={isLoading}
                placeholder={isLoading ? "Sending..." : "Type your message..."}
              />
            </Box>

            {/* Floating Review Button */}
            <Box
              sx={{
                position: 'absolute',
                right: theme => theme.spacing(12),
                top: '50%',
                transform: 'translateY(-50%)',
                zIndex: 1,
              }}
            >
              <Button
                variant="ghost"
                size="sm"
                startIcon={<ReviewIcon />}
                onClick={() => setIsReviewDrawerOpen(true)}
                sx={{
                  borderRadius: theme => theme.spacing(2),
                  boxShadow: theme => theme.shadows[2],
                  backgroundColor: theme => theme.palette.background.paper,
                  border: theme => `1px solid ${theme.palette.divider}`,
                  minWidth: 'auto',
                  px: theme => theme.spacing(1.5),
                  '&:hover': {
                    boxShadow: theme => theme.shadows[4],
                  },
                }}
              >
                Review
              </Button>
            </Box>
          </Box>
      </Box>


      {/* Review Drawer */}
      <ReviewDrawer
        isOpen={isReviewDrawerOpen}
        onClose={() => setIsReviewDrawerOpen(false)}
        messages={messages}
        connectionStatus={connectionStatus}
        conversationId={conversationId}
        emailTemplate={welcomeEmailTemplate}
      />
    </Box>
  );
}