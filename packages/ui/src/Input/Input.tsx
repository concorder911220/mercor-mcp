import React from 'react';
import { TextField, TextFieldProps as MuiTextFieldProps, InputAdornment, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Clear } from '@mui/icons-material';

export interface InputProps extends Omit<MuiTextFieldProps, 'variant' | 'size'> {
  size?: 'sm' | 'md' | 'lg';
  clearable?: boolean;
  onClear?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  success?: boolean;
}

const StyledTextField = styled(TextField)<InputProps>(({ theme, size, success }) => ({
  '& .MuiOutlinedInput-root': {
    // Size variants
    ...(size === 'sm' && {
      '& input': {
        padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
        fontSize: theme.typography.body2.fontSize,
      },
      minHeight: theme.spacing(8),
    }),
    ...(size === 'md' && {
      '& input': {
        padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
        fontSize: theme.typography.body1.fontSize,
      },
      minHeight: theme.spacing(10),
    }),
    ...(size === 'lg' && {
      '& input': {
        padding: `${theme.spacing(3)} ${theme.spacing(5)}`,
        fontSize: theme.typography.body1.fontSize,
      },
      minHeight: theme.spacing(12),
    }),

    // Success state
    ...(success && {
      '& fieldset': {
        borderColor: theme.palette.success.main,
      },
      '&:hover fieldset': {
        borderColor: theme.palette.success.main,
      },
      '&.Mui-focused fieldset': {
        borderColor: theme.palette.success.main,
      },
    }),
  },
}));

export const Input = React.forwardRef<HTMLDivElement, InputProps>(
  ({ 
    size = 'md', 
    clearable, 
    onClear, 
    leftIcon, 
    rightIcon, 
    success, 
    value,
    onChange,
    ...props 
  }, ref) => {
    const handleClear = () => {
      if (onClear) {
        onClear();
      }
      if (onChange) {
        // Simulate clearing the input
        const event = {
          target: { value: '' }
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(event);
      }
    };

    const startAdornment = leftIcon ? (
      <InputAdornment position="start">
        {leftIcon}
      </InputAdornment>
    ) : undefined;

    const endAdornmentElements = [];
    
    if (clearable && value) {
      endAdornmentElements.push(
        <IconButton
          key="clear"
          size="small"
          onClick={handleClear}
          edge="end"
        >
          <Clear />
        </IconButton>
      );
    }
    
    if (rightIcon) {
      endAdornmentElements.push(
        <div key="right-icon">
          {rightIcon}
        </div>
      );
    }

    const endAdornment = endAdornmentElements.length > 0 ? (
      <InputAdornment position="end">
        {endAdornmentElements}
      </InputAdornment>
    ) : undefined;

    return (
      <StyledTextField
        ref={ref}
        variant="outlined"
        size={size as any}
        value={value}
        onChange={onChange}
        success={success}
        InputProps={{
          startAdornment,
          endAdornment,
        }}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';