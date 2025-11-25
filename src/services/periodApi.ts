import { type QueryParams } from '@/components/ui/DataTable/types'
import type { PaginatedResponse } from '@/models'
import {
	type CompletionPhaseStatistics,
	type CreateCompletionPhaseDto,
	type CreateExecutionPhaseDto,
	type CreateOpenRegPhaseDto,
	type CreatePeriodDto,
	type CreatePhaseResponse,
	type CreatePhaseSubmitTopicDto,
	type ExecutionPhaseStatistics,
	type LecCompletionPhaseStatistics,
	type LecExecutionPhaseStatistics,
	type LecOpenRegistrationPhaseStatistics,
	type LecSubmitTopicPhaseStatistics,
	type OpenRegistrationPhaseStatistics,
	type Period,
	type PeriodBackend,
	type SubmitTopicPhaseStatistics,
	type UpdatePeriodPhaseDto
} from '@/models/period'
import type { Topic } from '@/models/topic'
import { baseApi, type ApiResponse } from '@/services/baseApi'

export const periodApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// lấy tất cả period
		getPeriods: builder.query<PaginatedResponse<Period>, QueryParams>({
			query: (params) => {
				const queryString = new URLSearchParams(
					Object.entries(params).reduce(
						(acc, [key, value]) => {
							if (value !== undefined && value !== null && value !== '') {
								acc[key] = String(value)
							}
							return acc
						},
						{} as Record<string, string>
					)
				).toString()

				return {
					url: `/periods/get-all?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedResponse<Period>>) => response.data,
			providesTags: ['Periods']
		}),

		// Lấy detail kì đăng ký
		getPeriodDetail: builder.query<PeriodBackend, string>({
			query: (id) => `/periods/detail-period/${id}`,

			// RTK Query trả về ApiResponse<T>, cần unwrap data.data
			transformResponse: (response: ApiResponse<PeriodBackend>) => response.data,

			providesTags: (result, error, id) =>
				result ? [{ type: 'PeriodDetail', id }] : [{ type: 'PeriodDetail', id: 'LIST' }]
		}),

		createPeriod: builder.mutation<{ message: string }, CreatePeriodDto>({
			query: (body) => ({
				url: '/periods',
				method: 'POST',
				body
			}),
			transformResponse: (response: ApiResponse<{ message: string }>) => response.data,
			invalidatesTags: ['Periods']
		}),

		deletePeriod: builder.mutation<{ message: string }, string>({
			query: (id) => ({
				url: `/periods/delete-period/${id}`,
				method: 'DELETE'
			}),
			transformResponse: (response: ApiResponse<{ message: string }>) => response.data,
			invalidatesTags: ['Periods']
		}),

		// Submit Topic Phase
		createSubmitTopicPhase: builder.mutation<
			CreatePhaseResponse,
			{ periodId: string; body: CreatePhaseSubmitTopicDto; force?: boolean }
		>({
			query: ({ periodId, body, force }) => ({
				url: `periods/${periodId}/create-submit-topic-phase${force ? '?force=true' : ''}`,
				method: 'PATCH',
				body
			}),
			transformResponse: (response: ApiResponse<CreatePhaseResponse>) => response.data,
			invalidatesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),

		// --- Tạo pha thực hiện đề tài ---
		createExecutionPhase: builder.mutation<
			CreatePhaseResponse,
			{ periodId: string; body: CreateExecutionPhaseDto; force?: boolean }
		>({
			query: ({ periodId, body, force }) => ({
				url: `periods/${periodId}/create-execution-phase${force ? '?force=true' : ''}`,
				method: 'PATCH',
				body
			}),
			transformResponse: (response: ApiResponse<CreatePhaseResponse>) => response.data,
			invalidatesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),

		// --- Tạo pha mở đăng ký ---
		createOpenRegPhase: builder.mutation<
			CreatePhaseResponse,
			{ periodId: string; body: CreateOpenRegPhaseDto; force?: boolean }
		>({
			query: ({ periodId, body, force }) => ({
				url: `periods/${periodId}/create-open-reg-phase${force ? '?force=true' : ''}`,
				method: 'PATCH',
				body
			}),
			transformResponse: (response: ApiResponse<CreatePhaseResponse>) => response.data,
			invalidatesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),

		// --- Tạo pha hoàn thành ---
		createCompletionPhase: builder.mutation<
			CreatePhaseResponse,
			{ periodId: string; body: CreateCompletionPhaseDto }
		>({
			query: ({ periodId, body }) => ({
				url: `periods/${periodId}/create-completion-phase`,
				method: 'PATCH',
				body
			}),
			transformResponse: (response: ApiResponse<CreatePhaseResponse>) => response.data,
			invalidatesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),

		updatePhase: builder.mutation<
			{ message: string },
			{ periodId: string; phaseId: string; body: UpdatePeriodPhaseDto }
		>({
			query: ({ periodId, phaseId, body }) => ({
				url: `periods/${periodId}/update-phase/${phaseId}`,
				method: 'PATCH',
				body
			}),
			transformResponse: (response: ApiResponse<{ message: string }>) => response.data,
			invalidatesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),

		// --- Lấy topics trong period ---
		getTopicsInPeriod: builder.query<PaginatedResponse<Topic>, { periodId: string; query?: QueryParams }>({
			query: ({ periodId, query }) => {
				const queryString = new URLSearchParams(
					Object.entries(query ?? {}).reduce(
						(acc, [key, value]) => {
							if (value !== undefined && value !== null && value !== '') {
								acc[key] = String(value)
							}
							return acc
						},
						{} as Record<string, string>
					)
				).toString()

				return {
					url: `/periods/get-topics-in-period/${periodId}${queryString ? `?${queryString}` : ''}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedResponse<Topic>>) => response.data,
			providesTags: (result, error, { periodId }) => [{ type: 'PeriodTopics', id: periodId }]
		}),

		// --- Lấy topics trong phase ---
		getTopicsInPhase: builder.query<PaginatedResponse<Topic>, { phaseId: string; query?: QueryParams }>({
			query: ({ phaseId, query }) => {
				const queryString = new URLSearchParams(
					Object.entries(query ?? {}).reduce(
						(acc, [key, value]) => {
							if (value !== undefined && value !== null && value !== '') {
								acc[key] = String(value)
							}
							return acc
						},
						{} as Record<string, string>
					)
				).toString()

				return {
					url: `/periods/get-topics-in-phase/${phaseId}${queryString ? `?${queryString}` : ''}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedResponse<Topic>>) => response.data,
			providesTags: (result, error, { phaseId }) => [{ type: 'PhaseTopics' as const, id: phaseId }]
		}),

		getStatisticsSubmitTopicPhase: builder.query<SubmitTopicPhaseStatistics, string>({
			query: (periodId) => `periods/${periodId}/faculty-board/submit-topic-phase/statistics`,
			transformResponse: (response: ApiResponse<SubmitTopicPhaseStatistics>) => response.data
		}),
		getStatisticsOpenRegistrationPhase: builder.query<OpenRegistrationPhaseStatistics, string>({
			query: (periodId) => `periods/${periodId}/faculty-board/open-registration-phase/statistics`,
			transformResponse: (response: ApiResponse<OpenRegistrationPhaseStatistics>) => response.data
		}),
		getStatisticsExecutionPhase: builder.query<ExecutionPhaseStatistics, string>({
			query: (periodId) => `periods/${periodId}/faculty-board/execution-phase/statistics`,
			transformResponse: (response: ApiResponse<ExecutionPhaseStatistics>) => response.data
		}),
		getStatisticsCompletionPhase: builder.query<CompletionPhaseStatistics, string>({
			query: (periodId) => `periods/${periodId}/faculty-board/completion-phase/statistics`,
			transformResponse: (response: ApiResponse<CompletionPhaseStatistics>) => response.data
		}),

		// === LECTURER STATISTICS ===
		lecturerGetStatisticsSubmitTopicPhase: builder.query<LecSubmitTopicPhaseStatistics, string>({
			query: (periodId) => `periods/${periodId}/lecturer/submit-topic-phases/statistics`,
			transformResponse: (response: ApiResponse<LecSubmitTopicPhaseStatistics>) => response.data
		}),
		lecturerGetStatisticsOpenRegistrationPhase: builder.query<LecOpenRegistrationPhaseStatistics, string>({
			query: (periodId) => `periods/${periodId}/lecturer/open-registration-phases/statistics`,
			transformResponse: (response: ApiResponse<LecOpenRegistrationPhaseStatistics>) => response.data
		}),
		lecturerGetStatisticsExecutionPhase: builder.query<LecExecutionPhaseStatistics, string>({
			query: (periodId) => `periods/${periodId}/lecturer/execution-phases/statistics`,
			transformResponse: (response: ApiResponse<LecExecutionPhaseStatistics>) => response.data
		}),
		lecturerGetStatisticsCompletionPhase: builder.query<LecCompletionPhaseStatistics, string>({
			query: (periodId) => `periods/${periodId}/lecturer/completion-phases/statistics`,
			transformResponse: (response: ApiResponse<LecCompletionPhaseStatistics>) => response.data
		})
	})
})

export const {
	useGetPeriodDetailQuery,
	useCreateSubmitTopicPhaseMutation,
	useCreateOpenRegPhaseMutation,
	useCreateExecutionPhaseMutation,
	useCreateCompletionPhaseMutation,
	useDeletePeriodMutation,
	useGetPeriodsQuery,
	useCreatePeriodMutation,
	useGetStatisticsSubmitTopicPhaseQuery,
	useGetStatisticsOpenRegistrationPhaseQuery,
	useGetStatisticsExecutionPhaseQuery,
	useGetStatisticsCompletionPhaseQuery,
	useLecturerGetStatisticsSubmitTopicPhaseQuery,
	useLecturerGetStatisticsOpenRegistrationPhaseQuery,
	useLecturerGetStatisticsExecutionPhaseQuery,
	useLecturerGetStatisticsCompletionPhaseQuery,
    useUpdatePhaseMutation,
    useGetTopicsInPeriodQuery,
    useGetTopicsInPhaseQuery
} = periodApi
