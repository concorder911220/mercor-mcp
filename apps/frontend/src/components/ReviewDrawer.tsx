import React, { useState, useEffect } from 'react';
import { Box, Typography, Drawer, TextField, Chip, Avatar, Skeleton } from '@mui/material';
import { CheckCircle as ApproveIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { Button } from '@rialto/ui';
import { ChatMessage } from '../types/index';
import { EmailTemplate } from '../mocks/welcome_email';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { useDispatch } from 'react-redux';
import { addMessage, openChat } from '../redux/chat/chatSlice';

interface ReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  messages: ChatMessage[];
  connectionStatus: 'connected' | 'connecting' | 'disconnected' | 'error';
  conversationId?: string;
  emailTemplate: EmailTemplate;
  onChatMessage?: (message: string) => void;
  onApprove?: (email: EmailTemplate) => void;
}

export default function ReviewDrawer({
  isOpen,
  onClose,
  messages,
  connectionStatus,
  conversationId,
  emailTemplate,
  onChatMessage,
  onApprove
}: ReviewDrawerProps) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [toEmail, setToEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Simulate loading email content when drawer opens
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      setToEmail('');
      setSubject('');
      setEditorContent('');
      
      // Open chat and send first message
      dispatch(openChat());
      dispatch(addMessage({ text: "Let me generate an email for you", isUser: false }));
      
      setTimeout(() => {
        setToEmail(emailTemplate.to);
        setSubject(emailTemplate.subject);
        setEditorContent(emailTemplate.content);
        setIsLoading(false);
        
        // Send second chat message after loading is complete
        setTimeout(() => {
          dispatch(addMessage({ text: "Done! Let me know if you'd like any adjustments", isUser: false }));
        }, 200); // Small delay after content loads
      }, 500);
    }
  }, [isOpen, emailTemplate, dispatch]);

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      variant="temporary"
      ModalProps={{
        disableEscapeKeyDown: false,
      }}
      sx={{
        '& .MuiDrawer-paper': {
          width: '70%',
          border: theme => `1px solid ${theme.palette.divider}`,
          borderRadius: theme => `${theme.spacing(1)} ${theme.spacing(1)} 0 0`,
          borderBottom: 'none',
          boxShadow: theme => '0 2px 8px rgba(0,0,0,0.08)',
          backgroundColor: theme => theme.palette.background.paper,
        },
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header - matching extracted fields format */}
        <Box sx={{
          p: theme => theme.spacing(4),
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h6">
              Generate Email
            </Typography>
            
          </Box>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="ghost"
              size="sm"
              startIcon={
                isApproving ? (
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        border: `2px solid ${theme.palette.primary.main}`,
                        borderTop: `2px solid transparent`,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        '@keyframes spin': {
                          '0%': { transform: 'rotate(0deg)' },
                          '100%': { transform: 'rotate(360deg)' }
                        }
                      }}
                    />
                  </Box>
                ) : (
                  <ApproveIcon />
                )
              }
              disabled={isApproving}
              onClick={() => {
                setIsApproving(true);
                setTimeout(() => {
                  setIsApproving(false);
                  console.log('Approve & send clicked');
                  console.log('Email data:', { to: toEmail, subject, content: editorContent });
                  
                  // Call the onApprove callback with the email data
                  if (onApprove) {
                    const emailData = {
                      ...emailTemplate,
                      to: toEmail,
                      subject,
                      content: editorContent
                    };
                    onApprove(emailData);
                  }
                  
                  onClose();
                }, 500);
              }}
              sx={{
                border: `1px solid ${theme.palette.primary.main}`,
                color: theme.palette.primary.main,
                backgroundColor: 'transparent',
                '&:hover': {
                  backgroundColor: theme.palette.primary.main,
                  color: 'white',
                },
                '&:disabled': {
                  border: `1px solid ${theme.palette.grey[300]}`,
                  color: theme.palette.grey[500],
                  backgroundColor: 'transparent',
                },
              }}
            >
              Approve & send
            </Button>
            <Button
              variant="primary"
              size="sm"
              startIcon={
                <Box
                  component="img"
                  src="/acacia_logo.png"
                  alt="Auto-pilot"
                  sx={{
                    width: 24,
                    height: 16,
                    filter: 'brightness(0) invert(1)'
                  }}
                />
              }
              title="Turn on auto-pilot to approve similar documents in the future"
              onClick={() => {
                console.log('Auto-pilot clicked');
                onClose();
              }}
            >
              Auto-pilot
            </Button>
          </Box>
        </Box>

        {/* Content Area */}
        <Box sx={{
          p: theme => theme.spacing(4),
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden' // Prevent unnecessary scrolling
        }}>
          {isLoading ? (
            <>
              {/* To Field Skeleton */}
              <Box sx={{ mb: theme => theme.spacing(2) }}>
                <Skeleton 
                  variant="rectangular" 
                  width={120} 
                  height={32} 
                  sx={{ borderRadius: 2 }}
                />
              </Box>

              {/* Subject Field Skeleton */}
              <Box sx={{ mb: theme => theme.spacing(2) }}>
                <Skeleton variant="text" width={60} height={20} sx={{ mb: 1 }} />
                <Skeleton 
                  variant="rectangular" 
                  height={40} 
                  sx={{ borderRadius: 1 }}
                />
              </Box>

              {/* Editor Skeleton */}
              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Skeleton 
                  variant="rectangular" 
                  height={40} 
                  sx={{ mb: 1, borderRadius: 1 }}
                />
                <Skeleton 
                  variant="rectangular" 
                  height="100%" 
                  sx={{ borderRadius: 1 }}
                />
              </Box>
            </>
          ) : (
            <>
              {/* To Field */}
              <Box sx={{ mb: theme => theme.spacing(2) }}>
                <Chip
                  avatar={
                    <Avatar sx={{ 
                      width: 24, 
                      height: 24, 
                      backgroundColor: 'grey.400',
                      fontSize: '0.75rem'
                    }}>
                      {toEmail.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                  label={toEmail}
                  variant="outlined"
                  size="small"
                  sx={{
                    backgroundColor: 'grey.50',
                    borderColor: 'grey.300',
                    '& .MuiChip-label': {
                      fontSize: '0.875rem',
                      fontWeight: 500
                    }
                  }}
                />
              </Box>

              {/* Subject Field */}
              <Box sx={{ mb: theme => theme.spacing(2) }}>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 'medium' }}>
                  Subject:
                </Typography>
                <TextField
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  fullWidth
                  size="small"
                  variant="outlined"
                  placeholder="Enter email subject..."
                />
              </Box>

              <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
                <ReactQuill
                  theme="snow"
                  value={editorContent}
                  onChange={setEditorContent}
                  style={{
                    height: '100%',
                    flex: 1
                  }}
                  modules={{
                    toolbar: [
                      [{ 'header': [1, 2, 3, false] }],
                      ['bold', 'italic', 'underline', 'strike'],
                      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                      ['blockquote', 'code-block'],
                      ['link'],
                      ['clean']
                    ],
                  }}
                  placeholder="Add your welcome packet notes here..."
                />
              </Box>
            </>
          )}
        </Box>
      </Box>
    </Drawer>
  );
}