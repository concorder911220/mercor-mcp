import { basicApi } from '../basicApi'
import { ITaskResponse, ITasksResponse, ITaskDetail } from '../data-types/task';
import { components } from '../../types/backend-schema';

const apiWithTag = basicApi.enhanceEndpoints({})

export const taskApi = apiWithTag.injectEndpoints({
    endpoints: (build) => ({
        getTasks: build.query<ITasksResponse, {
            page?: number;
            page_size?: number;
            status_filter?: string | null;
            user_id?: string | null;
            parent_only?: boolean;
        }>({
            query: (params = {}) => ({
                url: `/tasks`,
                method: 'GET',
                params
            }),
            providesTags: (result, error) => {
                return result
                    ? [
                        { type: 'Tasks' },
                    ]
                    : [{ type: 'Tasks' }];
            },
        }),
        getTask: build.query<components['schemas']['TaskDetailResponse'], { id: string }>({
            query: ({ id }) => ({
                url: `/tasks/${id}`,
                method: 'GET',
            })
        })
    })
})

export const { useGetTasksQuery, useLazyGetTasksQuery, useGetTaskQuery, useLazyGetTaskQuery } = taskApi