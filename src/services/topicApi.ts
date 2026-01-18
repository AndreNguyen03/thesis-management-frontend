import { baseApi, type ApiResponse } from './baseApi'
import type {
	CanceledRegisteredTopic,
	Topic,
	ITopicDetail,
	PaginatedDraftTopics,
	GetPaginatedTopics,
	PaginatedSubmittedTopics,
	UpdateTopicPayload,
	CreateTopicRequest,
	CreateTopicResponse,
	RequestGradeTopicDto,
	PaginationTopicsQueryParams,
	PaginationLecturerGetTopicsInPhaseParams,
	SubmittedTopicParamsDto,
	PaginatedTopicApproval,
	ApprovalTopicQueryParams,
	DetailTopicsInDefenseMilestone,
	UpdateDefenseResultDto,
	PaginationRegisteredTopicsQueryParams,
	PaginationDraftTopicsQueryParams,
	AllSubmittedTopicsParamsDto,
	TrendingKeyword,
	SystemOverviewStats,
	MonthlyStat,
	MajorDistribution
} from '@/models'

import type { GetUploadedFileDto } from '@/models/file.model'
import type { GetMajorLibraryCombox } from '@/models/major.model'
import type { PaginatedTopicInBatchMilestone } from '@/models/milestone.model'
import type { PaginatedTopicsInPeriod } from '@/models/period.model'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'

