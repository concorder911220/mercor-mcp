import React, { useState } from 'react';
import {
  Box,
  Typography,
  Chip,
  IconButton,
  Collapse,
  Paper,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  BugReport as DebugIcon,
  Build as ToolIcon,
  Timeline as ProgressIcon,
  CheckCircle as CompletedIcon,
  Error as ErrorIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { ChatMessage } from '../../types/index';

interface SpecialMessageRendererProps {
  message: ChatMessage;
}

export const SpecialMessageRenderer: React.FC<SpecialMessageRendererProps> = ({ message }) => {
  const [expanded, setExpanded] = useState(false);

  if (!message.type || message.type === 'normal') {
    return null;
  }

  const renderDebugMessage = () => (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        backgroundColor: '#f5f5f5',
        border: '1px solid #e0e0e0',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <DebugIcon fontSize="small" color="action" />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
          DEBUG
        </Typography>
        <Chip 
          label={message.metadata?.finish_reason || 'processing'} 
          size="small" 
          variant="outlined"
          sx={{ ml: 'auto' }}
        />
      </Box>
      <Typography variant="body2" sx={{ color: 'text.secondary', fontFamily: 'monospace' }}>
        {message.content}
      </Typography>
    </Paper>
  );

  const renderMcpToolsExecuting = () => (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        backgroundColor: '#e3f2fd',
        border: '1px solid #2196f3',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <CircularProgress size={16} thickness={4} />
        <ToolIcon fontSize="small" color="primary" />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'primary.main' }}>
          EXECUTING TOOLS
        </Typography>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
        {message.metadata?.tools_executing?.map((tool: string, index: number) => (
          <Chip
            key={index}
            label={tool}
            size="small"
            color="primary"
            variant="outlined"
            icon={<ToolIcon />}
          />
        ))}
      </Box>
      <Typography variant="body2" sx={{ color: 'primary.dark' }}>
        {message.content}
      </Typography>
    </Paper>
  );

  const renderMcpProgress = () => (
    <Paper
      elevation={1}
      sx={{
        p: 2,
        backgroundColor: '#fff8e1',
        border: '1px solid #ff9800',
        borderRadius: 2,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <ProgressIcon fontSize="small" color="warning" />
        <Typography variant="caption" sx={{ fontWeight: 600, color: 'warning.main' }}>
          PROGRESS UPDATE
        </Typography>
      </Box>
      <Typography variant="body2" sx={{ color: 'warning.dark' }}>
        {message.content}
      </Typography>
    </Paper>
  );

  const renderMcpToolResult = () => {
    const toolResult = message.metadata?.tool_result;
    const isSuccess = toolResult?.success !== false; // Default to success if not specified
    
    return (
      <Paper
        elevation={1}
        sx={{
          p: 2,
          backgroundColor: isSuccess ? '#e8f5e8' : '#ffebee',
          border: `1px solid ${isSuccess ? '#4caf50' : '#f44336'}`,
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          {isSuccess ? (
            <CompletedIcon fontSize="small" color="success" />
          ) : (
            <ErrorIcon fontSize="small" color="error" />
          )}
          <Typography 
            variant="caption" 
            sx={{ 
              fontWeight: 600, 
              color: isSuccess ? 'success.main' : 'error.main' 
            }}
          >
            TOOL {isSuccess ? 'COMPLETED' : 'FAILED'}
          </Typography>
          <Chip 
            label={message.metadata?.tool_name || 'unknown'} 
            size="small" 
            color={isSuccess ? 'success' : 'error'}
            variant="outlined"
            sx={{ ml: 'auto' }}
          />
        </Box>
        
        <Typography 
          variant="body2" 
          sx={{ 
            color: isSuccess ? 'success.dark' : 'error.dark',
            mb: toolResult ? 1 : 0
          }}
        >
          {message.content}
        </Typography>
        
        {toolResult && (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ p: 0 }}
              >
                {expanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {expanded ? 'Hide' : 'Show'} tool result details
              </Typography>
            </Box>
            
            <Collapse in={expanded}>
              <Divider sx={{ my: 1 }} />
              <Box sx={{ mt: 1 }}>
                {toolResult.processed_data && (
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Processed Data:
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        mt: 0.5,
                        backgroundColor: 'background.default',
                        maxHeight: 200,
                        overflow: 'auto',
                      }}
                    >
                      <pre style={{ 
                        margin: 0, 
                        fontSize: '0.75rem', 
                        lineHeight: 1.4,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {JSON.stringify(toolResult.processed_data, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
                
                {toolResult.original_response && (
                  <Box>
                    <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      Raw Response:
                    </Typography>
                    <Paper
                      variant="outlined"
                      sx={{
                        p: 1,
                        mt: 0.5,
                        backgroundColor: 'background.default',
                        maxHeight: 150,
                        overflow: 'auto',
                      }}
                    >
                      <pre style={{ 
                        margin: 0, 
                        fontSize: '0.75rem', 
                        lineHeight: 1.4,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word'
                      }}>
                        {JSON.stringify(toolResult.original_response, null, 2)}
                      </pre>
                    </Paper>
                  </Box>
                )}
              </Box>
            </Collapse>
          </>
        )}
      </Paper>
    );
  };

  const renderMessage = () => {
    switch (message.type) {
      case 'debug':
        return renderDebugMessage();
      case 'mcp_tools_executing':
        return renderMcpToolsExecuting();
      case 'mcp_progress':
        return renderMcpProgress();
      case 'mcp_tool_result':
        return renderMcpToolResult();
      default:
        return null;
    }
  };

  return (
    <Box sx={{ my: 1 }}>
      {renderMessage()}
      <Typography
        variant="caption"
        sx={{
          display: "block",
          textAlign: "left",
          mt: 0.5,
          color: "text.secondary",
          opacity: 0.7,
          fontSize: '0.7rem'
        }}
      >
        {message.timestamp.toLocaleTimeString()}
      </Typography>
    </Box>
  );
};
