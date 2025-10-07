
import React, { useState } from 'react';
import { Box, Typography, TextField as MuiTextField } from '@mui/material';

interface TextFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function TextField({ value, onChange }: TextFieldProps) {
  const [isEditing, setIsEditing] = useState(false);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  return (
    <Box onClick={handleClick} sx={{ 
      cursor: 'pointer',
      border: `1px solid ${isEditing ? '#666666' : '#e0e0e0'}`,
      p: 1,
      borderRadius: 1,
      flex: 1,
      width: 'fit-content',
      minWidth: 'fit-content',
      maxWidth: 'fit-content',
      paddingRight: '120px'
    }}>
      {isEditing ? (
        <MuiTextField
          fullWidth
          multiline
          value={value}
          onChange={(e) => onChange(e.target.value)}
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
  );
}
