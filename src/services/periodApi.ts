import type { PaginatedResponse } from '@/models'
import {
	type CreateCompletionPhaseDto,
	type CreateExecutionPhaseDto,
	type CreateOpenRegPhaseDto,
	type CreatePeriodDto,
	type CreatePhaseResponse,
	type CreatePhaseSubmitTopicDto,
	type GetCustomMiniPeriodInfoRequestDto,
	type GetCustomPeriodDetailRequestDto,
	type Period,
	type UpdatePeriodPhaseDto
} from '@/models/period.model'
import { type PaginationQueryParamsDto } from '@/models/query-params'
import type { GetStatiticInPeriod } from '@/models/statistic.model'
import { baseApi, type ApiResponse } from '@/services/baseApi'

export const periodApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// lấy tất cả period
		getPeriods: builder.query<PaginatedResponse<Period>, PaginationQueryParamsDto>({
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
		getSubmissionStatus: builder.query<GetCustomPeriodDetailRequestDto, void>({
			query: () => ({
				url: '/periods/get-submission-status',
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<GetCustomPeriodDetailRequestDto>) => response.data
		}),
		//Lấy thông tin của kì hiện tại ở khoa của người dùng
		getCurrentPeriodInfo: builder.query<GetCustomMiniPeriodInfoRequestDto | null, void>({
			query: () => ({
				url: '/periods/current-period/info',
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<GetCustomMiniPeriodInfoRequestDto | null>) => response.data
		}),

		//Lấy thông tin thống kê theo pha trong kì
		lecGetStatsPeriod: builder.query<GetStatiticInPeriod, { periodId: string; phase: string }>({
			query: ({ periodId, phase }) => {
				return `/periods/${periodId}/faculty-board/stats?phase=${phase}`
			},
			transformResponse: (response: ApiResponse<GetStatiticInPeriod>) => response.data
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
	useGetSubmissionStatusQuery,
	useGetCurrentPeriodInfoQuery,
	useLecGetStatsPeriodQuery
} = periodApi
