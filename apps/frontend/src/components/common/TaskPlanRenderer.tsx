import React, { useState } from 'react';
import { Box, Typography, IconButton, Chip, TextField, Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
// Secure markdown renderer using marked and dompurify
const renderMarkdownSafe = (content: string): string => {
  // marked will escape HTML by default unless renderer options allow raw HTML.
  const dirtyHtml = marked(content, { breaks: true }) as string;
  const cleanHtml = DOMPurify.sanitize(dirtyHtml);
  return cleanHtml;
};

interface TaskPlanRendererProps {
  content: string;
  onEdit?: (content: string, type: 'task_plan' | 'tool_call') => void;
  onAccept?: (content: string, type: 'task_plan' | 'tool_call') => void;
}

interface ToolCallUIProps {
  content: string;
  onEdit: (content: string) => void;
  onAccept: (content: string) => void;
}

const ToolCallUI: React.FC<ToolCallUIProps> = ({ content, onEdit, onAccept }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedData, setEditedData] = useState<any>({});

  // Parse tool call content
  const parseToolCall = (toolCallText: string) => {
    try {
      // Try to parse JSON if the content looks like JSON
      if (toolCallText.trim().startsWith('{') && toolCallText.trim().endsWith('}')) {
        return JSON.parse(toolCallText);
      }
      
      // Otherwise, try to extract structured information
      const lines = toolCallText.split('\n').filter(line => line.trim());
      const result: any = {};
      
      // Look for common patterns like "METHOD /path" or "API: value"
      lines.forEach(line => {
        if (line.includes('POST ') || line.includes('GET ') || line.includes('PUT ') || line.includes('DELETE ')) {
          const parts = line.split(' ');
          result.method = parts[0];
          result.endpoint = parts[1];
        } else if (line.includes(':')) {
          const [key, value] = line.split(':').map(s => s.trim());
          result[key.toLowerCase()] = value;
        }
      });
      
      return Object.keys(result).length > 0 ? result : { raw: toolCallText };
    } catch (error) {
      return { raw: toolCallText };
    }
  };

  const toolCallData = parseToolCall(content);
  
  React.useEffect(() => {
    setEditedData(toolCallData);
  }, [content]);

  const handleSave = () => {
    const jsonString = JSON.stringify(editedData, null, 2);
    onEdit(jsonString);
    setIsEditing(false);
  };

  const handleAccept = () => {
    const jsonString = JSON.stringify(editedData, null, 2);
    onAccept(jsonString);
  };

  // Detect if this is an email tool call
  const isEmailToolCall = () => {
    return toolCallData.to_emails || toolCallData.to || toolCallData.subject || toolCallData.body || 
           (toolCallData.endpoint && toolCallData.endpoint.includes('email'));
  };

  // Render email preview
  const renderEmailPreview = () => {
    const toEmails = toolCallData.to_emails || toolCallData.to || ['recipient@example.com'];
    const subject = toolCallData.subject || 'No Subject';
    const body = toolCallData.body || toolCallData.message || 'No content';

    return (
      <Box
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          backgroundColor: 'white',
          overflow: 'hidden',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        {/* Email Header */}
        <Box sx={{ p: 2, backgroundColor: '#f8f9fa', borderBottom: '1px solid #e0e0e0' }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#1976d2' }}>
            📧 Email Draft
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
            <Typography sx={{ fontWeight: 'bold', minWidth: 70, color: 'text.secondary', fontSize: '0.875rem' }}>
              To:
            </Typography>
            <Typography 
              sx={{ 
                flex: 1, 
                backgroundColor: isEditing ? 'white' : 'transparent',
                p: isEditing ? 1 : 0,
                borderRadius: isEditing ? 1 : 0,
                border: isEditing ? '1px solid #ddd' : 'none',
                fontSize: '0.875rem',
                cursor: isEditing ? 'text' : 'default'
              }}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
                             onBlur={(e: React.FocusEvent<HTMLElement>) => setEditedData({...editedData, to_emails: [(e.target as HTMLElement).textContent || '']})}
             >
               {Array.isArray(toEmails) ? toEmails.join(', ') : String(toEmails)}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
            <Typography sx={{ fontWeight: 'bold', minWidth: 70, color: 'text.secondary', fontSize: '0.875rem' }}>
              Subject:
            </Typography>
            <Typography 
              sx={{ 
                flex: 1, 
                backgroundColor: isEditing ? 'white' : 'transparent',
                p: isEditing ? 1 : 0,
                borderRadius: isEditing ? 1 : 0,
                border: isEditing ? '1px solid #ddd' : 'none',
                fontSize: '0.875rem',
                fontWeight: 'bold',
                cursor: isEditing ? 'text' : 'default'
              }}
              contentEditable={isEditing}
              suppressContentEditableWarning={true}
                             onBlur={(e: React.FocusEvent<HTMLElement>) => setEditedData({...editedData, subject: (e.target as HTMLElement).textContent || ''})}
             >
               {String(subject)}
            </Typography>
          </Box>
        </Box>
        
        {/* Email Body */}
        <Box sx={{ p: 3 }}>
          <Typography 
            sx={{ 
              whiteSpace: 'pre-wrap', 
              lineHeight: 1.6,
              fontSize: '0.875rem',
              backgroundColor: isEditing ? '#f9f9f9' : 'transparent',
              p: isEditing ? 2 : 0,
              borderRadius: isEditing ? 1 : 0,
              border: isEditing ? '1px dashed #ddd' : 'none',
              minHeight: isEditing ? 100 : 'auto',
              cursor: isEditing ? 'text' : 'default',
              '&:focus': {
                outline: 'none',
                backgroundColor: '#f0f8ff'
              }
            }}
            contentEditable={isEditing}
            suppressContentEditableWarning={true}
                         onBlur={(e: React.FocusEvent<HTMLElement>) => setEditedData({...editedData, body: (e.target as HTMLElement).textContent || ''})}
           >
             {String(body)}
          </Typography>
        </Box>
      </Box>
    );
  };

  // Render other types of tool calls
  const renderGenericToolCall = () => {
    return (
      <Box
        sx={{
          border: '1px solid #e0e0e0',
          borderRadius: 2,
          backgroundColor: 'white',
          p: 2,
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, color: '#ff9800' }}>
          🔧 {toolCallData.method || 'API'} {toolCallData.endpoint || 'Call'}
        </Typography>
        
        {Object.entries(toolCallData).map(([key, value]) => {
          if (key === 'method' || key === 'endpoint') return null;
          
          return (
            <Box key={key} sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 'bold', mb: 0.5 }}>
                {key}:
              </Typography>
              <Typography 
                sx={{ 
                  whiteSpace: 'pre-wrap',
                  backgroundColor: isEditing ? '#f9f9f9' : '#f5f5f5',
                  p: 1.5,
                  borderRadius: 1,
                  border: isEditing ? '1px dashed #ddd' : '1px solid #e0e0e0',
                  fontSize: '0.875rem',
                  cursor: isEditing ? 'text' : 'default',
                  '&:focus': {
                    outline: 'none',
                    backgroundColor: '#f0f8ff'
                  }
                }}
                contentEditable={isEditing}
                suppressContentEditableWarning={true}
                                 onBlur={(e: React.FocusEvent<HTMLElement>) => setEditedData({...editedData, [key]: (e.target as HTMLElement).textContent})}
               >
                 {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    );
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 'bold', color: '#ff9800' }}>
          {isEmailToolCall() ? '📧 Email will be sent' : '🔧 Tool will be executed'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {isEditing ? (
            <>
              <IconButton
                size="small"
                onClick={() => setIsEditing(false)}
                sx={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                ✕
              </IconButton>
              <IconButton
                size="small"
                onClick={handleSave}
                sx={{
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  '&:hover': { backgroundColor: '#f0f0f0' }
                }}
              >
                💾
              </IconButton>
            </>
          ) : (
            <IconButton
              size="small"
              onClick={() => setIsEditing(true)}
              sx={{
                backgroundColor: 'white',
                border: '1px solid #ddd',
                '&:hover': { backgroundColor: '#f0f0f0' }
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          )}
          <IconButton
            size="small"
            onClick={handleAccept}
            sx={{
              backgroundColor: 'white',
              border: '1px solid #ddd',
              '&:hover': { backgroundColor: '#f0f0f0' }
            }}
          >
            <CheckIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {isEmailToolCall() ? renderEmailPreview() : renderGenericToolCall()}

      {/* Show raw JSON in an accordion for advanced users */}
      <Accordion sx={{ mt: 2, bgcolor: '#fafafa' }}>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Show Raw Data
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography 
            variant="body2"
            sx={{
              whiteSpace: 'pre-wrap',
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
              fontSize: '0.75rem',
              backgroundColor: '#f5f5f5',
              p: 1,
              borderRadius: 1
            }}
          >
            {JSON.stringify(editedData, null, 2)}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  );
};

export const TaskPlanRenderer: React.FC<TaskPlanRendererProps> = ({ 
  content, 
  onEdit, 
  onAccept 
}) => {
  // Parse content to extract task plans and tool calls
  function parseContent(text: string) {
    const parts: Array<{
      type: 'text' | 'task_plan' | 'tool_call';
      content: string;
      id: string;
    }> = [];

    // Regex to match <task_plan>...</task_plan> and <tool_call...>...</tool_call>
    const taskPlanRegex = /<task_plan>([\s\S]*?)<\/task_plan>/gi;
    const toolCallRegex = /<tool_call[^>]*>([\s\S]*?)<\/tool_call>/gi;
    
    let lastIndex = 0;
    const allMatches: Array<{
      match: RegExpExecArray;
      type: 'task_plan' | 'tool_call';
    }> = [];

    // Find all task_plan matches
    let match;
    while ((match = taskPlanRegex.exec(text)) !== null) {
      allMatches.push({ match, type: 'task_plan' });
    }

    // Find all tool_call matches
    while ((match = toolCallRegex.exec(text)) !== null) {
      allMatches.push({ match, type: 'tool_call' });
    }

    // Sort matches by their position in the text
    allMatches.sort((a, b) => a.match.index - b.match.index);

    // Process matches in order
    allMatches.forEach(({ match, type }) => {
      // Add text before the match
      if (match.index > lastIndex) {
        const beforeText = text.slice(lastIndex, match.index);
        if (beforeText.trim()) {
          parts.push({
            type: 'text',
            content: beforeText,
            id: `text-${Date.now()}-${Math.random()}`
          });
        }
      }

      // Add the matched section
      parts.push({
        type,
        content: match[1].trim(),
        id: `${type}-${Date.now()}-${Math.random()}`
      });

      lastIndex = match.index + match[0].length;
    });

    // Add remaining text after the last match
    if (lastIndex < text.length) {
      const remainingText = text.slice(lastIndex);
      if (remainingText.trim()) {
        parts.push({
          type: 'text',
          content: remainingText,
          id: `text-${Date.now()}-${Math.random()}`
        });
      }
    }

    // If no matches found, return the entire content as text
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: text,
        id: `text-${Date.now()}-${Math.random()}`
      });
    }

    return parts;
  }

  const parsedContent = parseContent(content);

  const handleEdit = (content: string, type: 'task_plan' | 'tool_call') => {
    onEdit?.(content, type);
  };

  const handleAccept = (content: string, type: 'task_plan' | 'tool_call') => {
    onAccept?.(content, type);
  };

  return (
    <Box>
      {parsedContent.map((part) => {
        if (part.type === 'text') {
          // Render regular text as markdown
          return (
            <Box
              key={part.id}
              sx={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                lineHeight: 1.6,
                '& p': { 
                  mb: 1,
                  fontFamily: 'inherit'
                },
                '& h1, & h2, & h3, & h4, & h5, & h6': { 
                  mt: 2, 
                  mb: 1, 
                  fontWeight: 'bold',
                  fontFamily: 'inherit'
                },
                '& ul, & ol': { 
                  pl: 2, 
                  mb: 1,
                  fontFamily: 'inherit'
                },
                '& li': { 
                  mb: 0.5,
                  fontFamily: 'inherit'
                },
                '& code': {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  padding: '2px 4px',
                  borderRadius: '4px',
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: '0.875em'
                },
                '& pre': {
                  backgroundColor: 'rgba(0, 0, 0, 0.1)',
                  padding: '12px',
                  borderRadius: '8px',
                  overflow: 'auto',
                  mb: 1,
                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
                },
                '& blockquote': {
                  borderLeft: '4px solid #ddd',
                  pl: 2,
                  ml: 0,
                  fontStyle: 'italic',
                  color: 'text.secondary',
                  fontFamily: 'inherit'
                },
                '& strong, & b': {
                  fontWeight: 'bold',
                  fontFamily: 'inherit'
                },
                '& em, & i': {
                  fontStyle: 'italic',
                  fontFamily: 'inherit'
                }
              }}
            >
              <div dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(part.content) }} />
            </Box>
          );
        }

        // Render task plan or tool calls as grey boxes
        return (
          <Box
            key={part.id}
            sx={{
              backgroundColor: '#f5f5f5',
              border: '1px solid #e0e0e0',
              borderRadius: 2,
              p: 2,
              mb: 2,
              mt: 1,
              position: 'relative'
            }}
          >
            {/* Header with type label and action buttons */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 1
              }}
            >
              <Chip
                label={part.type === 'task_plan' ? 'Task Plan' : 'Tool Call'}
                size="small"
                sx={{
                  backgroundColor: part.type === 'task_plan' ? '#2196f3' : '#ff9800',
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <IconButton
                  size="small"
                  onClick={() => handleEdit(part.content, part.type as 'task_plan' | 'tool_call')}
                  sx={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
                <IconButton
                  size="small"
                  onClick={() => handleAccept(part.content, part.type as 'task_plan' | 'tool_call')}
                  sx={{
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    '&:hover': {
                      backgroundColor: '#f0f0f0'
                    }
                  }}
                >
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Box>
            </Box>

            {/* Content - render as markdown for task_plan, custom UI for tool_call */}
            {part.type === 'task_plan' ? (
              <Box
                sx={{
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                  '& p': { mb: 1 },
                  '& ul, & ol': { pl: 2, mb: 1 },
                  '& li': { mb: 0.5 }
                }}
              >
                <div dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(part.content) }} />
              </Box>
            ) : (
              <ToolCallUI
                content={part.content}
                onEdit={(content) => handleEdit(content, 'tool_call')}
                onAccept={(content) => handleAccept(content, 'tool_call')}
              />
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default TaskPlanRenderer; 