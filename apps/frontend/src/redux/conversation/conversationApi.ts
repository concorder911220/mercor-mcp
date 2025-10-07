import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Conversation, ConversationSummary } from '../../types/index';
import { basicApi } from '../basicApi'

const apiWithTag = basicApi.enhanceEndpoints({})

export const conversationApi = apiWithTag.injectEndpoints({
  endpoints: (builder) => ({
    // Get a single conversation by ID (includes messages)
    getConversation: builder.query<Conversation, string>({
      query: (conversationId) => `/conversations/${conversationId}`,
      providesTags: (result, error, conversationId) => [
        { type: 'Conversation', id: conversationId }
      ],
    }),

    // Get all conversations for a user (without messages for performance)
    // Returns up to 20 most recent conversations ordered by timestamp
    getUserConversations: builder.query<ConversationSummary[], string>({
      query: (userId) => `/conversations/user/${userId}`,
      providesTags: ['Conversations'],
    }),

    // Get all conversations (without messages for performance)
    // Returns up to 20 most recent conversations ordered by timestamp
    getAllConversations: builder.query<ConversationSummary[], void>({
      query: () => '/conversations/',
      providesTags: ['Conversations'],
    }),

    // Create a new conversation
    createConversation: builder.mutation<Conversation, { title: string; user_id: string }>({
      query: (conversationData) => ({
        url: '/conversations/',
        method: 'POST',
        body: conversationData,
      }),
      invalidatesTags: ['Conversations'],
    }),

    // Update a conversation
    updateConversation: builder.mutation<Conversation, { conversationId: string; title: string }>({
      query: ({ conversationId, title }) => ({
        url: `/conversations/${conversationId}`,
        method: 'PUT',
        body: { title },
      }),
      invalidatesTags: (result, error, { conversationId }) => [
        { type: 'Conversation', id: conversationId },
        'Conversations'
      ],
    }),

    // Delete a conversation
    deleteConversation: builder.mutation<void, string>({
      query: (conversationId) => ({
        url: `/conversations/${conversationId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Conversations'],
    }),
  }),
});

export const {
  useGetConversationQuery,
  useGetUserConversationsQuery,
  useGetAllConversationsQuery,
  useCreateConversationMutation,
  useUpdateConversationMutation,
  useDeleteConversationMutation,
} = conversationApi;
