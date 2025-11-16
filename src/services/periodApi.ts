import type { PeriodBackend, PeriodPhase } from '@/models/period'
import { baseApi, type ApiResponse } from '@/services/baseApi'

export const periodApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Lấy detail kì đăng ký
		getPeriodDetail: builder.query<PeriodBackend, string>({
			query: (id) => `/detail-period/${id}`,

			// RTK Query trả về ApiResponse<T>, cần unwrap data.data
			transformResponse: (response: ApiResponse<PeriodBackend>) => response.data,

			providesTags: (result, error, id) =>
				result ? [{ type: 'PeriodDetail', id }] : [{ type: 'PeriodDetail', id: 'LIST' }]
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
		})
	})
})

export const {
	useGetPeriodDetailQuery,
	useCreateSubmitTopicPhaseMutation,
	useCreateOpenRegPhaseMutation,
	useCreateExecutionPhaseMutation,
	useCreateCompletionPhaseMutation
} = periodApi
