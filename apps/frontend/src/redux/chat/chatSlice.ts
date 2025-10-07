import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ChatMessage {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: string; // Changed from Date to string for Redux serialization
}

export interface ChatState {
  messages: ChatMessage[];
  isOpen: boolean;
  isLoading: boolean;
}

const initialState: ChatState = {
  messages: [],
  isOpen: false,
  isLoading: false,
};

const chatSlice = createSlice({
  name: 'chat',
  initialState,
  reducers: {
    addMessage: (state, action: PayloadAction<Omit<ChatMessage, 'id' | 'timestamp'>>) => {
      const newMessage: ChatMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        text: action.payload.text,
        isUser: action.payload.isUser,
        timestamp: new Date().toISOString(), // Store as ISO string for Redux serialization
      };
      state.messages.push(newMessage);
    },
    setMessages: (state, action: PayloadAction<ChatMessage[]>) => {
      state.messages = action.payload;
    },
    clearMessages: (state) => {
      state.messages = [];
    },
    setChatOpen: (state, action: PayloadAction<boolean>) => {
      state.isOpen = action.payload;
    },
    setChatLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    openChat: (state) => {
      state.isOpen = true;
    },
    closeChat: (state) => {
      state.isOpen = false;
    },
  },
});

export const {
  addMessage,
  setMessages,
  clearMessages,
  setChatOpen,
  setChatLoading,
  openChat,
  closeChat,
} = chatSlice.actions;

export default chatSlice.reducer;
