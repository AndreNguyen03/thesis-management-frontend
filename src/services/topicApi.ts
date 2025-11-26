import { baseApi, type ApiResponse } from './baseApi'
import type {
	CanceledRegisteredTopic,
	Topic,
	ITopicDetail,
	PaginatedDraftTopics,
	GetPaginatedTopics,
	CreateTopicPayload,
	PaginatedSubmittedTopics,
	PaginationTopicsQueryParams,
	PaginatedGeneralTopics
} from '@/models'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'

export const topicApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTopics: builder.query<GetPaginatedTopics, void>({
			query: () => `/topics`,
			transformResponse: (response: ApiResponse<GetPaginatedTopics>) => response.data
		}),
		getTopicsOfPeriod: builder.query<
			PaginatedGeneralTopics,
			{ periodId: string; queries: PaginationTopicsQueryParams }
		>({
			query: ({ periodId, queries }) => {
				const queryString = buildQueryString(queries)
				return `/topics/period-topics/${periodId}?${queryString}`
			},
			transformResponse: (response: ApiResponse<PaginatedGeneralTopics>) => response.data
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
				url: `/topics/lec/submit-topic/${topicId}/in-period/${periodId}`,
				method: 'PATCH'
			})
		}),
		facuBoardApproveTopic: builder.mutation<string, { topicId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/faculty-board/approve-topic/${topicId}`,
				method: 'PATCH'
			})
		}),
		facuBoardRejectTopic: builder.mutation<string, { topicId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/faculty-board/reject-topic/${topicId}`,
				method: 'PATCH'
			})
		}),
		lecturerUploadFiles: builder.mutation<{ message: string }, { topicId: string; files: File[] }>({
			query: ({ topicId, files }) => {
				const formData = new FormData()
				files.forEach((file) => formData.append('files', file))
				return {
					url: `/topics/${topicId}/lecturer/upload-files`,
					method: 'POST',
					body: formData
				}
			}
		}),
		lecturerDeleteFiles: builder.mutation<{ message: string }, { topicId: string; fileIds: string[] }>({
			query: ({ topicId, fileIds }) => ({
				url: `/topics/${topicId}/lecturer/delete-files`,
				method: 'DELETE',
				body: fileIds // gửi mảng fileIds trong body
			})
		}),
		lecturerDeleteFile: builder.mutation<{ message: string }, { topicId: string; fileId: string }>({
			query: ({ topicId, fileId }) => ({
				url: `/topics/${topicId}/lecturer/delete-file?fileId=${fileId}`,
				method: 'DELETE'
			})
		}),
		
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
	useSubmitTopicMutation,
	useFacuBoardApproveTopicMutation,
	useFacuBoardRejectTopicMutation,
	useLecturerUploadFilesMutation,
	useLecturerDeleteFilesMutation,
	useLecturerDeleteFileMutation
} = topicApi
