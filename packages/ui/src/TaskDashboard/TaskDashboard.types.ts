import { TaskGroupProps } from '../TaskGroup';

export interface TaskDashboardProps {
  groups: TaskGroupProps[];
  onSelect?: (id: string) => void;
  header?: {
    title: string;
    subtitle?: string;
  };
}

export interface TaskDashboardHeaderProps {
  title: string;
  subtitle?: string;
}
