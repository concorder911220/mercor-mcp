import { basicApi } from '../basicApi'
import { MeetingsData } from '../data-types/calendar';

const apiWithTag = basicApi.enhanceEndpoints({})

export const artistApi = apiWithTag.injectEndpoints({
    endpoints: (build) => ({
        getUpcomingEvents: build.query<MeetingsData, { email: string }>({
            query: ({ email }) => ({
                url: `/calendar/events/${email}`,
                method: 'GET',
            }),
            providesTags: (result, error, { email }) => {
                return result
                    ? [
                        { type: 'Upcoming_Events', id: email },
                    ]
                    : [{ type: 'Upcoming_Events', id: email }];
            },
        })
    }),
})

export const { useGetUpcomingEventsQuery, useLazyGetUpcomingEventsQuery } = artistApi