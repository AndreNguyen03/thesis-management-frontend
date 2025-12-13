import { baseApi, type ApiResponse } from './baseApi'
import type {
	CanceledRegisteredTopic,
	Topic,
	ITopicDetail,
	PaginatedDraftTopics,
	GetPaginatedTopics,
	PaginatedSubmittedTopics,
	PaginatedGeneralTopics,
	UpdateTopicPayload,
	CreateTopicRequest,
	CreateTopicResponse,
	RequestGradeTopicDto,
	PaginationTopicsQueryParams
} from '@/models'
import type { GetMajorLibraryCombox, GetMajorMiniDto } from '@/models/major.model'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'

export const topicApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTopics: builder.query<GetPaginatedTopics, void>({
			query: () => `/topics`,
			transformResponse: (response: ApiResponse<GetPaginatedTopics>) => response.data
		}),

		getTopicsInPhase: builder.query<
			PaginatedGeneralTopics,
			{ periodId: string; queries: PaginationTopicsQueryParams }
		>({
			query: ({ periodId, queries }) => {
				const queryString = buildQueryString(queries)
				return {
					url: `/periods/${periodId}/get-topics-in-phase?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedGeneralTopics>) => response.data,
			providesTags: (result, error, { periodId }) => [{ type: 'PhaseTopics' as const, id: periodId }]
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
		submitTopic: builder.mutation<{ message: string }, { topicId: string; periodId: string }>({
			query: ({ topicId, periodId }) => ({
				url: `/topics/lec/submit-topic/${topicId}/in-period/${periodId}`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { periodId }) => [{ type: 'PhaseTopics', id: periodId }]
		}),

		facuBoardApproveTopic: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/faculty-board/approve-topic/${topicId}`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		facuBoardRejectTopic: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/faculty-board/reject-topic/${topicId}`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		markUnderReviewingTopic: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/${topicId}/under-review`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		setTopicInProgressing: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/${topicId}/set-in-progressing`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		markDelayedTopic: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/${topicId}/mark-deplayed-topic`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		markPausedTopic: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/${topicId}/mark-paused-topic`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		markCompletedProcessing: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/${topicId}/sumit-topic/completed-processing`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		setAwaitingEvaluation: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/${topicId}/set-awaiting-evaluation`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		scoringBoardGradeTopic: builder.mutation<
			{ message: string },
			{ topicId: string; body: RequestGradeTopicDto; phaseId: string }
		>({
			query: ({ topicId, body }) => ({
				url: `/topics/${topicId}/scoring-board/grade-topic`,
				method: 'PATCH',
				body
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		scoringBoardRejectTopic: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/${topicId}/scoring-board/reject-topic`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		markReviewedTopic: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/${topicId}/review-graded-topic`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
		}),

		archiveTopic: builder.mutation<{ message: string }, { topicId: string; phaseId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/${topicId}/archive-topic`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId }) => [{ type: 'PhaseTopics', id: phaseId }]
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
		}),
		copyToDraft: builder.mutation<{ message: string }, { topicId: string }>({
			query: ({ topicId }) => ({
				url: `/topics/copy-to-draft/${topicId}`,
				method: 'POST'
			})
		}),
		deleteTopics: builder.mutation<{ message: string }, { topicIds: string[] }>({
			query: ({ topicIds }) => ({
				url: `/topics/delete/`,
				method: 'DELETE',
				body: topicIds // gửi mảng topicIds trong body
			})
		}),
		getMajorCombobox: builder.query<GetMajorLibraryCombox[], void>({
			query: () => ({
				url: 'topics/library/majors-combobox',
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<GetMajorLibraryCombox[]>) => response.data
		}),
		getYearCombobox: builder.query<string[], void>({
			query: () => ({
				url: 'topics/library/years-combobox',
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<string[]>) => response.data
		})
	}),
	overrideExisting: false
})

export const {
	useGetTopicsQuery,
	useGetTopicByIdQuery,
	useGetTopicsInPhaseQuery,
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
	useLecturerUploadFilesMutation,
	useLecturerDeleteFilesMutation,
	useLecturerDeleteFileMutation,
	useUpdateTopicMutation,
	useSetAllowManualApprovalMutation,
	useWithdrawSubmittedTopicsMutation,
	useFacuBoardRejectTopicMutation,
	useMarkUnderReviewingTopicMutation,
	useSetTopicInProgressingMutation,
	useMarkDelayedTopicMutation,
	useMarkPausedTopicMutation,
	useMarkCompletedProcessingMutation,
	useSetAwaitingEvaluationMutation,
	useScoringBoardGradeTopicMutation,
	useScoringBoardRejectTopicMutation,
	useMarkReviewedTopicMutation,
	useArchiveTopicMutation,
	useCopyToDraftMutation,
	useDeleteTopicsMutation,
	useGetMajorComboboxQuery,
	useGetYearComboboxQuery
} = topicApi
