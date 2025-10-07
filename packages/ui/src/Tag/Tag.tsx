import React from 'react';
import { Box, IconButton } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close } from '@mui/icons-material';

export interface TagProps {
  children: React.ReactNode;
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  disabled?: boolean;
  onClick?: () => void;
}

const StyledTag = styled(Box)<TagProps>(({ theme, variant, size, disabled, onClick }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  gap: theme.spacing(0.5),
  borderRadius: theme.spacing(0.5),
  fontWeight: theme.typography.fontWeightMedium,
  cursor: onClick ? 'pointer' : 'default',
  transition: theme.transitions.create(['background-color', 'box-shadow']),
  
  // Size variants
  ...(size === 'sm' && {
    padding: `${theme.spacing(0.25)} ${theme.spacing(0.75)}`,
    fontSize: theme.typography.caption.fontSize,
    minHeight: '20px',
  }),
  ...(size === 'md' && {
    padding: `${theme.spacing(0.5)} ${theme.spacing(1)}`,
    fontSize: theme.typography.body2.fontSize,
    minHeight: '24px',
  }),
  ...(size === 'lg' && {
    padding: `${theme.spacing(0.75)} ${theme.spacing(1.5)}`,
    fontSize: theme.typography.body1.fontSize,
    minHeight: '32px',
  }),

  // Variant styles
  ...(variant === 'default' && {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.primary,
    '&:hover': onClick && !disabled ? {
      backgroundColor: theme.palette.grey[200],
    } : {},
  }),
  ...(variant === 'primary' && {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
    '&:hover': onClick && !disabled ? {
      backgroundColor: theme.palette.action.focus,
    } : {},
  }),
  ...(variant === 'secondary' && {
    backgroundColor: theme.palette.grey[100],
    color: theme.palette.text.secondary,
    '&:hover': onClick && !disabled ? {
      backgroundColor: theme.palette.grey[200],
    } : {},
  }),
  ...(variant === 'success' && {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.success.main,
    '&:hover': onClick && !disabled ? {
      backgroundColor: theme.palette.action.focus,
    } : {},
  }),
  ...(variant === 'warning' && {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.warning.main,
    '&:hover': onClick && !disabled ? {
      backgroundColor: theme.palette.action.focus,
    } : {},
  }),
  ...(variant === 'error' && {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.error.main,
    '&:hover': onClick && !disabled ? {
      backgroundColor: theme.palette.action.focus,
    } : {},
  }),

  // Disabled state
  ...(disabled && {
    opacity: 0.6,
    cursor: 'not-allowed',
    '&:hover': {
      backgroundColor: 'inherit',
    },
  }),
}));

export const Tag = React.forwardRef<HTMLDivElement, TagProps>(
  ({ 
    children,
    variant = 'default',
    size = 'md',
    removable,
    onRemove,
    leftIcon,
    rightIcon,
    disabled,
    onClick,
    ...props 
  }, ref) => {
    return (
      <StyledTag
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={disabled ? undefined : onClick}
        {...props}
      >
        {leftIcon && (
          <Box
            component="span"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              fontSize: size === 'sm' ? theme.typography.caption.fontSize : size === 'md' ? theme.typography.body2.fontSize : theme.typography.body1.fontSize,
            })}
          >
            {leftIcon}
          </Box>
        )}
        
        <Box component="span">
          {children}
        </Box>

        {rightIcon && !removable && (
          <Box
            component="span"
            sx={(theme) => ({
              display: 'flex',
              alignItems: 'center',
              fontSize: size === 'sm' ? theme.typography.caption.fontSize : size === 'md' ? theme.typography.body2.fontSize : theme.typography.body1.fontSize,
            })}
          >
            {rightIcon}
          </Box>
        )}

        {removable && onRemove && (
          <IconButton
            size="small"
            onClick={onRemove}
            disabled={disabled}
            sx={{
              padding: 0,
              minWidth: 'auto',
              width: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px',
              height: size === 'sm' ? '14px' : size === 'md' ? '16px' : '18px',
              '& .MuiSvgIcon-root': {
                fontSize: size === 'sm' ? '12px' : size === 'md' ? '14px' : '16px',
              },
            }}
          >
            <Close />
          </IconButton>
        )}
      </StyledTag>
    );
  }
);

Tag.displayName = 'Tag';