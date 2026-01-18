import type {
	AddTopicToCouncilPayload,
	AddMultipleTopicsToCouncilPayload,
	CreateDefenseCouncilPayload,
	QueryDefenseCouncilsParams,
	ResDefenseCouncil,
	ResponseDefenseCouncil,
	UpdateTopicMembersPayload,
	ScorePayload
} from '@/models/defenseCouncil.model'
import { baseApi, type ApiResponse } from './baseApi'
import { buildQueryString } from '@/models/query-params'
import type {
	DetailedCriterionScore,
	DraftScoreResponse,
	EvaluationTemplate,
	SaveDraftScoreDto,
	SubmitDetailedScoreDto,
	MyScoreResponse,
	ScoreState
} from '@/models/criterion.models'

export const defenseCouncilApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getCouncils: builder.query<ResponseDefenseCouncil, QueryDefenseCouncilsParams>({
			query: (params) => ({
				url: `/defense-councils?${buildQueryString(params)}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ResponseDefenseCouncil>) => response.data,
			providesTags: (result, error, args) => [
				{ type: 'defenseCouncilsInMilestone', id: args.milestoneTemplateId }
			]
		}),
		createCouncil: builder.mutation<ApiResponse<any>, CreateDefenseCouncilPayload>({
			query: (body) => ({
				url: '/defense-councils',
				method: 'POST',
				body
			}),
			invalidatesTags: (result, error, args) => [
				{ type: 'defenseCouncilsInMilestone', id: args.milestoneTemplateId }
			]
		}),
		getCouncilById: builder.query<ResDefenseCouncil, string>({
			query: (councilId) => ({
				url: `/defense-councils/${councilId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ResDefenseCouncil>) => response.data,
			providesTags: (_result, _error, councilId) => [{ type: 'DefenseCouncil', id: councilId }]
		}),
		addTopicToCouncil: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; payload: AddTopicToCouncilPayload; milestonesTemplateId?: string }
		>({
			query: ({ councilId, payload }) => ({
				url: `/defense-councils/${councilId}/topics`,
				method: 'POST',
				body: payload
			}),
			invalidatesTags: (_result, _error, { councilId, milestonesTemplateId }) => [
				{ type: 'DefenseCouncil', id: councilId },
				{ type: 'defenseCouncilsInMilestone', id: milestonesTemplateId },
				{ type: 'AwaitingTopicsInDefensemilestone', id: milestonesTemplateId }
			]
		}),
		addMultipleTopicsToCouncil: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; payload: AddMultipleTopicsToCouncilPayload; milestonesTemplateId?: string }
		>({
			query: ({ councilId, payload }) => ({
				url: `/defense-councils/${councilId}/topics/batch`,
				method: 'POST',
				body: payload
			}),
			invalidatesTags: (_result, _error, { councilId, milestonesTemplateId }) => [
				{ type: 'DefenseCouncil', id: councilId },
				{ type: 'QuickDetailCouncil', id: councilId },
				{ type: 'defenseCouncilsInMilestone', id: milestonesTemplateId },
				{ type: 'AwaitingTopicsInDefensemilestone', id: milestonesTemplateId }
			]
		}),
		removeTopicFromCouncil: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; topicId: string; milestonesTemplateId?: string }
		>({
			query: ({ councilId, topicId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_result, _error, { councilId, milestonesTemplateId }) => [
				{ type: 'DefenseCouncil', id: councilId },
				{ type: 'defenseCouncilsInMilestone', id: milestonesTemplateId },
				{ type: 'AwaitingTopicsInDefensemilestone', id: milestonesTemplateId }
			]
		}),
		updateTopicMembers: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; topicId: string; payload: UpdateTopicMembersPayload }
		>({
			query: ({ councilId, topicId, payload }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/members`,
				method: 'PATCH',
				body: payload
			}),
			invalidatesTags: (_result, _error, { councilId }) => [
				{ type: 'Theses', id: councilId },
				{ type: 'QuickDetailCouncil', id: councilId }
			]
		}),
		updateTopicOrder: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; topicId: string; defenseOrder: number }
		>({
			query: ({ councilId, topicId, defenseOrder }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/order`,
				method: 'PATCH',
				body: { defenseOrder }
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'DefenseCouncil', id: councilId }]
		}),
		getDetailScoringDefenseCouncil: builder.query<ResDefenseCouncil, string>({
			query: (councilId) => ({
				url: `/defense-councils/detail-scoring-council/${councilId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ResDefenseCouncil>) => response.data,
			providesTags: (result, error, args) => [{ type: 'QuickDetailCouncil', id: args }]
		}),

		// === NEW SCORING ENDPOINTS ===

		// Thư ký nhập điểm cho đề tài
		submitTopicScores: builder.mutation<
			ApiResponse<ResDefenseCouncil>,
			{ councilId: string; topicId: string; scores: ScorePayload[] }
		>({
			query: ({ councilId, topicId, scores }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/submit-scores`,
				method: 'POST',
				body: { scores }
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'DefenseCouncil', id: councilId }]
		}),

		// Khóa điểm một đề tài
		lockTopicScores: builder.mutation<ApiResponse<ResDefenseCouncil>, { councilId: string; topicId: string }>({
			query: ({ councilId, topicId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/lock`,
				method: 'POST'
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'DefenseCouncil', id: councilId }]
		}),

		// Mở khóa điểm một đề tài (BCN)
		unlockTopicScores: builder.mutation<ApiResponse<ResDefenseCouncil>, { councilId: string; topicId: string }>({
			query: ({ councilId, topicId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/unlock`,
				method: 'POST'
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'DefenseCouncil', id: councilId }]
		}),

		// Khóa hội đồng với validation
		completeCouncilWithValidation: builder.mutation<ApiResponse<ResDefenseCouncil>, string>({
			query: (councilId) => ({
				url: `/defense-councils/${councilId}/complete-with-validation`,
				method: 'POST'
			}),
			invalidatesTags: (_result, _error, councilId) => [
				{ type: 'DefenseCouncil', id: councilId },
				{ type: 'defenseCouncilsInMilestone', id: 'LIST' }
			]
		}),

		// Công bố điểm
		publishCouncilScores: builder.mutation<ApiResponse<ResDefenseCouncil>, string>({
			query: (councilId) => ({
				url: `/defense-councils/${councilId}/publish-scores`,
				method: 'POST'
			}),
			invalidatesTags: (_result, _error, councilId) => [
				{ type: 'DefenseCouncil', id: councilId },
				{ type: 'defenseCouncilsInMilestone', id: 'LIST' }
			]
		}),

		// Import điểm từ Excel
		importScores: builder.mutation<
			ApiResponse<{ successCount: number; totalCount: number; errorCount: number; errors: string[] }>,
			{ councilId: string; data: any[] }
		>({
			query: ({ councilId, data }) => ({
				url: `/defense-councils/${councilId}/import-scores`,
				method: 'POST',
				body: { data }
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'DefenseCouncil', id: councilId }]
		}),

		// Tải template Excel
		exportScoresTemplate: builder.query<Blob, { councilId: string; includeScores?: boolean }>({
			query: ({ councilId, includeScores = false }) => ({
				url: `/defense-councils/${councilId}/export-scores-template?includeScores=${includeScores}`,
				method: 'GET',
				responseHandler: (response) => response.blob()
			})
		}),

		// Export PDF báo cáo
		exportPdfReport: builder.query<Blob, string>({
			query: (councilId) => ({
				url: `/defense-councils/${councilId}/export-pdf-report`,
				method: 'GET',
				responseHandler: (response) => response.blob()
			})
		}),

		// Export PDF phiếu điểm
		exportScoreCardPdf: builder.query<Blob, { councilId: string; topicId: string }>({
			query: ({ councilId, topicId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/score-card-pdf`,
				method: 'GET',
				responseHandler: (response) => response.blob()
			})
		}),

		// Export PDF phiếu đánh giá chi tiết
		exportEvaluationFormPdf: builder.query<Blob, { councilId: string; topicId: string }>({
			query: ({ councilId, topicId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/evaluation-form-pdf`,
				method: 'GET',
				responseHandler: (response) => response.blob()
			})
		}),

		// Cập nhật ý kiến hội đồng
		updateCouncilComments: builder.mutation<ApiResponse<any>, { councilId: string; councilComments: string }>({
			query: ({ councilId, councilComments }) => ({
				url: `/defense-councils/${councilId}/comments`,
				method: 'PATCH',
				body: { councilComments }
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'DefenseCouncil', id: councilId }]
		}),

		// Export PDF biên bản hội đồng
		exportCouncilMinutesPdf: builder.query<Blob, { councilId: string; topicId: string }>({
			query: ({ councilId, topicId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/council-minutes-pdf`,
				method: 'GET',
				responseHandler: (response) => response.blob()
			})
		}),

		// Lấy analytics
		getCouncilAnalytics: builder.query<any, string>({
			query: (councilId) => ({
				url: `/defense-councils/${councilId}/analytics`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<any>) => response.data
		}),

		// === EVALUATION TEMPLATE & DETAILED SCORING ===

		// Lấy evaluation template theo councilId (từ councilData.evaluationTemplateId)
		getEvaluationTemplate: builder.query<EvaluationTemplate, string>({
			query: (templateId) => ({
				url: `/evaluation-templates/${templateId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<EvaluationTemplate>) => response.data,
			providesTags: (_result, _error, templateId) => [{ type: 'EvaluationTemplate', id: templateId }]
		}),

		// Lưu draft scores (auto-save, không invalidate tags)
		saveDraftScores: builder.mutation<
			ApiResponse<DraftScoreResponse>,
			{ councilId: string; topicId: string; payload: SaveDraftScoreDto }
		>({
			query: ({ councilId, topicId, payload }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/draft-scores`,
				method: 'POST',
				body: payload
			})
			// Không invalidate tags để tránh refetch nhiều lần khi auto-save
		}),

		// Load draft của user hiện tại
		getMyDraft: builder.query<
			DraftScoreResponse | null,
			{ councilId: string; topicId: string; studentId?: string }
		>({
			query: ({ councilId, topicId, studentId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/my-draft${studentId ? `?studentId=${studentId}` : ''}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<DraftScoreResponse | null>) => response.data,
			providesTags: (_result, _error, { councilId, topicId }) => [
				{ type: 'DraftScore', id: `${councilId}_${topicId}` }
			]
		}),

		// Submit detailed scores (final submission)
		submitDetailedScores: builder.mutation<
			ApiResponse<ResDefenseCouncil>,
			{ councilId: string; topicId: string; payload: SubmitDetailedScoreDto }
		>({
			query: ({ councilId, topicId, payload }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/submit-detailed-scores`,
				method: 'POST',
				body: payload
			}),
			invalidatesTags: (_result, _error, { councilId, topicId }) => [
				{ type: 'DefenseCouncil', id: councilId },
				{ type: 'DraftScore', id: `${councilId}_${topicId}` }
			]
		}),
		//lấy điểm mà người dùng đã chấm cho đề tài trong council
		// Xóa draft (discard)
		deleteDraft: builder.mutation<ApiResponse<void>, { councilId: string; topicId: string; studentId?: string }>({
			query: ({ councilId, topicId, studentId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/draft-scores${studentId ? `?studentId=${studentId}` : ''}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_result, _error, { councilId, topicId }) => [
				{ type: 'DraftScore', id: `${councilId}_${topicId}` }
			]
		}),

		// Lấy điểm mà user đã chấm (trả về array of student scores)
		getMyScoreForTopic: builder.query<MyScoreResponse, { councilId: string; topicId: string }>({
			query: ({ councilId, topicId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/my-score`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<MyScoreResponse>) => response.data,
			providesTags: (_result, _error, { councilId }) => [{ type: 'DefenseCouncil', id: councilId }]
		})
	}),
	overrideExisting: false
})

export const {
	useGetCouncilsQuery,
	useCreateCouncilMutation,
	useGetCouncilByIdQuery,
	useAddTopicToCouncilMutation,
	useAddMultipleTopicsToCouncilMutation,
	useRemoveTopicFromCouncilMutation,
	useUpdateTopicMembersMutation,
	useUpdateTopicOrderMutation,
	useGetDetailScoringDefenseCouncilQuery,
	// New hooks
	useSubmitTopicScoresMutation,
	useLockTopicScoresMutation,
	useUnlockTopicScoresMutation,
	useCompleteCouncilWithValidationMutation,
	usePublishCouncilScoresMutation,
	useImportScoresMutation,
	useLazyExportScoresTemplateQuery,
	useLazyExportPdfReportQuery,
	useLazyExportScoreCardPdfQuery,
	useLazyExportEvaluationFormPdfQuery,
	useExportEvaluationFormPdfQuery,
	useLazyExportCouncilMinutesPdfQuery,
	useUpdateCouncilCommentsMutation,
	useGetCouncilAnalyticsQuery,
	// Evaluation template & detailed scoring hooks
	useGetEvaluationTemplateQuery,
	useSaveDraftScoresMutation,
	useGetMyDraftQuery,
	useLazyGetMyDraftQuery,
	useSubmitDetailedScoresMutation,
	useDeleteDraftMutation,
	useGetMyScoreForTopicQuery,
	useLazyGetMyScoreForTopicQuery
} = defenseCouncilApi
