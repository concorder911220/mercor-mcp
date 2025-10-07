import React from 'react';
import { Box, Typography, Stack, Divider } from '@mui/material';
import { styled } from '@mui/material/styles';

export interface ToolbarProps {
  children?: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  leftContent?: React.ReactNode;
  rightContent?: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  size?: 'sm' | 'md' | 'lg';
  divider?: boolean;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const StyledToolbar = styled(Box)<{ variant?: 'default' | 'elevated' | 'outlined'; size?: 'sm' | 'md' | 'lg' }>(
  ({ theme, variant, size }) => ({
    display: 'flex',
    alignItems: 'center',
    width: '100%',
    
    // Size variants
    ...(size === 'sm' && {
      minHeight: '40px',
      padding: `${theme.spacing(0.5)} ${theme.spacing(2)}`,
    }),
    ...(size === 'md' && {
      minHeight: '56px',
      padding: `${theme.spacing(1)} ${theme.spacing(2)}`,
    }),
    ...(size === 'lg' && {
      minHeight: '64px',
      padding: `${theme.spacing(1.5)} ${theme.spacing(3)}`,
    }),

    // Variant styles
    ...(variant === 'default' && {
      backgroundColor: theme.palette.background.paper,
    }),
    ...(variant === 'elevated' && {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
    }),
    ...(variant === 'outlined' && {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
      borderRadius: theme.spacing(0.5),
    }),
  })
);

export const Toolbar = React.forwardRef<HTMLDivElement, ToolbarProps>(
  ({ 
    children,
    title,
    subtitle,
    leftContent,
    rightContent,
    variant = 'default',
    size = 'md',
    divider = false,
    spacing = 'md',
    ...props 
  }, ref) => {
    const spacingValue = spacing === 'none' ? 0 : 
                        spacing === 'sm' ? 1 : 
                        spacing === 'md' ? 2 : 3;

    return (
      <>
        <StyledToolbar ref={ref} variant={variant} size={size} {...props}>
          {/* Left section */}
          <Stack 
            direction="row" 
            spacing={spacingValue}
            alignItems="center"
            sx={{ minWidth: 0 }}
          >
            {leftContent}
            {(title || subtitle) && (
              <Box sx={{ minWidth: 0 }}>
                {title && (
                  <Typography 
                    variant={size === 'sm' ? 'body1' : size === 'md' ? 'h6' : 'h5'} 
                    component="div"
                    sx={{ fontWeight: 600, lineHeight: 1.2 }}
                  >
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography 
                    variant={size === 'sm' ? 'caption' : 'body2'} 
                    color="text.secondary"
                    sx={{ lineHeight: 1.2 }}
                  >
                    {subtitle}
                  </Typography>
                )}
              </Box>
            )}
          </Stack>

          {/* Center content */}
          {children && (
            <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center', px: spacingValue }}>
              {children}
            </Box>
          )}

          {/* Right section */}
          {rightContent && (
            <Stack 
              direction="row" 
              spacing={spacingValue}
              alignItems="center"
              sx={{ marginLeft: 'auto' }}
            >
              {rightContent}
            </Stack>
          )}
        </StyledToolbar>

        {divider && <Divider />}
      </>
    );
  }
);

Toolbar.displayName = 'Toolbar';