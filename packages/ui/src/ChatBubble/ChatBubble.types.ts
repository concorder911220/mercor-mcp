export interface ChatBubbleProps {
  onMessage?: (message: string) => void;
  drawerOpen?: boolean;
  autoOpen?: boolean;
  messages?: Array<{ text: string; isUser: boolean; timestamp: string | Date }>;
}

export interface ChatBubbleRef {
  addMessage: (text: string, isUser?: boolean) => void;
  open: () => void;
  close: () => void;
}
