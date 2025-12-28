import type { PaginatedResponse } from '@/models'
import type { Phase1Response, Phase2Response, Phase3Response } from '@/models/period-phase.models'
import {
	type CreateCompletionPhaseDto,
	type CreateExecutionPhaseDto,
	type CreateOpenRegPhaseDto,
	type CreatePeriodPayload,
	type CreatePhaseResponse,
	type CreatePhaseSubmitTopicDto,
	type GetCurrentPeriod,
	type GetDashboardCurrentPeriod,
	type PaginationPeriodQueryParams,
	type Period,
	type UpdatePeriodDto,
	type UpdatePeriodPhaseDto
} from '@/models/period.model'
import { buildQueryString } from '@/models/query-params'
import type { GetStatiticInPeriod } from '@/models/statistic.model'
import { baseApi, type ApiResponse } from '@/services/baseApi'

export const periodApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// lấy tất cả period
		getPeriods: builder.query<PaginatedResponse<Period>, PaginationPeriodQueryParams>({
			query: (params) => {
				const queryString = buildQueryString(params)
				return {
					url: `/periods/get-all?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<any>) => ({
				data: response.data.data,
				meta: response.data.meta,
				links: response.data.links
			}),
			providesTags: ['Periods']
		}),

		// Lấy detail kì đăng ký
		getPeriodDetail: builder.query<Period, string>({
			query: (id) => `/periods/detail-period/${id}`,

			// RTK Query trả về ApiResponse<T>, cần unwrap data.data
			transformResponse: (response: ApiResponse<Period>) => response.data,

			providesTags: (result, error, id) =>
				result ? [{ type: 'PeriodDetail', id }] : [{ type: 'PeriodDetail', id: 'LIST' }]
		}),

		createPeriod: builder.mutation<{ message: string }, CreatePeriodPayload>({
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
				url: `periods/${periodId}/config-submit-topic-phase${force ? '?force=true' : ''}`,
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
				url: `periods/${periodId}/config-execution-phase${force ? '?force=true' : ''}`,
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
				url: `periods/${periodId}/config-open-reg-phase${force ? '?force=true' : ''}`,
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
				url: `periods/${periodId}/config-completion-phase`,
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

		//getSubmissionStatus

		getCurrentPeriods: builder.query<GetCurrentPeriod[], void>({
			query: () => ({
				url: `/periods/current-periods`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<GetCurrentPeriod[] | null>) =>
				response.data || ([] as GetCurrentPeriod[])
			transformResponse: (response: ApiResponse<GetCurrentPeriod[] | null>) =>
				response.data || ([] as GetCurrentPeriod[])
		}),

		//Lấy thông tin thống kê theo pha trong kì
		lecGetStatsPeriod: builder.query<GetStatiticInPeriod, { periodId: string; phase: string }>({
			query: ({ periodId, phase }) => {
				return `/periods/${periodId}/faculty-board/stats?phase=${phase}`
			},
			transformResponse: (response: ApiResponse<GetStatiticInPeriod>) => response.data
		}),
		resolvePhase: builder.mutation<
			Phase1Response | Phase2Response | Phase3Response,
			{ periodId: string; phase: string }
		>({
			query: ({ periodId, phase }) => ({
				url: `/periods/${periodId}/phases/${phase}/resolve`,
				method: 'POST'
			}),
			transformResponse: (response: ApiResponse<Phase1Response | Phase2Response | Phase3Response>) =>
				response.data,
			invalidatesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),
		adjustPeriod: builder.mutation<Period, { periodId: string; body: UpdatePeriodDto }>({
			query: ({ periodId, body }) => ({
				url: `/periods/adjust-period/${periodId}`,
				method: 'PATCH',
				body
			}),
			transformResponse: (response: ApiResponse<Period>) => response.data,
			invalidatesTags: ['Periods', 'PeriodDetail']
		}),
		completePeriod: builder.mutation<{ message: string }, string>({
			query: (periodId) => ({
				url: `/periods/${periodId}/period-complete`,
				method: 'PATCH'
			}),
			transformResponse: (response: ApiResponse<{ message: string }>) => response.data,
			invalidatesTags: (result, error, periodId) => [{ type: 'PeriodDetail', id: periodId }, 'Periods']
		}),
		getDashboardCurrentPeriod: builder.query<GetDashboardCurrentPeriod, void>({
			query: () => ({
				url: `/periods/dashboard-current-periods`
			}),
			transformResponse: (response: ApiResponse<GetDashboardCurrentPeriod>) => response.data,
            providesTags: ['Periods']
		})
	})
})

export const {
	useResolvePhaseMutation,
	useGetPeriodDetailQuery,
	useCreateSubmitTopicPhaseMutation,
	useCreateOpenRegPhaseMutation,
	useCreateExecutionPhaseMutation,
	useCreateCompletionPhaseMutation,
	useDeletePeriodMutation,
	useGetPeriodsQuery,
	useCreatePeriodMutation,
	useLecGetStatsPeriodQuery,
	useAdjustPeriodMutation,
	useGetCurrentPeriodsQuery,
	useGetDashboardCurrentPeriodQuery,
    useCompletePeriodMutation
} = periodApi
