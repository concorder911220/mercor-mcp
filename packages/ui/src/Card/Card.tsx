import React from 'react';
import { 
  Card as MuiCard, 
  CardProps as MuiCardProps,
  CardHeader,
  CardContent,
  CardActions,
  Divider,
  Typography
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface CardProps extends Omit<MuiCardProps, 'variant' | 'title'> {
  variant?: 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  headerAction?: React.ReactNode;
  actions?: React.ReactNode;
  dividers?: boolean;
  hover?: boolean;
}

const StyledCard = styled(MuiCard, {
  shouldForwardProp: (prop: string) => !['customVariant', 'padding', 'hover'].includes(prop),
})<CardProps & { customVariant?: 'elevated' | 'outlined' | 'flat' }>(({ theme, customVariant, padding, hover }) => ({
  // Variant styles
  ...(customVariant === 'elevated' && {
    boxShadow: theme.shadows[2],
    '&:hover': hover ? {
      boxShadow: theme.shadows[4],
    } : {},
  }),
  ...(customVariant === 'outlined' && {
    border: `1px solid ${theme.palette.divider}`,
    boxShadow: 'none',
    '&:hover': hover ? {
      borderColor: theme.palette.primary.main,
    } : {},
  }),
  ...(customVariant === 'flat' && {
    boxShadow: 'none',
    backgroundColor: theme.palette.background.paper,
    '&:hover': hover ? {
      backgroundColor: theme.palette.action.hover,
    } : {},
  }),

  // Hover effects
  ...(hover && {
    cursor: 'pointer',
    transition: theme.transitions.create(['box-shadow', 'border-color', 'background-color']),
  }),
}));

const StyledCardContent = styled(CardContent)<{ padding?: 'none' | 'sm' | 'md' | 'lg' }>(
  ({ theme, padding }) => ({
    ...(padding === 'none' && {
      padding: 0,
      '&:last-child': {
        paddingBottom: 0,
      },
    }),
    ...(padding === 'sm' && {
      padding: theme.spacing(1),
      '&:last-child': {
        paddingBottom: theme.spacing(1),
      },
    }),
    ...(padding === 'md' && {
      padding: theme.spacing(2),
      '&:last-child': {
        paddingBottom: theme.spacing(2),
      },
    }),
    ...(padding === 'lg' && {
      padding: theme.spacing(3),
      '&:last-child': {
        paddingBottom: theme.spacing(3),
      },
    }),
  })
);

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'elevated',
    padding = 'md',
    title,
    subtitle,
    headerAction,
    actions,
    dividers = false,
    hover = false,
    children,
    ...props 
  }, ref) => {
    const hasHeader = title || subtitle || headerAction;

    return (
      <StyledCard
        ref={ref}
        variant={variant === 'outlined' ? 'outlined' : undefined}
        customVariant={variant}
        {...props}
      >
        {hasHeader && (
          <>
            <CardHeader
              title={typeof title === 'string' ? (
                <Typography variant="h6" component="div">
                  {title}
                </Typography>
              ) : title}
              subheader={typeof subtitle === 'string' ? (
                <Typography variant="body2" color="text.secondary">
                  {subtitle}
                </Typography>
              ) : subtitle}
              action={headerAction}
              sx={{
                ...(padding === 'none' && { padding: 0 }),
                ...(padding === 'sm' && { 
                  padding: theme => theme.spacing(1),
                  paddingBottom: 0,
                }),
                ...(padding === 'md' && { 
                  padding: theme => theme.spacing(2),
                  paddingBottom: 0,
                }),
                ...(padding === 'lg' && { 
                  padding: theme => theme.spacing(3),
                  paddingBottom: 0,
                }),
              }}
            />
            {dividers && <Divider />}
          </>
        )}

        {children && (
          <StyledCardContent padding={padding}>
            {children}
          </StyledCardContent>
        )}

        {actions && (
          <>
            {dividers && <Divider />}
            <CardActions
              sx={{
                ...(padding === 'none' && { padding: 0 }),
                ...(padding === 'sm' && { 
                  padding: theme => theme.spacing(1),
                }),
                ...(padding === 'md' && { 
                  padding: theme => theme.spacing(2),
                }),
                ...(padding === 'lg' && { 
                  padding: theme => theme.spacing(3),
                }),
              }}
            >
              {actions}
            </CardActions>
          </>
        )}
      </StyledCard>
    );
  }
);

Card.displayName = 'Card';