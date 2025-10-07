#!/usr/bin/env python3
"""
Test script to verify the API works with S3 URLs.
"""

import requests
import json
import sys

def test_chat_with_s3_pdf():
    """Test the chat endpoint with S3 PDF URL."""
    
    # Test data with S3 PDF URL
    payload = {
        "query": "Please analyze this PDF document and provide a summary of the key information.",
        "messages": [
            {"role": "user", "content": "Hello"},
            {"role": "assistant", "content": "Hi! I can help you analyze documents."}
        ],
        "attachments": [
            "https://rialto-financial-storage.s3.us-east-2.amazonaws.com/chat/PDQ_Linda+Mahon.pdf"
        ]
    }
    
    print("🚀 Testing AI Service with S3 PDF")
    print("=" * 60)
    print(f"Query: {payload['query']}")
    print(f"Messages: {len(payload['messages'])}")
    print(f"Attachments: {len(payload['attachments'])}")
    for i, url in enumerate(payload['attachments'], 1):
        print(f"  {i}. {url}")
    print("=" * 60)
    
    try:
        # Make the request with streaming
        response = requests.post(
            'http://localhost:8000/chat',
            json=payload,
            stream=True,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code != 200:
            print(f"❌ Error: {response.status_code}")
            print(response.text)
            return
        
        print("📡 Streaming response:")
        print("-" * 30)
        
        full_response = ""
        
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    try:
                        # Remove the 'data: ' prefix and parse JSON
                        json_str = line[6:]
                        data = json.loads(json_str)
                        
                        if 'error' in data:
                            print(f"❌ Error: {data['error']}")
                            break
                        
                        if data.get('content'):
                            print(data['content'], end='', flush=True)
                            full_response += data['content']
                        
                        if data.get('finish_reason'):
                            print(f"\n\n✅ Stream finished with reason: {data['finish_reason']}")
                            if 'usage' in data:
                                print(f"📊 Usage: {data['usage']}")
                            break
                            
                    except json.JSONDecodeError as e:
                        print(f"❌ JSON decode error: {e}")
                        print(f"Raw line: {line}")
                        break
        
        print(f"\n\n📝 Full response: {full_response}")
        
    except requests.exceptions.ConnectionError:
        print("❌ Connection error: Make sure the server is running on http://localhost:8000")
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def test_chat_without_attachments():
    """Test the chat endpoint without attachments."""
    
    payload = {
        "query": "What is the capital of France?",
        "messages": [],
        "attachments": []
    }
    
    print("🚀 Testing AI Service without Attachments")
    print("=" * 50)
    print(f"Query: {payload['query']}")
    print(f"Messages: {len(payload['messages'])}")
    print(f"Attachments: {len(payload['attachments'])}")
    print("=" * 50)
    
    try:
        response = requests.post(
            'http://localhost:8000/chat',
            json=payload,
            stream=True,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code != 200:
            print(f"❌ Error: {response.status_code}")
            return
        
        print("📡 Streaming response:")
        print("-" * 30)
        
        full_response = ""
        
        for line in response.iter_lines():
            if line:
                line = line.decode('utf-8')
                if line.startswith('data: '):
                    try:
                        json_str = line[6:]
                        data = json.loads(json_str)
                        
                        if 'error' in data:
                            print(f"❌ Error: {data['error']}")
                            break
                        
                        if data.get('content'):
                            print(data['content'], end='', flush=True)
                            full_response += data['content']
                        
                        if data.get('finish_reason'):
                            print(f"\n\n✅ Stream finished with reason: {data['finish_reason']}")
                            break
                            
                    except json.JSONDecodeError as e:
                        print(f"❌ JSON decode error: {e}")
                        break
        
        print(f"\n\n📝 Full response: {full_response}")
        
    except Exception as e:
        print(f"❌ Error: {e}")

def test_health_endpoint():
    """Test the health endpoint."""
    try:
        response = requests.get('http://localhost:8000/health')
        if response.status_code == 200:
            print("✅ Health check passed")
            return True
        else:
            print(f"❌ Health check failed: {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Health check failed: Server not running")
        return False

if __name__ == "__main__":
    print("🧪 AI Service S3 PDF Test")
    print("=" * 40)
    
    # First check if server is running
    if not test_health_endpoint():
        print("\n💡 To start the server, run:")
        print("   python -m app.main")
        print("   or")
        print("   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000")
        sys.exit(1)
    
    print("\n" + "=" * 40)
    
    # Test without attachments first
    test_chat_without_attachments()
    
    print("\n" + "=" * 40)
    
    # Test with S3 PDF
    test_chat_with_s3_pdf()