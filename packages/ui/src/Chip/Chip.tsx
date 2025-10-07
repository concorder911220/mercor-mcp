import React from 'react';
import { Chip as MuiChip, ChipProps as MuiChipProps, Avatar } from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close } from '@mui/icons-material';

export interface ChipProps extends Omit<MuiChipProps, 'variant' | 'size' | 'avatar'> {
  variant?: 'filled' | 'outlined' | 'soft';
  size?: 'sm' | 'md' | 'lg';
  removable?: boolean;
  onRemove?: () => void;
  avatar?: React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const StyledChip = styled(MuiChip, {
  shouldForwardProp: (prop: string) => !['customVariant', 'size', 'removable', 'leftIcon', 'rightIcon'].includes(prop),
})<ChipProps & { customVariant?: 'filled' | 'outlined' | 'soft' }>(({ theme, customVariant, size }) => ({
  // Size variants
  ...(size === 'sm' && {
    height: theme.spacing(6),
    fontSize: theme.typography.caption.fontSize,
    '& .MuiChip-label': {
      padding: `0 ${theme.spacing(1)}`,
    },
    '& .MuiChip-avatar': {
      width: theme.spacing(4),
      height: theme.spacing(4),
      fontSize: theme.typography.caption.fontSize,
    },
    '& .MuiChip-icon': {
      fontSize: theme.typography.caption.fontSize,
    },
    '& .MuiChip-deleteIcon': {
      fontSize: theme.typography.caption.fontSize,
    },
  }),
  ...(size === 'md' && {
    height: theme.spacing(8),
    fontSize: theme.typography.body2.fontSize,
    '& .MuiChip-label': {
      padding: `0 ${theme.spacing(1.5)}`,
    },
    '& .MuiChip-avatar': {
      width: theme.spacing(6),
      height: theme.spacing(6),
      fontSize: theme.typography.body2.fontSize,
    },
    '& .MuiChip-icon': {
      fontSize: theme.typography.body2.fontSize,
    },
    '& .MuiChip-deleteIcon': {
      fontSize: theme.typography.body2.fontSize,
    },
  }),
  ...(size === 'lg' && {
    height: theme.spacing(10),
    fontSize: theme.typography.body1.fontSize,
    '& .MuiChip-label': {
      padding: `0 ${theme.spacing(2)}`,
    },
    '& .MuiChip-avatar': {
      width: theme.spacing(8),
      height: theme.spacing(8),
      fontSize: theme.typography.body1.fontSize,
    },
    '& .MuiChip-icon': {
      fontSize: theme.typography.body1.fontSize,
    },
    '& .MuiChip-deleteIcon': {
      fontSize: theme.typography.body1.fontSize,
    },
  }),

  // Variant styles
  ...(customVariant === 'filled' && {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    '&:hover': {
      backgroundColor: theme.palette.primary.dark,
    },
  }),
  ...(customVariant === 'outlined' && {
    backgroundColor: 'transparent',
    border: `1px solid ${theme.palette.primary.main}`,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  }),
  ...(customVariant === 'soft' && {
    backgroundColor: theme.palette.action.selected,
    color: theme.palette.primary.main,
    '&:hover': {
      backgroundColor: theme.palette.action.focus,
    },
  }),
}));

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  ({ 
    variant = 'filled',
    size = 'md',
    removable,
    onRemove,
    avatar,
    leftIcon,
    rightIcon,
    onDelete,
    sx,
    ...props 
  }, ref) => {
    const handleDelete = removable && onRemove ? onRemove : onDelete;
    
    const chipAvatar = avatar ? (
      typeof avatar === 'string' ? (
        <Avatar>{avatar}</Avatar>
      ) : (
        avatar
      )
    ) : undefined;

    // If sx prop contains color/background overrides, use MUI Chip directly
    const hasCustomColors = sx && (
      (typeof sx === 'object' && (
        'backgroundColor' in sx || 
        'color' in sx || 
        'borderColor' in sx
      )) ||
      (typeof sx === 'function')
    );

    if (hasCustomColors) {
      return (
        <MuiChip
          ref={ref}
          variant={variant === 'outlined' ? 'outlined' : 'filled'}
          avatar={chipAvatar as React.ReactElement}
          icon={leftIcon as React.ReactElement}
          deleteIcon={rightIcon ? rightIcon as React.ReactElement : (removable ? <Close /> : undefined)}
          onDelete={handleDelete}
          sx={{
            // Apply size-specific styles
            ...(size === 'sm' && {
              height: (theme) => theme.spacing(6),
              fontSize: (theme) => theme.typography.caption.fontSize,
              '& .MuiChip-label': {
                padding: (theme) => `0 ${theme.spacing(1)}`,
              },
            }),
            ...(size === 'lg' && {
              height: (theme) => theme.spacing(10),
              fontSize: (theme) => theme.typography.body1.fontSize,
              '& .MuiChip-label': {
                padding: (theme) => `0 ${theme.spacing(2)}`,
              },
            }),
            // Apply custom sx
            ...(typeof sx === 'function' ? sx : sx),
          }}
          {...props}
        />
      );
    }

    return (
      <StyledChip
        ref={ref}
        variant={variant === 'outlined' ? 'outlined' : 'filled'}
        customVariant={variant}
        avatar={chipAvatar as React.ReactElement}
        icon={leftIcon as React.ReactElement}
        deleteIcon={rightIcon ? rightIcon as React.ReactElement : (removable ? <Close /> : undefined)}
        onDelete={handleDelete}
        sx={sx}
        {...props}
      />
    );
  }
);

Chip.displayName = 'Chip';