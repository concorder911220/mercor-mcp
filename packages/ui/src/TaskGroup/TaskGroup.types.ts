import { Task, TagType, AutomationStatus } from '../types';
import { TaskRibbonColor } from '../TaskRibbon/TaskRibbonColorMapping';

export interface TaskGroupProps {
  title: string;
  tasks: Task[];
  onSelect: (id: string) => void;
  onGroupSelect?: (groupId: string) => void; // New prop for group-level selection
  defaultExpanded?: boolean;
  isJoined?: boolean; // When true, entire group becomes clickable
  disabled?: boolean; // When true, tasks in this group are disabled
}
