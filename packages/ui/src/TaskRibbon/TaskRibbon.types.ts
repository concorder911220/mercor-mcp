import { ButtonProps } from '../Button';
import { AutomationStatus, TagType } from '../types';
import { TaskRibbonColor } from './TaskRibbonColorMapping';

export interface TaskRibbonProps extends Omit<ButtonProps, 'children' | 'onClick'> {
  label: string;
  onSelect: () => void;
  color?: TaskRibbonColor;
  disabled?: boolean;
  tags?: Partial<Record<TagType, string>>;
  automationStatus?: AutomationStatus;
  isJoined?: boolean;
}
