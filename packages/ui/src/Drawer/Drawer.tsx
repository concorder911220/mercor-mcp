import React from 'react';
import {
  Drawer as MuiDrawer,
  DrawerProps as MuiDrawerProps,
  Box,
  Typography,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close } from '@mui/icons-material';

export interface DrawerProps extends Omit<MuiDrawerProps, 'children' | 'title'> {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  width?: number | string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  dividers?: boolean;
}

const StyledDrawerPaper = styled('div')<{ width?: number | string }>(
  ({ theme, width = 400 }) => ({
    width: typeof width === 'number' ? `${width}px` : width,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: theme.palette.background.paper,

    [theme.breakpoints.down('sm')]: {
      width: '100vw',
    },
  })
);

const StyledDrawerHeader = styled(Box)<{ padding?: 'none' | 'sm' | 'md' | 'lg' }>(
  ({ theme, padding }) => ({
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    flexShrink: 0,

    ...(padding === 'none' && {
      padding: 0,
    }),
    ...(padding === 'sm' && {
      padding: theme.spacing(1.5),
    }),
    ...(padding === 'md' && {
      padding: theme.spacing(2),
    }),
    ...(padding === 'lg' && {
      padding: theme.spacing(3),
    }),
  })
);

const StyledDrawerContent = styled(Box)<{ padding?: 'none' | 'sm' | 'md' | 'lg' }>(
  ({ theme, padding }) => ({
    flex: 1,
    overflow: 'auto',

    ...(padding === 'none' && {
      padding: 0,
    }),
    ...(padding === 'sm' && {
      padding: `0 ${theme.spacing(1.5)} ${theme.spacing(1.5)}`,
    }),
    ...(padding === 'md' && {
      padding: `0 ${theme.spacing(2)} ${theme.spacing(2)}`,
    }),
    ...(padding === 'lg' && {
      padding: `0 ${theme.spacing(3)} ${theme.spacing(3)}`,
    }),
  })
);

const StyledDrawerActions = styled(Box)<{ padding?: 'none' | 'sm' | 'md' | 'lg' }>(
  ({ theme, padding }) => ({
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(1),
    flexShrink: 0,

    ...(padding === 'none' && {
      padding: 0,
    }),
    ...(padding === 'sm' && {
      padding: theme.spacing(1.5),
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

export const Drawer = React.forwardRef<HTMLDivElement, DrawerProps>(
  ({
    children,
    title,
    subtitle,
    actions,
    closable = true,
    onClose,
    width = 400,
    padding = 'md',
    dividers = true,
    anchor = 'right',
    open,
    ...props
  }, ref) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const hasHeader = title || subtitle || closable;

    return (
      <MuiDrawer
        ref={ref}
        anchor={anchor}
        open={open}
        onClose={onClose}
        PaperProps={{
          sx: { 
            width: isMobile ? '100vw' : typeof width === 'number' ? `${width}px` : width,
          }
        }}
        {...props}
      >
        <StyledDrawerPaper width={width}>
          {hasHeader && (
            <>
              <StyledDrawerHeader padding={padding}>
                <Box sx={{ flex: 1, minWidth: 0, pr: closable ? 1 : 0 }}>
                  {title && (
                    <Typography 
                      variant="h6" 
                      component="h2"
                      sx={{ 
                        fontWeight: 600,
                        lineHeight: 1.2,
                        ...(subtitle && { mb: 0.5 })
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

                {closable && (
                  <IconButton
                    size="small"
                    onClick={onClose}
                    sx={{ mt: -0.5, mr: -0.5 }}
                    aria-label="close"
                  >
                    <Close />
                  </IconButton>
                )}
              </StyledDrawerHeader>
              {dividers && <Divider />}
            </>
          )}

          <StyledDrawerContent padding={hasHeader && dividers ? 'md' : padding}>
            {children}
          </StyledDrawerContent>

          {actions && (
            <>
              {dividers && <Divider />}
              <StyledDrawerActions padding={padding}>
                {actions}
              </StyledDrawerActions>
            </>
          )}
        </StyledDrawerPaper>
      </MuiDrawer>
    );
  }
);

Drawer.displayName = 'Drawer';