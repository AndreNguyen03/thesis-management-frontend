import { baseApi, type ApiResponse } from './baseApi'
import type { CanceledRegisteredTopic, Topic, ITopicDetail } from 'models'

export const topicApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTopics: builder.query<Topic[], void>({
			query: () => `/topics`,
			transformResponse: (response: ApiResponse<Topic[]>) => response.data
		}),
		getTopicById: builder.query<ITopicDetail, { id: string }>({
			query: ({ id }) => `/topics/${id}`,
			transformResponse: (response: ApiResponse<ITopicDetail>) => response.data
		}),

		getSavedTopics: builder.query<Topic[], void>({
			query: () => `/topics/saved-topics`,
			transformResponse: (response: ApiResponse<Topic[]>) => response.data
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
		}),
		getRegisteredTopic: builder.query<Topic[], void>({
			query: () => `/topics/registered-topics`,
			transformResponse: (response: ApiResponse<Topic[]>) => response.data
		}),
		getCanceledRegisterTopics: builder.query<CanceledRegisteredTopic[], void>({
			query: () => `/topics/canceled-registered-topics`,
			transformResponse: (response: ApiResponse<CanceledRegisteredTopic[]>) => response.data
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
	useLazyGetTopicByIdQuery,
	useGetRegisteredTopicQuery,
	useGetCanceledRegisterTopicsQuery
} = topicApi
