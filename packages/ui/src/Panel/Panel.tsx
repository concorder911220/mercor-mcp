import React from 'react';
import { 
  Box, 
  Typography, 
  IconButton, 
  Collapse,
  Divider,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close, ExpandMore, ExpandLess } from '@mui/icons-material';

export interface PanelProps {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  collapsible?: boolean;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
  variant?: 'default' | 'outlined' | 'filled';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const StyledPanel = styled(Box)<{ variant?: 'default' | 'outlined' | 'filled' }>(
  ({ theme, variant }) => ({
    borderRadius: theme.spacing(1),
    overflow: 'hidden',

    ...(variant === 'default' && {
      backgroundColor: theme.palette.background.paper,
      boxShadow: theme.shadows[1],
    }),
    ...(variant === 'outlined' && {
      backgroundColor: theme.palette.background.paper,
      border: `1px solid ${theme.palette.divider}`,
    }),
    ...(variant === 'filled' && {
      backgroundColor: theme.palette.grey[50],
    }),
  })
);

const StyledHeader = styled(Box)<{ padding?: 'none' | 'sm' | 'md' | 'lg' }>(
  ({ theme, padding }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: '48px',

    ...(padding === 'none' && {
      padding: 0,
    }),
    ...(padding === 'sm' && {
      padding: theme.spacing(1),
    }),
    ...(padding === 'md' && {
      padding: theme.spacing(2),
    }),
    ...(padding === 'lg' && {
      padding: theme.spacing(3),
    }),
  })
);

const StyledContent = styled(Box)<{ padding?: 'none' | 'sm' | 'md' | 'lg' }>(
  ({ theme, padding }) => ({
    ...(padding === 'none' && {
      padding: 0,
    }),
    ...(padding === 'sm' && {
      padding: theme.spacing(1),
      paddingTop: 0,
    }),
    ...(padding === 'md' && {
      padding: theme.spacing(2),
      paddingTop: 0,
    }),
    ...(padding === 'lg' && {
      padding: theme.spacing(3),
      paddingTop: 0,
    }),
  })
);

export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ 
    children,
    title,
    subtitle,
    headerAction,
    closable,
    onClose,
    collapsible,
    collapsed = false,
    onToggleCollapse,
    variant = 'default',
    padding = 'md',
    ...props 
  }, ref) => {
    const hasHeader = title || subtitle || headerAction || closable || collapsible;

    return (
      <StyledPanel ref={ref} variant={variant} {...props}>
        {hasHeader && (
          <>
            <StyledHeader padding={padding}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                {title && (
                  <Typography 
                    variant="h6" 
                    component="div"
                    sx={{ 
                      fontWeight: 600,
                      ...(subtitle && { marginBottom: 0.5 })
                    }}
                  >
                    {title}
                  </Typography>
                )}
                {subtitle && (
                  <Typography variant="body2" color="text.secondary">
                    {subtitle}
                  </Typography>
                )}
              </Box>

              <Stack direction="row" spacing={0.5} alignItems="center">
                {headerAction}
                
                {collapsible && (
                  <IconButton
                    size="small"
                    onClick={onToggleCollapse}
                    aria-label={collapsed ? 'expand' : 'collapse'}
                  >
                    {collapsed ? <ExpandMore /> : <ExpandLess />}
                  </IconButton>
                )}

                {closable && (
                  <IconButton
                    size="small"
                    onClick={onClose}
                    aria-label="close"
                  >
                    <Close />
                  </IconButton>
                )}
              </Stack>
            </StyledHeader>
            <Divider />
          </>
        )}

        <Collapse in={!collapsed} timeout="auto">
          <StyledContent padding={padding}>
            {children}
          </StyledContent>
        </Collapse>
      </StyledPanel>
    );
  }
);

Panel.displayName = 'Panel';