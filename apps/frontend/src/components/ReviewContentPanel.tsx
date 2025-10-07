import React, { useState } from 'react';
import { Box, Typography, TextField as MuiTextField } from '@mui/material';
import { TextField } from './common/TextField';
import { TextFieldLarge } from './common/TextFieldLarge';
import { DateField } from './common/DateField';

interface ReviewContentPanelProps {
  content: Record<string, string>;
}

export function ReviewContentPanel({ content }: ReviewContentPanelProps) {
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editedContent, setEditedContent] = useState(content);

  const handleClick = (key: string) => {
    setEditingKey(key);
  };

  const handleBlur = () => {
    setEditingKey(null);
  };

  const handleChange = (key: string, value: string) => {
    setEditedContent(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <Box sx={{ display: "grid", gap: 1.5, p: 1.5 }}>
      {Object.entries(editedContent).map(([key, value]) => (
        <Box key={key} sx={{ 
          display: 'flex', 
          alignItems: key === 'notes' ? 'flex-start' : 'center',
          flexDirection: key === 'notes' ? 'column' : 'row',
          gap: key === 'notes' ? 1 : 0.5,
          ...((['title', 'date', 'attendees'].includes(key)) && {
            '& > div:last-child': {
              minWidth: 'fit-content',
              maxWidth: 'calc(100% - 120px)'
            }
          })
        }}>
          <Typography variant="h6" sx={{ 
            width: key === 'notes' ? '100%' : '100px',
            flexShrink: 0,
            mb: key === 'notes' ? 0.5 : 0,
            fontSize: '16px',
            fontWeight: 500,
            lineHeight: 1.4,
            color: '#1f2937',
            textTransform: 'capitalize'
          }}>
            {key.charAt(0).toUpperCase() + key.slice(1)}
          </Typography>
          {key === 'title' ? (
            <TextField 
              value={value} 
              onChange={(newValue) => handleChange(key, newValue)} 
            />
          ) : key === 'date' ? (
            <DateField
              value={value}
              onChange={(newValue) => handleChange(key, newValue)}
            />
          ) : key === 'notes' ? (
            <TextFieldLarge
              value={value}
              onChange={(newValue) => handleChange(key, newValue)}
            />
          ) : (
            <Box onClick={() => handleClick(key)} sx={{ 
              cursor: 'pointer',
              border: `1px solid ${editingKey === key ? '#666666' : '#e0e0e0'}`,
              p: 1,
              borderRadius: 1,
              flex: 1
            }}>
              {editingKey === key ? (
                <MuiTextField
                  fullWidth
                  multiline
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                  onBlur={handleBlur}
                  autoFocus
                  sx={{
                    '& .MuiInputBase-root': {
                      height: 'auto',
                      fontSize: '0.875rem',
                      padding: 0,
                    },
                    '& .MuiInputBase-input': {
                      fontSize: '0.875rem',
                      color: 'text.primary',
                      padding: '0 !important',
                    },
                    '& .MuiOutlinedInput-root': {
                      '& fieldset': {
                        border: 'none'
                      },
                      '&:hover fieldset': {
                        border: 'none'
                      },
                      '&.Mui-focused fieldset': {
                        border: 'none'
                      }
                    }
                  }}
                />
              ) : (
                <Typography 
                  color="text.secondary" 
                  sx={{ 
                    fontSize: '0.875rem',
                    '&:hover': {
                      color: 'text.primary'
                    }
                  }}
                  dangerouslySetInnerHTML={{ __html: value }}
                />
              )}
            </Box>
          )}
        </Box>
      ))}
    </Box>
  );
}

export default ReviewContentPanel;