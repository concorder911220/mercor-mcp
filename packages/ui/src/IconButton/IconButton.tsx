import React from 'react';
import { IconButton as MuiIconButton, IconButtonProps as MuiIconButtonProps, Tooltip, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface IconButtonProps extends Omit<MuiIconButtonProps, 'color' | 'size'> {
  variant?: 'default' | 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  tooltip?: string;
  tooltipPlacement?: 'top' | 'bottom' | 'left' | 'right';
  loading?: boolean;
}

const StyledIconButton = styled(MuiIconButton)<IconButtonProps>(({ theme, variant, size }) => ({
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

  // Variant styles
  ...(variant === 'default' && {
    color: theme.palette.text.secondary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...(variant === 'primary' && {
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.primary.main,
      color: theme.palette.primary.contrastText,
    },
  }),
  ...(variant === 'secondary' && {
    color: theme.palette.text.primary,
    backgroundColor: theme.palette.grey[100],
    '&:hover': {
      backgroundColor: theme.palette.grey[200],
    },
  }),
  ...(variant === 'ghost' && {
    color: theme.palette.text.primary,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...(variant === 'danger' && {
    color: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.main,
      color: theme.palette.error.contrastText,
    },
  }),
}));

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ variant = 'default', size = 'md', tooltip, tooltipPlacement = 'top', loading, children, disabled, ...props }, ref) => {
    const iconButton = (
      <StyledIconButton
        ref={ref}
        variant={variant as any}
        size={size as any}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <CircularProgress
            size={size === 'sm' ? 16 : size === 'md' ? 20 : 24}
            color="inherit"
          />
        ) : (
          children
        )}
      </StyledIconButton>
    );

    if (tooltip && !disabled && !loading) {
      return (
        <Tooltip title={tooltip} placement={tooltipPlacement}>
          {iconButton}
        </Tooltip>
      );
    }

    return iconButton;
  }
);

IconButton.displayName = 'IconButton';