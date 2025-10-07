// Import types from generated backend schema
import { components } from './types/backend-schema';

// Re-export backend types for compatibility
export type Task = components['schemas']['TaskSummary'];
export type TaskDetail = components['schemas']['TaskDetail'];
export type CoreAgentRequest = components['schemas']['CoreAgentRequest'];
export type CoreAgentResponse = components['schemas']['CoreAgentResponse'];

export interface TaskCardProps {
  task: Task;
}
