import { baseApi, type ApiResponse } from './baseApi'
import type { Topic } from 'models'

export const topicApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTopics: builder.query<Topic[], void>({
			query: () => `/topics`,
			transformResponse: (response: ApiResponse<Topic[]>) => response.data
		}),
		getTopicById: builder.query<Topic, { id: string }>({
			query: ({ id }) => `/topics/${id}`,
			transformResponse: (response: ApiResponse<Topic>) => response.data
		}),
		saveTopic: builder.mutation<ApiResponse<Topic>, { topicId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/save-thesis/${topicId}`,
				method: 'POST'
			})
		}),
		getSavedTopics: builder.query<Topic[], void>({
			query: () => `/theses/saved-theses`,
			transformResponse: (response: ApiResponse<Topic[]>) => response.data,
			providesTags: ['Theses']
		}),
		unsaveTopic: builder.mutation<ApiResponse<Topic>, { thesisId: string }>({
			query: ({ thesisId }) => ({
				url: `/theses/unsave-thesis/${thesisId}`,
				method: 'PATCH'
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
