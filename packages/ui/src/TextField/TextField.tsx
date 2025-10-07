import React, { useState, useEffect } from 'react';
import { 
  TextField as MuiTextField, 
  TextFieldProps as MuiTextFieldProps,
  IconButton,
  InputAdornment,
  Typography,
  Box
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Check, Close, Edit } from '@mui/icons-material';

export interface TextFieldProps extends Omit<MuiTextFieldProps, 'variant' | 'size'> {
  variant?: 'default' | 'large' | 'editable';
  size?: 'sm' | 'md' | 'lg';
  helperText?: string;
  error?: boolean;
  success?: boolean;
  onSave?: (value: string) => void;
  onCancel?: () => void;
}

const StyledTextField = styled(MuiTextField, {
  shouldForwardProp: (prop: string) => !['variant', 'size', 'success'].includes(prop),
})<TextFieldProps>(({ theme, variant, size, success }) => ({
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

    // Variant styles
    ...(variant === 'large' && {
      '& input': {
        fontSize: theme.typography.h6.fontSize,
        fontWeight: theme.typography.fontWeightMedium,
      },
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

const EditableContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(1),
  minHeight: theme.spacing(10),
}));

const EditableText = styled(Typography)(({ theme }) => ({
  cursor: 'pointer',
  padding: theme.spacing(1),
  borderRadius: theme.spacing(0.5),
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
}));

export const TextField = React.forwardRef<HTMLDivElement, TextFieldProps>(
  ({ 
    variant = 'default',
    size = 'md',
    helperText,
    error,
    success,
    onSave,
    onCancel,
    value: propValue = '',
    onChange,
    ...props 
  }, ref) => {
    const [isEditing, setIsEditing] = useState(false);
    const [internalValue, setInternalValue] = useState(propValue);

    useEffect(() => {
      setInternalValue(propValue);
    }, [propValue]);

    const handleEdit = () => {
      setIsEditing(true);
    };

    const handleSave = () => {
      if (onSave) {
        onSave(String(internalValue));
      }
      setIsEditing(false);
    };

    const handleCancel = () => {
      setInternalValue(propValue);
      if (onCancel) {
        onCancel();
      }
      setIsEditing(false);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault();
        handleSave();
      } else if (event.key === 'Escape') {
        handleCancel();
      }
    };

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = event.target.value;
      setInternalValue(newValue);
      if (onChange) {
        onChange(event);
      }
    };

    if (variant === 'editable') {
      return (
        <EditableContainer ref={ref}>
          {isEditing ? (
            <>
              <StyledTextField
                variant={"outlined" as any}
                value={internalValue}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                helperText={helperText}
                error={error}
                autoFocus
                {...props}
              />
              <IconButton size="small" onClick={handleSave} color="primary">
                <Check fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={handleCancel}>
                <Close fontSize="small" />
              </IconButton>
            </>
          ) : (
            <>
              <EditableText
                variant={size === 'sm' ? 'body2' : 'body1'}
                onClick={handleEdit}
              >
                {String(internalValue || props.placeholder || 'Click to edit...')}
              </EditableText>
              <IconButton size="small" onClick={handleEdit}>
                <Edit fontSize="small" />
              </IconButton>
            </>
          )}
        </EditableContainer>
      );
    }

    const endAdornment = props.InputProps?.endAdornment ? (
      <InputAdornment position="end">
        {props.InputProps.endAdornment}
      </InputAdornment>
    ) : undefined;

    return (
      <StyledTextField
        ref={ref}
        variant={"outlined" as any}
        value={propValue}
        onChange={onChange}
        helperText={helperText}
        error={error}
        InputProps={{
          ...props.InputProps,
          endAdornment,
        }}
        {...props}
      />
    );
  }
);

TextField.displayName = 'TextField';