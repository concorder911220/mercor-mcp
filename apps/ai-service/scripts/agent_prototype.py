#!/usr/bin/env python3
"""
Agent Prototype Script - Demonstrates Real Looping Mechanism with Anthropic API

This script demonstrates the actual step-by-step looping behavior by:
1. Building prompts with system prompt + user request + message history
2. Calling the Anthropic API 
3. Adding the response to message history
4. Repeating until the agent indicates completion
"""

import os
import sys
import json
from typing import List, Dict, Any
from dataclasses import dataclass
from datetime import datetime
import anthropic

# Add the parent directory to the path to import from the app
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.system_prompt import system_prompt
from app.config import settings


@dataclass
class Message:
    """Represents a message in the conversation."""
    role: str  # "user" or "assistant"
    content: str
    timestamp: datetime


class AgentPrototype:
    """Prototype agent that demonstrates the looping mechanism with real API calls."""
    
    def __init__(self):
        """Initialize the agent with Anthropic client."""
        # Load API key from environment or config
        api_key = os.getenv('ANTHROPIC_API_KEY')
        if not api_key:
            try:
                settings.validate()
                api_key = settings.ANTHROPIC_API_KEY
            except:
                print("❌ Error: ANTHROPIC_API_KEY not found in environment or config")
                print("Please set ANTHROPIC_API_KEY environment variable")
                sys.exit(1)
        
        self.client = anthropic.Anthropic(api_key=api_key)
        self.model = "claude-3-5-sonnet-20241022"
        self.messages: List[Message] = []
        self.max_iterations = 10  # Safety limit
        self.iteration_count = 0
    
    def build_prompt(self, user_request: str) -> List[Dict[str, str]]:
        """Build the complete prompt including system prompt, user request, and message history."""
        prompt_messages = []
        
        # For the first iteration, add the initial user request
        if self.iteration_count == 1:
            prompt_messages.append({
                "role": "user", 
                "content": user_request
            })
        
        # Add message history (all previous assistant responses and user continuations)
        for message in self.messages:
            prompt_messages.append({
                "role": message.role,
                "content": message.content
            })
        
        return prompt_messages
    
    def call_anthropic_api(self, prompt_messages: List[Dict[str, str]]) -> str:
        """Call the Anthropic API with the built prompt."""
        try:
            response = self.client.messages.create(
                model=self.model,
                system=system_prompt,
                messages=prompt_messages,
                max_tokens=4096,
                temperature=0.7
            )
            
            return response.content[0].text
            
        except Exception as e:
            print(f"❌ Error calling Anthropic API: {e}")
            return f"Error: {str(e)}"
    
    def is_task_complete(self, response: str) -> bool:
        """Check if the agent indicates the task is complete."""
        completion_indicators = [
            "ALL TASKS PREPARED - Ready for user approval and execution",
            "TASK 1 PREPARED - All tasks prepared",
            "all tasks prepared",
            "ready for user approval and execution",
            "task complete",
            "completed successfully"
        ]
        
        response_lower = response.lower()
        return any(indicator.lower() in response_lower for indicator in completion_indicators)
    
    def extract_step_info(self, response: str) -> Dict[str, str]:
        """Extract step information from the response."""
        step_info = {
            "step_type": "unknown",
            "status": "unknown"
        }
        
        if "STEP 1 COMPLETE" in response:
            step_info["step_type"] = "analysis_planning"
            step_info["status"] = "STEP 1 COMPLETE - Proceeding to task preparation"
        elif "TASK" in response and "PREPARED" in response:
            step_info["step_type"] = "task_preparation"
            # Extract task status
            lines = response.split('\n')
            for line in lines:
                if "TASK" in line and "PREPARED" in line:
                    step_info["status"] = line.strip()
                    break
        elif "CONTINUING" in response or "ALL TASKS PREPARED" in response:
            step_info["step_type"] = "execution_check"
            if "ALL TASKS PREPARED" in response:
                step_info["status"] = "ALL TASKS PREPARED - Ready for user approval and execution"
            else:
                step_info["status"] = "CONTINUING - Next task preparation"
        
        return step_info
    
    def run_agent_loop(self, user_request: str) -> None:
        """Run the complete agent looping process."""
        print("🚀 Starting Agent Prototype - Looping Mechanism Demo")
        print("=" * 60)
        print(f"📝 User Request: {user_request}")
        print("=" * 60)
        
        while self.iteration_count < self.max_iterations:
            self.iteration_count += 1
            
            print(f"\n🔄 ITERATION {self.iteration_count}")
            print("-" * 40)
            
            # Build the prompt
            prompt_messages = self.build_prompt(user_request)
            
            print(f"📨 Sending prompt to Anthropic API...")
            print(f"   System prompt: {len(system_prompt)} characters")
            print(f"   Message history: {len(self.messages)} messages")
            
            # Call the API
            response = self.call_anthropic_api(prompt_messages)
            
            # Display the response
            print(f"\n🤖 AGENT RESPONSE:")
            print("-" * 30)
            print(response)
            print("-" * 30)
            
            # Extract step information
            step_info = self.extract_step_info(response)
            print(f"📊 Step Type: {step_info['step_type']}")
            print(f"📊 Status: {step_info['status']}")
            
            # Add the response to message history
            self.messages.append(Message(
                role="assistant",
                content=response,
                timestamp=datetime.now()
            ))
            
            # Check if task is complete
            if self.is_task_complete(response):
                print(f"\n✅ TASK COMPLETE! Agent finished after {self.iteration_count} iterations.")
                break
            
            # Add a simple continuation message for the next iteration
            if self.iteration_count < self.max_iterations:
                print(f"\n➡️  Continuing to next step...")
                # Add a continuation message to prompt the agent to continue
                self.messages.append(Message(
                    role="user",
                    content="Continue with the next step.",
                    timestamp=datetime.now()
                ))
        
        if self.iteration_count >= self.max_iterations:
            print(f"\n⚠️  Reached maximum iterations ({self.max_iterations}). Stopping.")
        
        self._display_summary()
    
    def _display_summary(self) -> None:
        """Display a summary of the entire conversation."""
        print("\n📊 CONVERSATION SUMMARY")
        print("=" * 60)
        print(f"Total iterations: {self.iteration_count}")
        print(f"Total messages: {len(self.messages)}")
        
        print("\n📝 Message History:")
        for i, message in enumerate(self.messages, 1):
            print(f"\nMessage {i} ({message.role}):")
            print(f"Timestamp: {message.timestamp.strftime('%H:%M:%S')}")
            # Show first 100 characters of content
            preview = message.content[:100].replace('\n', ' ')
            if len(message.content) > 100:
                preview += "..."
            print(f"Content: {preview}")
        
        print(f"\n✨ This demonstrates:")
        print("  • Step-by-step looping mechanism")
        print("  • Message storage after each step")
        print("  • Automatic continuation until completion")
        print("  • Real Anthropic API integration")


