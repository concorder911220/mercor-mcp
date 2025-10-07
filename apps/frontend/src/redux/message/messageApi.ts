import { basicApi } from '../basicApi'
import { IMessageResponse, IMessageRequest, FileUploadResponse } from '../data-types/message';

const apiWithTag = basicApi.enhanceEndpoints({})

export const messageApi = apiWithTag.injectEndpoints({
    endpoints: (build) => ({
        postMessage: build.mutation<IMessageResponse, IMessageRequest>({
            query: ( body ) => ({
                url: `/core-agent/chat`,
                method: 'POST',
                body
            }),
            invalidatesTags: [{type: 'Messages', id: 'LIST'}],
        }),
        // New chat endpoint for SSE streaming
        chatStream: build.mutation<void, { query: string; user_id: string; conversation_id?: string }>({
            query: (body) => ({
                url: `/chat/`,
                method: 'POST',
                body,
            }),
            // This won't return data since it's SSE, we'll handle streaming separately
        }),
        // File upload endpoint
        uploadFile: build.mutation<FileUploadResponse, FormData>({
            query: (formData) => ({
                url: `/files/upload`,
                method: 'POST',
                body: formData,
            }),
        }),
    }),
})

export const { usePostMessageMutation, useChatStreamMutation, useUploadFileMutation } = messageApi