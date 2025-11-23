import { baseApi, type ApiResponse } from './baseApi'
import type {
	CanceledRegisteredTopic,
	Topic,
	ITopicDetail,
	PaginatedDraftTopics,
	GetPaginatedTopics,
	CreateTopicPayload,
	PaginatedSubmittedTopics
} from '@/models'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'

export const topicApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTopics: builder.query<GetPaginatedTopics, void>({
			query: () => `/topics`,
			transformResponse: (response: ApiResponse<GetPaginatedTopics>) => response.data
		}),
		getTopicsOfPeriod: builder.query<GetPaginatedTopics, { periodId: string; query: PaginationQueryParamsDto }>({
			query: ({ periodId, query }) => {
				const queryString = buildQueryString(query)
				return `/topics/period-topics/${periodId}?${queryString}`
			},
			transformResponse: (response: ApiResponse<GetPaginatedTopics>) => response.data
		}),
		getTopicById: builder.query<ITopicDetail, { id: string }>({
			query: ({ id }) => `/topics/${id}`,
			transformResponse: (response: ApiResponse<ITopicDetail>) => response.data
		}),

		getSavedTopics: builder.query<GetPaginatedTopics, { queries: PaginationQueryParamsDto }>({
			query: ({ queries }) => {
				const queryString = buildQueryString(queries)
				return `/topics/saved-topics?${queryString}`
			},
			transformResponse: (response: ApiResponse<GetPaginatedTopics>) => response.data
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
		getRegisteredTopic: builder.query<GetPaginatedTopics, { queries: PaginationQueryParamsDto }>({
			query: ({ queries }) => {
				const queryString = buildQueryString(queries)
				return `/topics/registered-topics?${queryString}`
			},
			transformResponse: (response: ApiResponse<GetPaginatedTopics>) => response.data
		}),
		getCanceledRegisterTopics: builder.query<CanceledRegisteredTopic[], void>({
			query: () => `/topics/canceled-registered-topics`,
			transformResponse: (response: ApiResponse<CanceledRegisteredTopic[]>) => response.data
		}),
		getDraftTopics: builder.query<PaginatedDraftTopics, PaginationQueryParamsDto>({
			query: () => `/topics/lecturer/get-draft-topics`,
			transformResponse: (response: ApiResponse<PaginatedDraftTopics>) => response.data
		}),
		getSubmittedTopics: builder.query<PaginatedSubmittedTopics, PaginationQueryParamsDto>({
			query: (queries) => {
				const queryString = buildQueryString(queries)
				return `/topics/lecturer/get-submitted-topics?${queryString}`
			},
			transformResponse: (response: ApiResponse<PaginatedSubmittedTopics>) => response.data
		}),
		createTopic: builder.mutation<Topic, CreateTopicPayload>({
			query: (body) => ({
				url: '/topics',
				method: 'POST',
				body
			}),
			transformResponse: (response: ApiResponse<Topic>) => response.data
		}),
		submitTopic: builder.mutation<ApiResponse<Topic>, { topicId: string; periodId: string }>({
			query: ({ topicId, periodId }) => ({
				url: `/topics/lec/submit-topic/${topicId}/${periodId}`,
				method: 'PATCH'
			})
		})
	}),
	overrideExisting: false
})

export const {
	useGetTopicsQuery,
	useGetTopicByIdQuery,
	useGetTopicsOfPeriodQuery,
	useSaveTopicMutation,
	useUnsaveTopicMutation,
	useGetSavedTopicsQuery,
	useLazyGetTopicByIdQuery,
	useGetRegisteredTopicQuery,
	useGetCanceledRegisterTopicsQuery,
	useGetDraftTopicsQuery,
	useGetSubmittedTopicsQuery,
	useCreateTopicMutation,
	useSubmitTopicMutation
} = topicApi
