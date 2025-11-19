import { type QueryParams } from '@/components/ui/DataTable/types'
import type { PaginatedResponse } from '@/models'
import {
	type CreatePeriodDto,
	type GetCustomMiniPeriodInfoRequestDto,
	type GetCustomPeriodDetailRequestDto,
	type Period,
	type PeriodBackend,
	type PeriodPhase
} from '@/models/period.model'
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
			transformResponse: (response: ApiResponse<any>) => ({
				data: response.data.data,
				meta: response.data.meta,
				links: response.data.links
			}),
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
			{ message: string },
			{
				periodId: string
				body: PeriodPhase
			}
		>({
			query: ({ periodId, body }) => ({
				url: `/${periodId}/create-submit-topic-phase`,
				method: 'PATCH',
				body
			}),
			invalidatesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),

		// Open Registration Phase
		createOpenRegPhase: builder.mutation<
			{ message: string },
			{
				periodId: string
				body: {
					phase: string
					startTime: Date
					endTime: Date
					allowManualApproval: boolean
				}
			}
		>({
			query: ({ periodId, body }) => ({
				url: `/${periodId}/create-open-reg-phase`,
				method: 'PATCH',
				body
			}),
			invalidatesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),

		// Execution Phase
		createExecutionPhase: builder.mutation<
			{ message: string },
			{
				periodId: string
				body: {
					phase: string
					startTime: Date
					endTime: Date
					allowManualApproval: boolean
				}
			}
		>({
			query: ({ periodId, body }) => ({
				url: `/${periodId}/create-execution-phase`,
				method: 'PATCH',
				body
			}),
			invalidatesTags: (result, error, { periodId }) => [{ type: 'PeriodDetail', id: periodId }]
		}),

		// Completion Phase
		createCompletionPhase: builder.mutation<
			{ message: string },
			{
				periodId: string
				body: {
					phase: string
					startTime: Date
					endTime: Date
					allowManualApproval: boolean
				}
			}
		>({
			query: ({ periodId, body }) => ({
				url: `/${periodId}/create-completion-phase`,
				method: 'PATCH',
				body
			}),
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
	useGetCurrentPeriodInfoQuery
} = periodApi