def main():
    """Main function to run the agent prototype."""
    # Sample request for QuickBooks expense filing
    sample_request = """File a new expense transaction based on the following invoice

{
  "invoice_header": {
    "vendor": {
      "company_name": "People Center, Inc.",
      "address": {
        "street": "430 California Street 12th floor",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "94104",
        "country": "US"
      }
    },
    "customer": {
      "company_name": "Rialto Finance, Inc.",
      "address": {
        "street": "1770 Green Street 603",
        "city": "San Francisco",
        "state": "CA",
        "zip_code": "94123",
        "country": "US"
      }
    },
    "invoice_number": "INV-02DQW-00036",
    "invoice_date": "August 01, 2025",
    "payment_terms": "Due Immediately",
    "billing_currency": "USD"
  },
  "line_items": [
    {
      "category": "HR Management",
      "service": "Learning Management System US",
      "billing_frequency": "Monthly",
      "service_period": "Aug 2025",
      "description": "x2 employees",
      "rate": null,
      "base_fee": null,
      "amount": 0.00,
      "sales_tax": 0.00,
      "subtotal": 0.00
    },
    {
      "category": "Insurance & Benefits",
      "service": "Flex Benefits Package",
      "billing_frequency": "Monthly",
      "service_period": "Aug 2025",
      "description": "x2 employees",
      "rate": 6.00,
      "base_fee": null,
      "amount": 12.00,
      "sales_tax": 0.00,
      "subtotal": 12.00
    },
    {
      "category": "Finance",
      "service": "Global Payroll",
      "billing_frequency": "One-time",
      "service_period": "Jul 2025",
      "description": "x0 garnishments",
      "rate": null,
      "base_fee": null,
      "amount": 0.00,
      "sales_tax": 0.00,
      "subtotal": 0.00
    },
    {
      "category": "Other",
      "service": "HRIS (Full HRIS)",
      "billing_frequency": "Monthly",
      "service_period": "Aug 2025",
      "description": "x4 employees",
      "rate": null,
      "base_fee": null,
      "amount": 0.00,
      "sales_tax": 0.00,
      "subtotal": 0.00
    },
    {
      "category": "Other",
      "service": "HRIS (Full HRIS)",
      "billing_frequency": "Monthly",
      "service_period": "Jul 2025",
      "description": "x2 employees",
      "rate": null,
      "base_fee": null,
      "amount": 0.00,
      "sales_tax": 0.00,
      "subtotal": 0.00
    },
    {
      "category": "Other",
      "service": "HR Services",
      "billing_frequency": "Monthly",
      "service_period": "Aug 2025",
      "description": "x2 employees",
      "rate": 75.00,
      "base_fee": null,
      "amount": 150.00,
      "sales_tax": 0.00,
      "subtotal": 150.00
    }
  ],
  "totals": {
    "total_amount": 162.00,
    "total_sales_tax": 0.00,
    "total_due": 162.00
  },
  "notes": [
    "This is not a confirmation of payment.",
    "We reserve the right to bill at our discretion, anytime after the Due Date mentioned on the invoice.",
    "In the event of any discrepancies or concerns regarding this Invoice, we kindly request that you report them promptly to your AM.",
    "Please note that additional charges such as credit card processing fees may apply to this invoice based on the payment method used. These charges will be clearly indicated and detailed on subsequent documents generated after the transaction."
  ],
  "branding": {
    "vendor_logo": "RIPPLING"
  },
  "document_info": {
    "page_number": "1 of 1"
  }
}"""
    
    print("🎬 AGENT PROTOTYPE DEMONSTRATION")
    print("Testing the new step-by-step looping mechanism")
    print("with real Anthropic API calls")
    
    try:
        agent = AgentPrototype()
        agent.run_agent_loop(sample_request)
        
    except KeyboardInterrupt:
        print("\n\n⏹️  Stopped by user")
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    main()