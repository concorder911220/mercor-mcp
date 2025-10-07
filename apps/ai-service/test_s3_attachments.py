#!/usr/bin/env python3
"""
Simple script to send S3 PDF to Claude API
Download PDF from S3, upload to Claude, and get analysis
"""

import anthropic
import requests
import tempfile
import os

# Configuration
ANTHROPIC_API_KEY = "ANTHROPIC_KEY"  # Replace with your API key
S3_PDF_URL = "S3_URL"  # Replace with your S3 URL

def main():
    try:
        
        # Initialize Claude client
        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        message = client.beta.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1500,
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "text",
                            "text": "Please analyze this PDF document and provide a summary:"
                        },
                        {
                            "type": "document",
                            "source": {
                                "type": "url",
                                "url": S3_PDF_URL
                            }
                        }
                    ]
                }
            ],
            betas=["files-api-2025-04-14"]
        )
        
        # Clean up temp file
        # os.unlink(temp_path)
        
        # Print result
        print("\n" + "="*50)
        print("CLAUDE'S ANALYSIS:")
        print("="*50)
        print(message.content[0].text)
        
    except Exception as e:
        print(f"Error: {e}")
        # Clean up temp file if it exists
        # try:
        #     # os.unlink(temp_path)
        # except:
        #     pass

if __name__ == "__main__":
    main()