// Import types from generated backend schema
import { components } from '../../types/backend-schema';

// Use backend schema types
export type ITask = components['schemas']['TaskSummary'];
export type ITaskDetail = components['schemas']['TaskDetail'];
export type IMessage = components['schemas']['MessageDetail'];
export type ITasksResponse = components['schemas']['TaskListResponse'];

// Keep existing interface for task response
export interface ITaskResponse {
    success: boolean;
    task: ITask;
}