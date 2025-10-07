// Shared Types
export type { Task, TagType } from './types';
export { AutomationStatus } from './types';

// Components
export { Button } from './Button';
export type { ButtonProps } from './Button';

export { IconButton } from './IconButton';
export type { IconButtonProps } from './IconButton';

export { Input } from './Input';
export type { InputProps } from './Input';

export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';

export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';

export { Chip } from './Chip';
export type { ChipProps } from './Chip';

export { Tag } from './Tag';
export type { TagProps } from './Tag';

export { Card } from './Card';
export type { CardProps } from './Card';

export { Panel } from './Panel';
export type { PanelProps } from './Panel';

export { Toolbar } from './Toolbar';
export type { ToolbarProps } from './Toolbar';

export { Table } from './Table';
export type { TableProps, TableColumn } from './Table';

export { EmptyState } from './EmptyState';
export type { EmptyStateProps } from './EmptyState';

export { Modal } from './Modal';
export type { ModalProps } from './Modal';

export { Drawer } from './Drawer';
export type { DrawerProps } from './Drawer';

export { Toast, ToastProvider, useToast } from './Toast';
export type { ToastProps, ToastContextType, ToastProviderProps } from './Toast';

export { Tabs } from './Tabs';
export type { TabsProps, TabItem } from './Tabs';

export { TextField } from './TextField';
export type { TextFieldProps } from './TextField';

export { StatusPill } from './StatusPill';
export type { StatusPillProps, StatusKind } from './StatusPill';

// Task UI Components
export { 
  TaskRibbon, 
  TaskRibbonColor,
  getDocumentColor
} from './TaskRibbon';
export type { TaskRibbonProps } from './TaskRibbon';

export { TaskTag } from './TaskTag';
export type { TaskTagProps } from './TaskTag';

export { TaskGroup } from './TaskGroup';
export type { TaskGroupProps } from './TaskGroup';

export { TaskDashboard } from './TaskDashboard';
export type { TaskDashboardProps, TaskDashboardHeaderProps } from './TaskDashboard';

export { ChatBubble } from './ChatBubble';
export type { ChatBubbleProps, ChatBubbleRef } from './ChatBubble';


// Re-export MUI components that we use as-is
export {
  Typography,
  Stack,
  Box,
  Divider,
  Switch,
  Paper,
} from '@mui/material';