import React from 'react';
import { 
  Select as MuiSelect, 
  SelectProps as MuiSelectProps,
  FormControl,
  InputLabel,
  MenuItem,
  FormHelperText,
  InputAdornment,
  IconButton,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Clear, ExpandMore } from '@mui/icons-material';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  icon?: React.ReactNode;
}

export interface SelectProps extends Omit<MuiSelectProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  options: SelectOption[];
  placeholder?: string;
  success?: boolean;
  helperText?: string;
  clearable?: boolean;
  onClear?: () => void;
}

const StyledFormControl = styled(FormControl, {
  shouldForwardProp: (prop: string) => !['success', 'size'].includes(prop),
})<{ success?: boolean; size?: 'sm' | 'md' | 'lg' }>(({ theme, success, size }) => ({
    '& .MuiOutlinedInput-root': {
      // Size variants
      ...(size === 'sm' && {
        minHeight: '32px',
        '& .MuiSelect-select': {
          padding: theme.spacing(1, 1.5),
          fontSize: theme.typography.body2.fontSize,
        },
      }),
      ...(size === 'md' && {
        minHeight: '40px',
        '& .MuiSelect-select': {
          padding: theme.spacing(1.5, 2),
          fontSize: theme.typography.body1.fontSize,
        },
      }),
      ...(size === 'lg' && {
        minHeight: '48px',
        '& .MuiSelect-select': {
          padding: theme.spacing(2, 2.5),
          fontSize: theme.typography.body1.fontSize,
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
  })
);

export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  ({ 
    size = 'md',
    options,
    placeholder,
    success,
    helperText,
    clearable,
    onClear,
    value,
    onChange,
    label,
    ...props 
  }, ref) => {
    const labelId = `select-label-${Math.random().toString(36).substr(2, 9)}`;
    
    const handleClear = () => {
      if (onClear) {
        onClear();
      }
      if (onChange) {
        // Simulate clearing the select
        const event = {
          target: { value: '' }
        } as any;
        onChange(event, null as any);
      }
    };

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

    const endAdornment = endAdornmentElements.length > 0 ? (
      <InputAdornment position="end">
        {endAdornmentElements}
      </InputAdornment>
    ) : undefined;

    return (
      <StyledFormControl 
        fullWidth 
        variant="outlined" 
        size={size as any}
        success={success as any}
        ref={ref}
      >
        {label && <InputLabel id={labelId}>{label}</InputLabel>}
        <MuiSelect
          labelId={labelId}
          value={value ?? ''}
          onChange={onChange}
          displayEmpty
          IconComponent={ExpandMore}
          endAdornment={endAdornment}
          label={label}
          {...props}
        >
          {placeholder && (
            <MenuItem value="" disabled>
              <em>{placeholder}</em>
            </MenuItem>
          )}
          {options.map((option) => (
            <MenuItem
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.icon && (
                <ListItemIcon>
                  {option.icon}
                </ListItemIcon>
              )}
              <ListItemText primary={option.label} />
            </MenuItem>
          ))}
        </MuiSelect>
        {helperText && (
          <FormHelperText error={!success}>
            {helperText}
          </FormHelperText>
        )}
      </StyledFormControl>
    );
  }
);

Select.displayName = 'Select';