import React from 'react';
import { 
  Checkbox as MuiCheckbox, 
  CheckboxProps as MuiCheckboxProps,
  FormControl,
  FormControlLabel,
  FormHelperText
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface CheckboxProps extends Omit<MuiCheckboxProps, 'size'> {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  helperText?: string;
  success?: boolean;
  error?: boolean;
}

const StyledFormControl = styled(FormControl)<{ success?: boolean; error?: boolean }>(
  ({ theme, success, error }) => ({
    '& .MuiCheckbox-root': {
      ...(success && {
        color: theme.palette.success.main,
        '&.Mui-checked': {
          color: theme.palette.success.main,
        },
      }),
      ...(error && {
        color: theme.palette.error.main,
        '&.Mui-checked': {
          color: theme.palette.error.main,
        },
      }),
    },
  })
);

const StyledCheckbox = styled(MuiCheckbox, {
  shouldForwardProp: (prop: string) => !['size'].includes(prop),
})<{ size?: 'sm' | 'md' | 'lg' }>(({ theme, size }) => ({
    // Size variants
    ...(size === 'sm' && {
      padding: theme.spacing(0.5),
      '& .MuiSvgIcon-root': {
        fontSize: '1rem',
      },
    }),
    ...(size === 'md' && {
      padding: theme.spacing(1),
      '& .MuiSvgIcon-root': {
        fontSize: '1.25rem',
      },
    }),
    ...(size === 'lg' && {
      padding: theme.spacing(1.5),
      '& .MuiSvgIcon-root': {
        fontSize: '1.5rem',
      },
    }),
  })
);

const StyledFormControlLabel = styled(FormControlLabel, {
  shouldForwardProp: (prop: string) => !['size'].includes(prop),
})<{ size?: 'sm' | 'md' | 'lg' }>(({ theme, size }) => ({
    '& .MuiFormControlLabel-label': {
      ...(size === 'sm' && {
        fontSize: theme.typography.body2.fontSize,
      }),
      ...(size === 'md' && {
        fontSize: theme.typography.body1.fontSize,
      }),
      ...(size === 'lg' && {
        fontSize: theme.typography.h6.fontSize,
      }),
    },
  })
);

export const Checkbox = React.forwardRef<HTMLButtonElement, CheckboxProps>(
  ({ 
    size = 'md', 
    label, 
    helperText, 
    success, 
    error,
    ...props 
  }, ref) => {
    const checkbox = (
      <StyledCheckbox
        ref={ref}
        {...props}
      />
    );

    if (label) {
      return (
        <StyledFormControl success={success} error={error}>
          <StyledFormControlLabel
            control={checkbox}
            label={label}
          />
          {helperText && (
            <FormHelperText error={error && !success}>
              {helperText}
            </FormHelperText>
          )}
        </StyledFormControl>
      );
    }

    return checkbox;
  }
);

Checkbox.displayName = 'Checkbox';