import React from 'react';
import { Box, Typography, Button, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface EmptyStateProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: React.ReactNode;
  image?: React.ReactNode;
  actions?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: 'contained' | 'outlined' | 'text';
  };
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal';
}

const StyledEmptyState = styled(Box)<{ size?: 'sm' | 'md' | 'lg'; variant?: 'default' | 'minimal' }>(
  ({ theme, size, variant }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    
    // Size variants
    ...(size === 'sm' && {
      padding: theme.spacing(3),
      gap: theme.spacing(1.5),
    }),
    ...(size === 'md' && {
      padding: theme.spacing(4),
      gap: theme.spacing(2),
    }),
    ...(size === 'lg' && {
      padding: theme.spacing(6),
      gap: theme.spacing(3),
    }),

    // Variant styles
    ...(variant === 'default' && {
      backgroundColor: theme.palette.background.paper,
      borderRadius: theme.spacing(1),
      border: `1px solid ${theme.palette.divider}`,
    }),
    ...(variant === 'minimal' && {
      backgroundColor: 'transparent',
    }),
  })
);

const IconContainer = styled(Box)<{ size?: 'sm' | 'md' | 'lg' }>(
  ({ theme, size }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: theme.palette.text.secondary,
    
    // Size variants for icons
    ...(size === 'sm' && {
      '& .MuiSvgIcon-root': {
        fontSize: '2rem',
      },
    }),
    ...(size === 'md' && {
      '& .MuiSvgIcon-root': {
        fontSize: '3rem',
      },
    }),
    ...(size === 'lg' && {
      '& .MuiSvgIcon-root': {
        fontSize: '4rem',
      },
    }),
  })
);

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({
    title,
    description,
    icon,
    image,
    actions,
    primaryAction,
    secondaryAction,
    size = 'md',
    variant = 'default',
    ...props
  }, ref) => {
    return (
      <StyledEmptyState ref={ref} size={size} variant={variant} {...props}>
        {/* Icon or Image */}
        {(icon || image) && (
          <IconContainer size={size}>
            {image || icon}
          </IconContainer>
        )}

        {/* Content */}
        <Box sx={{ maxWidth: size === 'sm' ? 200 : size === 'md' ? 300 : 400 }}>
          {title && (
            <Typography 
              variant={size === 'sm' ? 'h6' : size === 'md' ? 'h5' : 'h4'}
              component="div"
              sx={{ 
                fontWeight: theme => theme.typography.fontWeightBold,
                mb: description ? 1 : 0,
              }}
            >
              {title}
            </Typography>
          )}

          {description && (
            <Typography 
              variant={size === 'sm' ? 'body2' : 'body1'}
              color="text.secondary"
              sx={{ lineHeight: 1.5 }}
            >
              {description}
            </Typography>
          )}
        </Box>

        {/* Actions */}
        {(actions || primaryAction || secondaryAction) && (
          <Stack direction="row" spacing={2} flexWrap="wrap" justifyContent="center">
            {primaryAction && (
              <Button
                variant={primaryAction.variant || 'contained'}
                onClick={primaryAction.onClick}
                size={size === 'lg' ? 'large' : 'medium'}
              >
                {primaryAction.label}
              </Button>
            )}

            {secondaryAction && (
              <Button
                variant={secondaryAction.variant || 'outlined'}
                onClick={secondaryAction.onClick}
                size={size === 'lg' ? 'large' : 'medium'}
              >
                {secondaryAction.label}
              </Button>
            )}

            {actions}
          </Stack>
        )}
      </StyledEmptyState>
    );
  }
);

EmptyState.displayName = 'EmptyState';