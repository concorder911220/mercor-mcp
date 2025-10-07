// Shared types across UI components

export type TagType = 
  | 'status'
  | 'required'
  | 'atRisk'
  | 'wrongYear'
  | 'missing'
  | 'optional'
  | 'priority'
  | 'bucket'
  | 'lastActivity'
  | 'dueDate';

export enum AutomationStatus {
  AUTOMATABLE = 'automatable',
  MANUAL = 'manual',
  AUTOMATED = 'automated'
}


import { TaskRibbonColor } from './TaskRibbon/TaskRibbonColorMapping';

export interface Task {
  id: string;
  label: string;
  description?: string;
  color?: TaskRibbonColor;
  groupId?: string; // Track which group the task belongs to
  tags?: Partial<Record<TagType, string>>;
  automationStatus?: AutomationStatus;
}
