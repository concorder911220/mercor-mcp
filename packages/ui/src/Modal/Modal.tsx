import React from 'react';
import {
  Modal as MuiModal,
  ModalProps as MuiModalProps,
  Paper,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { Close } from '@mui/icons-material';

export interface ModalProps extends Omit<MuiModalProps, 'children' | 'title'> {
  children: React.ReactNode;
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  dividers?: boolean;
}

const StyledModalPaper = styled(Paper)<{ size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'fullscreen' }>(
  ({ theme, size }) => ({
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    outline: 'none',
    boxShadow: theme.shadows[24],
    borderRadius: theme.spacing(1),
    maxHeight: '90vh',
    display: 'flex',
    flexDirection: 'column',

    // Size variants
    ...(size === 'xs' && {
      width: '90%',
      maxWidth: '400px',
    }),
    ...(size === 'sm' && {
      width: '90%',
      maxWidth: '500px',
    }),
    ...(size === 'md' && {
      width: '90%',
      maxWidth: '700px',
    }),
    ...(size === 'lg' && {
      width: '90%',
      maxWidth: '900px',
    }),
    ...(size === 'xl' && {
      width: '90%',
      maxWidth: '1200px',
    }),
    ...(size === 'fullscreen' && {
      width: '100vw',
      height: '100vh',
      maxWidth: 'none',
      maxHeight: 'none',
      borderRadius: 0,
      top: 0,
      left: 0,
      transform: 'none',
    }),

    [theme.breakpoints.down('sm')]: {
      width: '95%',
      margin: theme.spacing(1),
      ...(size === 'fullscreen' && {
        width: '100vw',
        height: '100vh',
        margin: 0,
      }),
    },
  })
);

const StyledModalHeader = styled(Box)<{ padding?: 'none' | 'sm' | 'md' | 'lg' }>(
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

const StyledModalContent = styled(Box)<{ padding?: 'none' | 'sm' | 'md' | 'lg' }>(
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

const StyledModalActions = styled(Box)<{ padding?: 'none' | 'sm' | 'md' | 'lg' }>(
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

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  ({
    children,
    title,
    subtitle,
    actions,
    closable = true,
    onClose,
    size = 'md',
    padding = 'md',
    dividers = true,
    open,
    ...props
  }, ref) => {
    const hasHeader = title || subtitle || closable;

    return (
      <MuiModal
        open={open}
        onClose={onClose}
        {...props}
      >
        <StyledModalPaper ref={ref} size={size}>
          {hasHeader && (
            <>
              <StyledModalHeader padding={padding}>
                <Box sx={{ flex: 1, minWidth: 0, pr: closable ? 1 : 0 }}>
                  {title && (
                    <Typography 
                      variant="h6" 
                      component="h2"
                      sx={{ 
                        fontWeight: theme => theme.typography.fontWeightMedium,
                        lineHeight: theme => theme.typography.h6.lineHeight,
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
              </StyledModalHeader>
              {dividers && <Divider />}
            </>
          )}

          <StyledModalContent padding={hasHeader && dividers ? 'md' : padding}>
            {children}
          </StyledModalContent>

          {actions && (
            <>
              {dividers && <Divider />}
              <StyledModalActions padding={padding}>
                {actions}
              </StyledModalActions>
            </>
          )}
        </StyledModalPaper>
      </MuiModal>
    );
  }
);

Modal.displayName = 'Modal';