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
	PaginatedGeneralTopics,
	UpdateTopicPayload,
	CreateTopicRequest,
	CreateTopicResponse
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
		getDraftTopics: builder.query<PaginatedDraftTopics, { queries: PaginationQueryParamsDto }>({
			query: ({ queries }) => {
				const queryString = buildQueryString(queries)
				return `/topics/lecturer/get-draft-topics?${queryString}`
			},
			transformResponse: (response: ApiResponse<PaginatedDraftTopics>) => response.data
		}),
		getSubmittedTopics: builder.query<PaginatedSubmittedTopics, PaginationQueryParamsDto>({
			query: (queries) => {
				const queryString = buildQueryString(queries)
				return `/topics/lecturer/get-submitted-topics?${queryString}`
			},
			transformResponse: (response: ApiResponse<PaginatedSubmittedTopics>) => response.data
		}),
		createTopic: builder.mutation<CreateTopicResponse, CreateTopicRequest>({
			query: ({ topicData, files }) => {
				const formData = new FormData()

				// 1. Append Files (key phải khớp với 'files' trong FilesInterceptor ở NestJS)
				if (files && files.length > 0) {
					files.forEach((file) => {
						formData.append('files', file)
					})
				}

				// 2. Append DTO Fields
				// Duyệt qua từng key của topicData để append vào formData
				Object.keys(topicData).forEach((key) => {
					const value = topicData[key as keyof typeof topicData]

					if (value === undefined || value === null) return

					if (Array.isArray(value)) {
						// Xử lý mảng (fieldIds, requirementIds)
						// NestJS thường đọc mảng theo kiểu key[] hoặc lặp lại key
						value.forEach((item) => {
							formData.append(`${key}[]`, item as string)
							// Hoặc formData.append(key, item); tùy cấu hình ValidationPipe
						})
					} else {
						// Các trường nguyên thủy (string, number)
						formData.append(key, value.toString())
					}
				})

				return {
					url: '/topics', // Đường dẫn tới Controller
					method: 'POST',
					body: formData
					// FormData không cần responseHandler đặc biệt, RTK Query tự xử lý
				}
			}
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
		updateTopic: builder.mutation<
			{ messsage: string },
			{ topicId: string; periodId: string; body: UpdateTopicPayload }
		>({
			query: ({ topicId, periodId, body }) => ({
				url: `/topics/${topicId}/in-period/${periodId}`,
				method: 'PATCH',
				body
			})
		}),
		setAllowManualApproval: builder.mutation<{ message: string }, { topicId: string; allow: boolean }>({
			query: ({ topicId, allow }) => ({
				url: `/topics/${topicId}/set-allow-manual-approval?allowManualApproval=${allow}`,
				method: 'PATCH'
			})
		}),
		withdrawSubmittedTopics: builder.mutation<{ message: string }, { topicIds: string[] }>({
			query: ({ topicIds }) => ({
				url: '/topics/withdraw-submitted-topics',
				method: 'PATCH',
				body: { topicIds }
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
	useSubmitTopicMutation,
	useFacuBoardApproveTopicMutation,
	useFacuBoardRejectTopicMutation,
	useLecturerUploadFilesMutation,
	useLecturerDeleteFilesMutation,
	useLecturerDeleteFileMutation,
	useUpdateTopicMutation,
	useSetAllowManualApprovalMutation,
	useWithdrawSubmittedTopicsMutation
} = topicApi
