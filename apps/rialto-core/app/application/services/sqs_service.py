"""SQS service for sending messages to AWS SQS queues."""

import logging
from typing import Dict, Any

import boto3
from botocore.exceptions import ClientError, NoCredentialsError
from fastapi import HTTPException
from rialto_shared_types.export_requests import TaxPrepExportRequest

from app.core.config import settings

logger = logging.getLogger(__name__)


class SQSService:
    """Service for interacting with AWS SQS."""
    
    def __init__(self):
        """Initialize the SQS service."""
        self.sqs_client = None
    
    def _get_sqs_client(self):
        """Get or initialize SQS client."""
        if self.sqs_client is None:
            try:
                logger.info(f"Initializing SQS client with region: {settings.aws_region}")
                self.sqs_client = boto3.client(
                    'sqs',
                    region_name=settings.aws_region
                )
            except Exception as e:
                logger.error(f"Failed to initialize SQS client: {e}")
                raise HTTPException(status_code=500, detail="Failed to initialize SQS client")
        return self.sqs_client
    
    def send_message(self, queue_url: str, export_request: TaxPrepExportRequest, 
                          message_attributes: Dict[str, Any] = None) -> str:
        """
        Send a message to an SQS queue.
        
        Args:
            queue_url: The URL of the SQS queue
            message_body: The message body as a dictionary
            message_attributes: Optional message attributes
            
        Returns:
            The message ID of the sent message
            
        Raises:
            HTTPException: If the message sending fails
        """
        try:
            sqs_client = self._get_sqs_client()
            
            # Prepare the message
            message_body_str = export_request.model_dump_json()
            
            # Prepare message attributes if provided
            formatted_attributes = {}
            if message_attributes:
                for key, value in message_attributes.items():
                    formatted_attributes[key] = {
                        'StringValue': str(value),
                        'DataType': 'String'
                    }
            
            # Send the message
            send_params = {
                'QueueUrl': queue_url,
                'MessageBody': message_body_str
            }
            
            if formatted_attributes:
                send_params['MessageAttributes'] = formatted_attributes
            
            logger.info(f"Sending message to SQS queue: {queue_url}")
            logger.info(f"Message attributes: {formatted_attributes}")
            logger.info(f"Message size: {len(message_body_str)} characters")
            response = sqs_client.send_message(**send_params)
            
            message_id = response.get('MessageId')
            logger.info(f"Successfully sent message to SQS. MessageId: {message_id}")
            
            return message_id
            
        except ClientError as e:
            error_code = e.response['Error']['Code']
            error_message = e.response['Error']['Message']
            logger.error(f"SQS ClientError - Code: {error_code}, Message: {error_message}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to send SQS message: {error_message}"
            )
        except NoCredentialsError:
            logger.error("AWS credentials not found")
            raise HTTPException(
                status_code=500, 
                detail="AWS credentials not configured"
            )
        except Exception as e:
            logger.error(f"Unexpected error sending SQS message: {e}")
            raise HTTPException(
                status_code=500, 
                detail=f"Failed to send SQS message: {str(e)}"
            )
    
    
    def send_tax_export_request(self, project_id: str, export_id: str, 
                                    user_id: str, export_request: TaxPrepExportRequest) -> str:
        """
        Send a tax export request to the configured SQS queue.
        
        Args:
            project_id: The project ID
            export_id: The export ID
            user_id: The user ID
            export_request: The tax export request payload
            
        Returns:
            The message ID of the sent message
            
        Raises:
            HTTPException: If the queue is not configured or message sending fails
        """
        if not settings.tax_prep_export_queue_url:
            logger.warning("TAX_PREP_EXPORT_QUEUE_URL not configured, skipping SQS message")
            raise HTTPException(
                status_code=500,
                detail="Tax export queue not configured"
            )
        
        try:
            message_attributes = {
                "project_id": project_id,
                "export_id": export_id,
                "type": export_request.type,
                "user_id": user_id
            }
            
            message_id = self.send_message(
                queue_url=settings.tax_prep_export_queue_url,
                export_request=export_request,
                message_attributes=message_attributes
            )
            
            logger.info(f"Successfully sent tax export request to SQS for project {project_id}")
            return message_id
            
        except Exception as e:
            logger.error(f"Failed to send tax export SQS message for project {project_id}: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to send tax export request: {str(e)}"
            )


# Create a global instance
sqs_service = SQSService()
