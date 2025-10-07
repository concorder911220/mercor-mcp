import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Avatar,
  Slide,
  Tooltip,
  Badge
} from '@mui/material';
import { 
  Send, 
  Close, 
  Chat, 
  SmartToy, 
  Person
} from '@mui/icons-material';
import { ChatBubbleProps, ChatBubbleRef } from './ChatBubble.types';
import {
  StyledChatContainer,
  StyledChatButton,
  StyledBubble,
  StyledBubbleHeader,
  StyledBubbleContent,
  StyledMessageArea,
  StyledInputArea,
  StyledTextField,
  StyledSendButton,
  StyledMessageBubble,
  StyledMessageTime
} from './ChatBubble.styles';

export const ChatBubble = forwardRef<ChatBubbleRef, ChatBubbleProps>(
  ({ onMessage, drawerOpen = false, autoOpen = false, messages: externalMessages }, ref) => {
    const [isOpen, setIsOpen] = useState(autoOpen);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; timestamp: string | Date }>>(externalMessages || []);

    // Handle autoOpen prop changes
    useEffect(() => {
      setIsOpen(autoOpen);
    }, [autoOpen]);

    // Sync external messages
    useEffect(() => {
      if (externalMessages) {
        setMessages(externalMessages);
      }
    }, [externalMessages]);

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      addMessage: (text: string, isUser: boolean = false) => {
        const newMessage = {
          text,
          isUser,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
      },
      open: () => setIsOpen(true),
      close: () => setIsOpen(false),
    }));

    const handleSendMessage = () => {
      if (message.trim()) {
        const newMessage = {
          text: message,
          isUser: true,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, newMessage]);
        
        // Call the onMessage callback
        onMessage?.(message);
        
        setMessage('');
      }
    };

    const handleKeyPress = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSendMessage();
      }
    };

    const formatTime = (timestamp: string | Date) => {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
      <StyledChatContainer 
        ref={ref} 
        drawerOpen={drawerOpen}
        onClick={(e) => e.stopPropagation()}
      >
        <Slide direction="up" in={isOpen} mountOnEnter unmountOnExit>
          <StyledBubble>
            <StyledBubbleHeader>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar 
                  sx={{ 
                    width: 32, 
                    height: 32, 
                    backgroundColor: 'primary.main',
                    color: 'primary.contrastText'
                  }}
                >
                  <SmartToy fontSize="small" />
                </Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight="600">
                    Ask Acacia
                  </Typography>
                  <Typography variant="caption" sx={{ opacity: 0.8 }}>
                    Online
                  </Typography>
                </Box>
              </Box>
              <Tooltip title="Close chat">
                <IconButton
                  size="small"
                  onClick={() => setIsOpen(false)}
                  sx={{ color: 'text.secondary' }}
                >
                  <Close fontSize="small" />
                </IconButton>
              </Tooltip>
            </StyledBubbleHeader>
            
            <StyledBubbleContent>
              <StyledMessageArea>
                {messages.length === 0 ? (
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    height: '100%',
                    textAlign: 'center',
                    color: 'text.secondary'
                  }}>
                    <SmartToy sx={{ fontSize: 48, mb: 2, opacity: 0.3 }} />
                    <Typography variant="body2">
                      Start a conversation with Acacia
                    </Typography>
                  </Box>
                ) : (
                  messages.map((msg, index) => (
                    <Box
                      key={index}
                      sx={{
                        display: 'flex',
                        justifyContent: msg.isUser ? 'flex-end' : 'flex-start',
                        mb: 2,
                        alignItems: 'flex-start',
                        gap: 1,
                      }}
                    >
                      {!msg.isUser && (
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: 'caption.fontSize'
                          }}
                        >
                          <SmartToy fontSize="small" />
                        </Avatar>
                      )}
                      <Box sx={{ 
                        maxWidth: '85%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: msg.isUser ? 'flex-end' : 'flex-start'
                      }}>
                        <StyledMessageBubble isUser={msg.isUser}>
                          <Typography variant="body2">
                            {msg.text}
                          </Typography>
                        </StyledMessageBubble>
                        <StyledMessageTime>
                          {formatTime(msg.timestamp)}
                        </StyledMessageTime>
                      </Box>
                      {msg.isUser && (
                        <Avatar 
                          sx={{ 
                            width: 24, 
                            height: 24, 
                            backgroundColor: 'primary.main',
                            color: 'primary.contrastText',
                            fontSize: 'caption.fontSize'
                          }}
                        >
                          <Person fontSize="small" />
                        </Avatar>
                      )}
                    </Box>
                  ))
                )}
              </StyledMessageArea>
              
              <StyledInputArea>
                <StyledTextField
                  multiline
                  maxRows={3}
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  variant="outlined"
                  size="small"
                />
                <StyledSendButton
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                >
                  <Send fontSize="small" />
                </StyledSendButton>
              </StyledInputArea>
            </StyledBubbleContent>
          </StyledBubble>
        </Slide>
        
        <Tooltip title={isOpen ? "Close chat" : "Open chat"}>
          <StyledChatButton
            onClick={() => setIsOpen(!isOpen)}
            sx={{
              backgroundColor: isOpen ? 'grey.500' : 'primary.main',
            }}
          >
            <Badge 
              badgeContent={messages.length} 
              color="error" 
              invisible={messages.length === 0 || isOpen}
            >
              {isOpen ? <Close /> : <Chat />}
            </Badge>
          </StyledChatButton>
        </Tooltip>
      </StyledChatContainer>
    );
  }
);

ChatBubble.displayName = 'ChatBubble';