import React from 'react';
import { Button as MuiButton, ButtonProps as MuiButtonProps } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ButtonProps extends Omit<MuiButtonProps, 'variant' | 'color' | 'size'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'destructive';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
}

const StyledButton = styled(MuiButton, {
  shouldForwardProp: (prop: string) => !['variant', 'size', 'loading'].includes(prop),
})<ButtonProps>(({ theme, variant, size }) => ({
  // Base styles
  textTransform: 'none',
  fontWeight: theme.typography.fontWeightMedium,
  borderRadius: theme.shape.borderRadius,
  
  // Size variants
  ...(size === 'sm' && {
    padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
    fontSize: theme.typography.body2.fontSize,
    minHeight: '32px',
  }),
  ...(size === 'md' && {
    padding: `${theme.spacing(2)} ${theme.spacing(4)}`,
    fontSize: theme.typography.body1.fontSize,
    minHeight: '40px',
  }),
  ...(size === 'lg' && {
    padding: `${theme.spacing(3)} ${theme.spacing(6)}`,
    fontSize: theme.typography.body1.fontSize,
    minHeight: '48px',
  }),

  // Variant styles
  ...(variant === 'primary' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(variant === 'secondary' && {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  }),
  ...(variant === 'ghost' && {
    backgroundColor: 'transparent',
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...((variant === 'danger' || variant === 'destructive') && {
    backgroundColor: theme.palette.error.main,
    color: theme.palette.error.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  }),
}));

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, children, disabled, ...props }, ref) => {
    return (
      <StyledButton
        ref={ref}
        disabled={disabled || loading}
        // Custom props for styling - handled by shouldForwardProp
        variant={variant as any}
        size={size as any}
        loading={loading}
        {...props}
      >
        {loading ? 'Loading...' : children}
      </StyledButton>
    );
  }
);

Button.displayName = 'Button';