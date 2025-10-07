import { styled } from '@mui/material/styles';
import { Box, IconButton, Paper, Button, TextField } from '@mui/material';

export const StyledChatContainer = styled(Box, {
  name: 'ChatBubble',
  slot: 'Container',
  shouldForwardProp: (prop) => prop !== 'drawerOpen',
})<{ drawerOpen?: boolean }>(({ theme, drawerOpen }) => ({
  position: 'fixed',
  bottom: theme.spacing(2),
  right: drawerOpen ? 'calc(70% + 16px)' : theme.spacing(2),
  zIndex: theme.zIndex.modal,
  transition: theme.transitions.create(['right'], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
}));

export const StyledChatButton = styled(IconButton, {
  name: 'ChatBubble',
  slot: 'Button',
})(({ theme }) => ({
  width: 60,
  height: 60,
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  boxShadow: theme.shadows[3],
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
    transform: 'scale(1.05)',
    boxShadow: theme.shadows[4],
  },
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.standard,
    easing: theme.transitions.easing.easeInOut,
  }),
}));

export const StyledBubble = styled(Paper, {
  name: 'ChatBubble',
  slot: 'Bubble',
})(({ theme }) => ({
  position: 'absolute',
  bottom: 80,
  right: 0,
  width: 380,
  maxHeight: 500,
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius * 2,
  boxShadow: theme.shadows[4],
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  border: `1px solid ${theme.palette.divider}`,
}));

export const StyledBubbleHeader = styled(Box, {
  name: 'ChatBubble',
  slot: 'Header',
})(({ theme }) => ({
  padding: theme.spacing(2, 3),
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  minHeight: 60,
  borderBottom: `1px solid ${theme.palette.divider}`,
  borderRadius: `${theme.shape.borderRadius * 2} ${theme.shape.borderRadius * 2} 0 0`,
}));

export const StyledBubbleContent = styled(Box, {
  name: 'ChatBubble',
  slot: 'Content',
})(({ theme }) => ({
  padding: theme.spacing(2),
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: theme.spacing(1.5),
  backgroundColor: theme.palette.background.default,
}));

export const StyledMessageArea = styled(Box, {
  name: 'ChatBubble',
  slot: 'MessageArea',
})(({ theme }) => ({
  minHeight: 250,
  maxHeight: 350,
  overflowY: 'auto',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  '&::-webkit-scrollbar': {
    width: '6px',
  },
  '&::-webkit-scrollbar-track': {
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius / 2,
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: theme.palette.grey[400],
    borderRadius: theme.shape.borderRadius / 2,
    '&:hover': {
      backgroundColor: theme.palette.grey[600],
    },
  },
}));

export const StyledInputArea = styled(Box, {
  name: 'ChatBubble',
  slot: 'InputArea',
})(({ theme }) => ({
  display: 'flex',
  gap: theme.spacing(1),
  alignItems: 'flex-end',
  padding: theme.spacing(1),
  backgroundColor: theme.palette.background.paper,
  borderRadius: theme.shape.borderRadius,
  border: `1px solid ${theme.palette.divider}`,
}));

export const StyledTextField = styled(TextField, {
  name: 'ChatBubble',
  slot: 'TextField',
})(({ theme }) => ({
  flex: 1,
  '& .MuiOutlinedInput-root': {
    fontSize: theme.typography.body2.fontSize,
    borderRadius: theme.shape.borderRadius,
    '& fieldset': {
      border: 'none',
    },
    '&:hover fieldset': {
      border: 'none',
    },
    '&.Mui-focused fieldset': {
      border: 'none',
    },
  },
}));

export const StyledSendButton = styled(Button, {
  name: 'ChatBubble',
  slot: 'SendButton',
})(({ theme }) => ({
  minWidth: 'auto',
  width: 44,
  height: 44,
  borderRadius: theme.shape.borderRadius,
  padding: 0,
  backgroundColor: 'transparent',
  color: theme.palette.primary.main,
  border: 'none',
  '&:hover': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  '&:disabled': {
    backgroundColor: 'transparent',
    color: theme.palette.text.disabled,
  },
  transition: theme.transitions.create(['all'], {
    duration: theme.transitions.duration.short,
    easing: theme.transitions.easing.easeInOut,
  }),
}));

export const StyledMessageBubble = styled(Box, {
  name: 'ChatBubble',
  slot: 'MessageBubble',
  shouldForwardProp: (prop) => prop !== 'isUser',
})<{ isUser: boolean }>(({ theme, isUser }) => ({
  maxWidth: '85%',
  padding: theme.spacing(1.5, 2),
  borderRadius: isUser 
    ? `${theme.shape.borderRadius * 2} ${theme.shape.borderRadius * 2} ${theme.shape.borderRadius / 2} ${theme.shape.borderRadius * 2}`
    : `${theme.shape.borderRadius * 2} ${theme.shape.borderRadius * 2} ${theme.shape.borderRadius * 2} ${theme.shape.borderRadius / 2}`,
  backgroundColor: isUser ? theme.palette.primary.main : theme.palette.grey[100],
  color: isUser ? theme.palette.primary.contrastText : theme.palette.text.primary,
  fontSize: theme.typography.body2.fontSize,
  lineHeight: theme.typography.body2.lineHeight,
  wordWrap: 'break-word',
  boxShadow: isUser 
    ? theme.shadows[1]
    : theme.shadows[0],
}));

export const StyledMessageTime = styled(Box, {
  name: 'ChatBubble',
  slot: 'MessageTime',
})(({ theme }) => ({
  fontSize: theme.typography.caption.fontSize,
  color: theme.palette.text.secondary,
  marginTop: theme.spacing(0.5),
  textAlign: 'right',
}));
