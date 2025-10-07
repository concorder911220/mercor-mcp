import React, { useState } from 'react';
import {
  List, ListItemButton, ListItemText, Typography, Box,
  CircularProgress, IconButton,
} from '@mui/material';
import { styled, useTheme } from '@mui/material/styles';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@rialto/ui';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { useGetAllConversationsQuery } from '../redux/conversation/conversationApi';
import { ConversationSummary } from '../types/index';

// Task list styling
const StyledContainer = styled(Box)<{ collapsed?: boolean }>(({ theme, collapsed }) => ({
  backgroundColor: theme.palette.background.paper,
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  width: collapsed ? theme.spacing(6) : '100%',
  minWidth: collapsed ? theme.spacing(6) : theme.spacing(40),
  transition: 'width 0.3s ease-in-out, min-width 0.3s ease-in-out',
  position: 'relative',
  borderRight: collapsed ? 'none' : `1px solid ${theme.palette.divider}`,
}));

const CollapseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  width: theme.spacing(4),
  height: theme.spacing(4),
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.divider}`,
  zIndex: 1000,
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

const ExpandButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: theme.spacing(1),
  right: theme.spacing(1),
  width: theme.spacing(4),
  height: theme.spacing(4),
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  zIndex: 1000,
  '&:hover': {
    backgroundColor: theme.palette.primary.dark,
  },
}));

const Header = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 2, 1, 2),
  backgroundColor: theme.palette.background.paper,
}));

const Title = styled(Typography)(({ theme }) => ({
  fontSize: theme.typography.body2.fontSize,
  fontWeight: theme.typography.fontWeightRegular,
  color: theme.palette.text.disabled,
  marginBottom: theme.spacing(1.5),
}));

const StyledListItemButton = styled(ListItemButton)(({ theme }) => ({
  padding: theme.spacing(1, 2),
  margin: theme.spacing(0.25, 1),
  borderRadius: theme.shape.borderRadius,
  minHeight: theme.spacing(5.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&.Mui-selected': {
    backgroundColor: theme.palette.action.selected,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  },
}));

const ConversationText = styled(ListItemText)(({ theme }) => ({
  '& .MuiListItemText-primary': {
    fontSize: theme.typography.body2.fontSize,
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    lineHeight: theme.typography.body2.lineHeight,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  '& .MuiListItemText-secondary': {
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.disabled,
    lineHeight: theme.typography.caption.lineHeight,
  },
}));


const LoadingBox = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  padding: theme.spacing(2.5),
}));

const ErrorBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
}));

const EmptyBox = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
}));

const StartTaskButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(1),
}));

interface ConversationListProps {
  title?: string;
  showNewButton?: boolean;
}

export function ConversationList({
  title = "Recent tasks",
  showNewButton = true,
}: ConversationListProps) {
  const [collapsed, setCollapsed] = useState(false);

  // Fetches up to 20 most recent conversations ordered by timestamp (most recent first)
  const { data: conversations, isLoading, error, refetch } = useGetAllConversationsQuery();
  const location = useLocation();
  const theme = useTheme();

  const handleRetry = () => { refetch(); };

  const formatConversationTitle = (title: string) => {
    if (title.length > 30) {
      return title.substring(0, 30) + '...';
    }
    return title;
  };

  const formatConversationDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const handleToggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  return (
    <StyledContainer collapsed={collapsed}>
      {collapsed ? (
        <ExpandButton onClick={handleToggleCollapse} size="small">
          <ChevronRightIcon fontSize="small" />
        </ExpandButton>
      ) : (
        <>
          <CollapseButton onClick={handleToggleCollapse} size="small">
            <ChevronLeftIcon fontSize="small" />
          </CollapseButton>
          <Header>
        {showNewButton && (
          <>
            <Link to="/" style={{ textDecoration: 'none' }}>
              <Button variant="ghost" size="sm" startIcon={<AddIcon />} sx={{ width: '100%', justifyContent: 'flex-start' }}>
                New task
              </Button>
            </Link>
            <Box sx={{ mt: theme.spacing(1) }}>
              <Button variant="ghost" size="sm" startIcon={<SearchIcon />} sx={{ width: '100%', justifyContent: 'flex-start' }}>
                Search tasks
              </Button>
            </Box>
          </>
        )}
      </Header>

      <Box sx={{ px: theme.spacing(2), pb: theme.spacing(1), pt: theme.spacing(3) }}>
        <Title variant="body2">
          {title}
        </Title>
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', padding: theme.spacing(1, 0) }}>
        {isLoading ? (
          <LoadingBox>
            <CircularProgress size={20} sx={{ color: theme.palette.text.secondary }} />
          </LoadingBox>
        ) : error ? (
          <ErrorBox>
            <Typography variant="body2" sx={{ color: theme.palette.error.main }} gutterBottom>
              Failed to load tasks
            </Typography>
            <Button variant="secondary" size="sm" onClick={handleRetry} sx={{ mt: theme.spacing(1) }}>
              Retry
            </Button>
          </ErrorBox>
        ) : conversations && conversations.length > 0 ? (
          <List sx={{ padding: 0 }}>
            {conversations.map((conversation: ConversationSummary) => (
              <Link
                key={conversation.id}
                to={`/task/${conversation.id}`}
                style={{ textDecoration: 'none' }}
              >
                <StyledListItemButton
                  selected={location.pathname === `/task/${conversation.id}`}
                >
                  <ConversationText
                    primary={formatConversationTitle(conversation.title)}
                    secondary={formatConversationDate(conversation.created_at)}
                  />
                </StyledListItemButton>
              </Link>
            ))}
          </List>
        ) : (
          <EmptyBox>
            <Typography variant="body2" sx={{ color: theme.palette.text.secondary }} gutterBottom>
              No tasks yet
            </Typography>
            <Typography variant="caption" sx={{ color: theme.palette.text.disabled }} display="block" gutterBottom>
              Start a new task to begin
            </Typography>
            <Link to="/task/new" style={{ textDecoration: 'none' }}>
              <StartTaskButton variant="primary" size="sm">
                Start New Task
              </StartTaskButton>
            </Link>
          </EmptyBox>
          )}
        </Box>
        </>
      )}
    </StyledContainer>
  );
}
