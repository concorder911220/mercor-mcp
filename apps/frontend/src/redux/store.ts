import { configureStore } from '@reduxjs/toolkit'
import { basicApi } from './basicApi'
import taskReducer from './task/taskSlice'
import chatReducer from './chat/chatSlice'

export const store = configureStore({
    reducer: {
        [basicApi.reducerPath]: basicApi.reducer,
        tasks: taskReducer,
        chat: chatReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(
        basicApi.middleware,
    ),
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch
