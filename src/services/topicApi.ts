import { baseApi, type ApiResponse } from './baseApi'
import type { Topic } from 'models'

export const topicApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTopics: builder.query<Topic[], void>({
			query: () => `/topics`,
			transformResponse: (response: ApiResponse<Topic[]>) => response.data,
			providesTags: ['Topics']
		}),
		getTopicById: builder.query<Topic, { id: string }>({
			query: ({ id }) => `/topics/${id}`,
			transformResponse: (response: ApiResponse<Topic>) => response.data
		}),

		getSavedTopics: builder.query<Topic[], void>({
			query: () => `/topics/saved-topics`,
			transformResponse: (response: ApiResponse<Topic[]>) => response.data,
			providesTags: ['SavedTopics']
		}),
		saveTopic: builder.mutation<ApiResponse<Topic>, { topicId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/save-topic/${topicId}`,
				method: 'POST'
			})
		}),
		unsaveTopic: builder.mutation<ApiResponse<Topic>, { topicId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/unsave-topic/${topicId}`,
				method: 'DELETE'
			})
		})
	}),
	overrideExisting: false
})

export const {
	useGetTopicsQuery,
	useGetTopicByIdQuery,
	useSaveTopicMutation,
	useUnsaveTopicMutation,
	useGetSavedTopicsQuery,
	useLazyGetTopicByIdQuery
	//useGetRegisteredTopicQuery,
} = topicApi
