import React, { createContext, useContext, useState, useCallback } from 'react';
import {
  Snackbar,
  SnackbarProps,
  Alert,
  AlertTitle,
  IconButton,
  Box,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { 
  Close,
  CheckCircle,
  Info,
  Warning,
  Error as ErrorIcon
} from '@mui/icons-material';

export interface ToastProps extends Omit<SnackbarProps, 'children' | 'title'> {
  variant?: 'default' | 'filled' | 'outlined';
  severity?: 'success' | 'info' | 'warning' | 'error';
  title?: React.ReactNode;
  message: React.ReactNode;
  closable?: boolean;
  onClose?: () => void;
  actions?: React.ReactNode;
  icon?: React.ReactNode | false;
  size?: 'sm' | 'md' | 'lg';
}

const StyledAlert = styled(Alert, {
  shouldForwardProp: (prop: string) => !['size'].includes(prop),
})<{ size?: 'sm' | 'md' | 'lg' }>(({ theme, size }) => ({
    // Size variants
    ...(size === 'sm' && {
      padding: theme.spacing(1, 1.5),
      '& .MuiAlert-icon': {
        fontSize: '1rem',
      },
      '& .MuiAlert-message': {
        fontSize: theme.typography.body2.fontSize,
      },
    }),
    ...(size === 'md' && {
      padding: theme.spacing(1.5, 2),
      '& .MuiAlert-icon': {
        fontSize: '1.25rem',
      },
      '& .MuiAlert-message': {
        fontSize: theme.typography.body1.fontSize,
      },
    }),
    ...(size === 'lg' && {
      padding: theme.spacing(2, 2.5),
      '& .MuiAlert-icon': {
        fontSize: '1.5rem',
      },
      '& .MuiAlert-message': {
        fontSize: theme.typography.body1.fontSize,
      },
    }),
  })
);

const getSeverityIcon = (severity?: 'success' | 'info' | 'warning' | 'error') => {
  switch (severity) {
    case 'success':
      return <CheckCircle />;
    case 'info':
      return <Info />;
    case 'warning':
      return <Warning />;
    case 'error':
      return <ErrorIcon />;
    default:
      return undefined;
  }
};

export const Toast = React.forwardRef<HTMLDivElement, ToastProps>(
  ({
    variant = 'filled',
    severity = 'info',
    title,
    message,
    closable = true,
    onClose,
    actions,
    icon,
    size = 'md',
    open,
    ...props
  }, ref) => {
    const alertIcon = icon === false ? undefined : icon || getSeverityIcon(severity);
    
    const alertActions = (
      <>
        {actions}
        {closable && (
          <IconButton
            size="small"
            onClick={onClose}
            color="inherit"
          >
            <Close fontSize="small" />
          </IconButton>
        )}
      </>
    );

    return (
      <Snackbar
        ref={ref}
        open={open}
        onClose={onClose}
        {...props}
      >
        <StyledAlert
          severity={severity}
          variant={variant === 'default' ? 'standard' : variant}
          icon={alertIcon}
          action={alertActions}
        >
          {title && (
            <AlertTitle>
              {title}
            </AlertTitle>
          )}
          {message}
        </StyledAlert>
      </Snackbar>
    );
  }
);

Toast.displayName = 'Toast';

// Toast Context and Provider
export interface ToastContextType {
  showToast: (options: Omit<ToastProps, 'open' | 'ref'>) => void;
  hideToast: () => void;
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toast, setToast] = useState<(Omit<ToastProps, 'open' | 'ref'> & { id: string }) | null>(null);

  const showToast = useCallback((options: Omit<ToastProps, 'open' | 'ref'>) => {
    setToast({
      ...options,
      id: Math.random().toString(36).substring(2, 11),
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(null);
  }, []);

  const handleClose = useCallback(() => {
    if (toast?.onClose) {
      toast.onClose();
    }
    hideToast();
  }, [toast, hideToast]);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      {toast && (
        <Toast
          key={toast.id}
          open={true}
          onClose={handleClose}
          {...toast}
        />
      )}
    </ToastContext.Provider>
  );
};