export const topicApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTopics: builder.query<GetPaginatedTopics, void>({
			query: () => `/topics`,
			transformResponse: (response: ApiResponse<GetPaginatedTopics>) => response.data
		}),
		getTopicsInPhase: builder.query<
			PaginatedTopicsInPeriod,
			{ periodId: string; queries: PaginationTopicsQueryParams }
		>({
			query: ({ periodId, queries }) => {
				const queryString = buildQueryString(queries)
				return {
					url: `/periods/${periodId}/get-topics-in-phase?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedTopicsInPeriod>) => response.data,
			providesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
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
		getRegisteredTopic: builder.query<GetPaginatedTopics, { queries: PaginationRegisteredTopicsQueryParams }>({
			query: ({ queries }) => {
				const queryString = buildQueryString(queries)
				return `/topics/registered-topics?${queryString}`
			},
			transformResponse: (response: ApiResponse<GetPaginatedTopics>) => response.data,
			providesTags: ['MyRegisteredTopics']
		}),
		getCanceledRegisterTopics: builder.query<CanceledRegisteredTopic[], void>({
			query: () => `/topics/canceled-registered-topics`,
			transformResponse: (response: ApiResponse<CanceledRegisteredTopic[]>) => response.data,
			providesTags: ['MyRegisteredTopics']
		}),
		getDraftTopics: builder.query<PaginatedDraftTopics, { queries: PaginationDraftTopicsQueryParams }>({
			query: ({ queries }) => {
				const queryString = buildQueryString(queries)
				return `/topics/lecturer/get-draft-topics?${queryString}`
			},
			transformResponse: (response: ApiResponse<PaginatedDraftTopics>) => response.data
		}),
		getSubmittedTopics: builder.query<PaginatedSubmittedTopics, SubmittedTopicParamsDto>({
			query: (queries) => {
				const queryString = buildQueryString(queries)
				return `/topics/lecturer/get-submitted-topics?${queryString}`
			},
			transformResponse: (response: ApiResponse<PaginatedSubmittedTopics>) => response.data,
			providesTags: (result, error, args) => [{ type: 'LecturerSubmittedTopics', id: args.periodId }]
		}),
		getAllSubmittedTopics: builder.query<PaginatedSubmittedTopics, AllSubmittedTopicsParamsDto>({
			query: (queries) => {
				const queryString = buildQueryString(queries)
				return `/topics/lecturer/get-all-submitted-topics?${queryString}`
			},
			transformResponse: (response: ApiResponse<PaginatedSubmittedTopics>) => response.data,
			providesTags: (result, error, args) => [{ type: 'LecturerSubmittedTopics', id: args.periodId }]
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

		facuBoardApproveTopic: builder.mutation<
			{ message: string },
			{ topicId: string; phaseId: string; periodId: string }
		>({
			query: ({ topicId }) => ({
				url: `/topics/faculty-board/approve-topic/${topicId}`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId, periodId }) => [
				{ type: 'PhaseTopics', id: phaseId },
				{ type: 'LecturerSubmittedTopics', id: periodId }
			]
		}),

		facuBoardRequestEditTopic: builder.mutation<
			{ message: string },
			{ topicId: string; phaseId: string; periodId: string; comment: string }
		>({
			query: ({ topicId, comment }) => ({
				url: `/topics/faculty-board/request-edit-topic/${topicId}`,
				method: 'PATCH',
				body: { comment }
			}),
			invalidatesTags: (_result, _error, { phaseId, periodId }) => [
				{ type: 'PhaseTopics', id: phaseId },
				{ type: 'LecturerSubmittedTopics', id: periodId }
			]
		}),

		facuBoardRejectTopic: builder.mutation<
			{ message: string },
			{ topicId: string; phaseId: string; periodId: string }
		>({
			query: ({ topicId }) => ({
				url: `/topics/faculty-board/reject-topic/${topicId}`,
				method: 'PATCH'
			}),
			invalidatesTags: (_result, _error, { phaseId, periodId }) => [
				{ type: 'PhaseTopics', id: phaseId },
				{ type: 'LecturerSubmittedTopics', id: periodId }
			]
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

		markPausedTopic: builder.mutation<{ message: string }, { topicIds: string[]; phaseId: string }>({
			query: ({ topicIds }) => ({
				url: `/topics/mark-paused-topic`,
				method: 'PATCH',
				body: { topicIds }
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

		setAwaitingEvaluation: builder.mutation<{ message: string }, { topicId: string; phaseId?: string }>({
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
		lecturerUploadFiles: builder.mutation<GetUploadedFileDto[], { groupId: string; files: File[] }>({
			query: ({ groupId, files }) => {
				const formData = new FormData()
				files.forEach((file) => formData.append('files', file))
				return {
					url: `/topics/in-group/${groupId}/lecturer/upload-files`,
					method: 'POST',
					body: formData
				}
			},
			transformResponse: (response: ApiResponse<GetUploadedFileDto[]>) => response.data
		}),
		lecturerDeleteFiles: builder.mutation<{ message: string }, { groupId: string; fileIds: string[] }>({
			query: ({ groupId, fileIds }) => ({
				url: `/topics/in-group/${groupId}/lecturer/delete-files`,
				method: 'DELETE',
				body: fileIds // gửi mảng fileIds trong body
			})
		}),
		lecturerDeleteFile: builder.mutation<{ message: string }, { groupId: string; fileId: string }>({
			query: ({ groupId, fileId }) => ({
				url: `/topics/in-group/${groupId}/lecturer/delete-file?fileId=${fileId}`,
				method: 'DELETE'
			})
		}),
		updateTopic: builder.mutation<{ messsage: string }, { topicId: string; body: UpdateTopicPayload }>({
			query: ({ topicId, body }) => ({
				url: `/topics/${topicId}/in-period`,
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
		}),
		getDocumentsOfGroup: builder.query<GetUploadedFileDto[], { groupId: string }>({
			query: ({ groupId }) => `/topics/in-group/${groupId}/documents`,
			transformResponse: (response: ApiResponse<GetUploadedFileDto[]>) => response.data
		}),
		downloadTopicFilesZip: builder.mutation<Blob, { groupId: string }>({
			query: ({ groupId }) => ({
				url: `/topics/in-group/${groupId}/download-zip`,
				method: 'GET',
				responseHandler: (response) => response.blob()
			})
		}),
		facuBoardApproveTopics: builder.mutation<
			{ message: string },
			{ topicIds: string[]; phaseId: string; periodId: string }
		>({
			query: ({ topicIds }) => ({
				url: `/topics/faculty-board/approve-topics`,
				method: 'PATCH',
				body: { topicIds }
			}),
			invalidatesTags: (_result, _error, { phaseId, periodId }) => [
				{ type: 'PhaseTopics', id: phaseId },
				{ type: 'LecturerSubmittedTopics', id: periodId }
			]
		}),

		facuBoardRejectTopics: builder.mutation<{ message: string }, { topicIds: string[]; periodId: string }>({
			query: ({ topicIds }) => ({
				url: `/topics/faculty-board/reject-topics`,
				method: 'PATCH',
				body: { topicIds }
			}),
			invalidatesTags: (_result, _error, { periodId }) => [{ type: 'LecturerSubmittedTopics', id: periodId }]
		}),
		lecturerGetTopicsInPhase: builder.query<
			PaginatedTopicsInPeriod,
			{ periodId: string; params: PaginationLecturerGetTopicsInPhaseParams }
		>({
			query: ({ periodId, params }) => {
				const queryString = buildQueryString(params)
				return {
					url: `/periods/${periodId}/lecturer/get-topics-in-phase?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedTopicsInPeriod>) => response.data,
			providesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),
		getTopicsAwaitingEvaluationInPeriod: builder.query<
			PaginatedTopicInBatchMilestone,
			{ periodId: string; queryParams: PaginationQueryParamsDto; milestoneId?: string }
		>({
			query: ({ periodId, queryParams }) => {
				const queryString = buildQueryString(queryParams)
				console.log('Query String:', queryString)
				return {
					url: `/topics/awaiting-evaluation/in-period/${periodId}?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedTopicInBatchMilestone>) => response.data,
			providesTags: (result, error, { periodId, milestoneId }) => [
				{ type: 'AwaitingTopicsInDefensemilestone', id: milestoneId }
			]
		}),
		getTopicApprovalRegistration: builder.query<PaginatedTopicApproval, ApprovalTopicQueryParams>({
			query: (query) => {
				const queryString = buildQueryString(query)
				return {
					url: `/topics/registration-approvals?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedTopicApproval>) => response.data,
			providesTags: ['TopicRegistration']
		}),
		getDetailTopicsInDefenseMilestones: builder.query<
			DetailTopicsInDefenseMilestone,
			{ templateMilestoneId: string; queryParams: PaginationQueryParamsDto }
		>({
			query: ({ templateMilestoneId, queryParams }) => {
				const queryString = buildQueryString(queryParams)
				return {
					url: `/topics/in-defense-template/${templateMilestoneId}?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<DetailTopicsInDefenseMilestone>) => response.data,
			providesTags: (result, error, { templateMilestoneId }) => [
				{ type: 'DefenseMilestone', id: templateMilestoneId }
			]
		}),
		batchUpdateDefenseResults: builder.mutation<
			{ success: number; failed: number },
			{
				results: UpdateDefenseResultDto[]
			}
		>({
			query: ({ results }) => ({
				url: `/topics/batch-update-defense-results`,
				method: 'PATCH',
				body: { results }
			}),
			transformResponse: (response: ApiResponse<{ success: number; failed: number }>) => response.data,
			invalidatesTags: (result, error, { results }) => results.map((r) => ({ type: 'Topic', id: r.topicId }))
		}),
		batchPublishDefenseResults: builder.mutation<
			{ success: number; failed: number },
			{ topics: { topicId: string; isPublished: boolean }[]; templateMilestoneId: string }
		>({
			query: ({ topics, templateMilestoneId }) => ({
				url: `/topics/batch-publish-defense-results?templateMilestoneId=${templateMilestoneId}`,
				method: 'PATCH',
				body: { topics }
			}),
			transformResponse: (response: ApiResponse<{ success: number; failed: number }>) => response.data,
			invalidatesTags: (result, error, { topics }) => topics.map((t) => ({ type: 'Topic', id: t.topicId }))
		}),
		archiveTopics: builder.mutation<{ success: number; failed: number; message: string }, { topicIds: string[] }>({
			query: (body) => ({
				url: '/topics/batch-archive',
				method: 'PATCH',
				body
			}),
			transformResponse: (response: ApiResponse<{ success: number; failed: number; message: string }>) =>
				response.data,
			invalidatesTags: (result, error, { topicIds }) => topicIds.map((id) => ({ type: 'Topic', id }))
		}),
		getTrendingKeywords: builder.query<TrendingKeyword[], number | void>({
			query: (limit = 10) => `/topics/trending-keywords?limit=${limit}`,
			transformResponse: (response: ApiResponse<TrendingKeyword[]>) => response.data,
			providesTags: ['LibraryStats']
		}),
		getSystemOverviewStats: builder.query<SystemOverviewStats, void>({
			query: () => `/topics/stats/overview-system`,
			transformResponse: (response: ApiResponse<SystemOverviewStats>) => response.data,
			providesTags: ['LibraryStats']
		}),

		getSystemMonthlyStats: builder.query<MonthlyStat[], { months?: number } | void>({
			query: ({ months = 12 } = {}) => `/topics/stats/monthly-system?months=${months}`,
			transformResponse: (response: ApiResponse<MonthlyStat[]>) => response.data,
			providesTags: ['LibraryStats']
		}),

		getSystemMajorDistribution: builder.query<MajorDistribution[], void>({
			query: () => `/topics/stats/majors-system`,
			transformResponse: (response: ApiResponse<MajorDistribution[]>) => response.data,
			providesTags: ['LibraryStats']
		}),
		hideTopic: builder.mutation<{ message: string }, { topicId: string; hide: boolean }>({
			query: ({ topicId, hide }) => ({
				url: `/topics/${topicId}/hide`,
				method: 'PATCH',
				body: { hide }
			}),
			invalidatesTags: ['TopicInLibrary']
		}),

	}),
	overrideExisting: false
})

export const {
	useHideTopicMutation,
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
	useGetYearComboboxQuery,
	useGetDocumentsOfGroupQuery,
	useDownloadTopicFilesZipMutation,
	useFacuBoardApproveTopicsMutation,
	useFacuBoardRejectTopicsMutation,
	useFacuBoardRequestEditTopicMutation,
	useLecturerGetTopicsInPhaseQuery,
	useGetTopicsAwaitingEvaluationInPeriodQuery,
	useGetTopicApprovalRegistrationQuery,
	useGetDetailTopicsInDefenseMilestonesQuery,
	useBatchUpdateDefenseResultsMutation,
	useBatchPublishDefenseResultsMutation,
	useArchiveTopicsMutation,
	useGetAllSubmittedTopicsQuery,
	useGetTrendingKeywordsQuery,
	useGetSystemOverviewStatsQuery,
	useGetSystemMonthlyStatsQuery,
	useGetSystemMajorDistributionQuery,

} = topicApi
