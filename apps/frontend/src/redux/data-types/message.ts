// Import types from generated backend schema
import { components } from '../../types/backend-schema';

// Create a hybrid type that includes both backend schema and legacy frontend expectations
export interface IMessageResponse {
  success: boolean;
  message: string;
  task_id: string;
  status: string;
  user_input_request?: Record<string, never> | {
    actual_child_task_id: string;
    agent_name: string;
    message: string;
    context: {
      child_task_id: string;
      created_at: string;
    };
  } | null;
}

// Use the exact backend schema for requests
export type IMessageRequest = components['schemas']['CoreAgentRequest'];

// Legacy compatibility types - keep for now while transitioning
export interface ILegacyMessageResponse {
    success: boolean;
    message: string;
    task_id: string;
    parent_task_id?: string | null;
    status: string;
    user_input_request?: {
        actual_child_task_id: string;
        agent_name: string;
        message: string;
        context: {
            child_task_id: string;
            created_at: string;
        };
    } | null;
}

export interface FileUploadResponse {
  success: boolean;
  s3_url: string;
  s3_key: string;
  metadata: {
    original_filename: string;
    content_type: string;
    file_size: number;
    upload_timestamp: string;
    s3_bucket: string;
    s3_region: string;    
  };
  message: string;
}
