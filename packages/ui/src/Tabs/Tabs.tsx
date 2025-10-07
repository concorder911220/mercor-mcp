import React from 'react';
import {
  Tabs as MuiTabs,
  TabsProps as MuiTabsProps,
  Tab,
  Box,
  Badge,
  Divider
} from '@mui/material';
import { styled } from '@mui/material/styles';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  icon?: React.ReactNode;
  disabled?: boolean;
  badge?: string | number;
  content?: React.ReactNode;
}

export interface TabsProps extends Omit<MuiTabsProps, 'children' | 'value' | 'onChange'> {
  tabs: TabItem[];
  value?: string;
  onChange?: (tabId: string) => void;
  variant?: 'standard' | 'scrollable' | 'fullWidth';
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  showContent?: boolean;
  divider?: boolean;
}

const StyledTabs = styled(MuiTabs, {
  shouldForwardProp: (prop: string) => !['size'].includes(prop),
})<{ size?: 'sm' | 'md' | 'lg' }>(({ theme, size }) => ({
    // Size variants
    '& .MuiTab-root': {
      ...(size === 'sm' && {
        minHeight: '36px',
        padding: theme.spacing(0.5, 1.5),
        fontSize: theme.typography.body2.fontSize,
        '&.MuiTab-iconWrapper': {
          fontSize: '1rem',
        },
      }),
      ...(size === 'md' && {
        minHeight: '48px',
        padding: theme.spacing(1, 2),
        fontSize: theme.typography.body1.fontSize,
        '&.MuiTab-iconWrapper': {
          fontSize: '1.25rem',
        },
      }),
      ...(size === 'lg' && {
        minHeight: '56px',
        padding: theme.spacing(1.5, 2.5),
        fontSize: theme.typography.body1.fontSize,
        '&.MuiTab-iconWrapper': {
          fontSize: '1.5rem',
        },
      }),
    },
  })
);

const TabContent = styled(Box)(({ theme }) => ({
  padding: theme.spacing(3),
}));

export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({
    tabs,
    value,
    onChange,
    variant = 'standard',
    size = 'md',
    orientation = 'horizontal',
    showContent = true,
    divider = true,
    ...props
  }, ref) => {
    const currentValue = value || tabs[0]?.id;
    const currentTab = tabs.find(tab => tab.id === currentValue);

    const handleChange = (_event: React.SyntheticEvent, newValue: string) => {
      if (onChange) {
        onChange(newValue);
      }
    };

    const renderTab = (tab: TabItem) => {
      let label: React.ReactNode = tab.label;
      
      if (tab.badge !== undefined) {
        label = (
          <Badge
            badgeContent={tab.badge}
            color="primary"
            variant={typeof tab.badge === 'string' ? 'dot' : 'standard'}
          >
            {tab.label}
          </Badge>
        );
      }

      return (
        <Tab
          key={tab.id}
          label={label}
          value={tab.id}
          icon={tab.icon as React.ReactElement}
          disabled={tab.disabled}
          iconPosition={tab.icon && tab.label ? 'start' : 'top'}
        />
      );
    };

    return (
      <Box ref={ref}>
        <StyledTabs
          value={currentValue}
          onChange={handleChange}
          variant={variant}
          orientation={orientation}
          scrollButtons="auto"
          allowScrollButtonsMobile
          {...props}
        >
          {tabs.map(renderTab)}
        </StyledTabs>
        
        {divider && orientation === 'horizontal' && <Divider />}
        
        {showContent && currentTab?.content && (
          <TabContent>
            {currentTab.content}
          </TabContent>
        )}
      </Box>
    );
  }
);

Tabs.displayName = 'Tabs';