/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PaginatedStudentRegistration, QueryReplyRegistration } from '@/models'
import { baseApi, type ApiResponse } from './baseApi'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'

export const registrationApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		createRegistration: builder.mutation<ApiResponse<any>, { topicId: string }>({
			query: (body) => ({
				url: `/registrations/student-register-topic/${body.topicId}`,
				method: 'POST'
			})
		}),
		deleteRegistration: builder.mutation<ApiResponse<any>, { topicId: string }>({
			query: (body) => ({
				url: `/registrations/cancel-registration/${body.topicId}`,
				method: 'DELETE'
			})
		}),
		getRegistrationsHistory: builder.query<PaginatedStudentRegistration, { queries: PaginationQueryParamsDto }>({
			query: ({ queries }) => {
				const queryString = buildQueryString(queries)
				return `/registrations/student/history-registrations?${queryString}`
			},
			transformResponse: (response: ApiResponse<PaginatedStudentRegistration>) => response.data
		}),
		replyRegistration: builder.mutation<
			ApiResponse<string>,
			{ registrationId: string; body: QueryReplyRegistration }
		>({
			query: ({ registrationId, body }) => ({
				url: `/registrations/lecturer/reply-registration/${registrationId}`,
				method: 'PATCH',
				body: body
			})
		})
	}),
	overrideExisting: false
})
export const {
	useCreateRegistrationMutation,
	useDeleteRegistrationMutation,
	useGetRegistrationsHistoryQuery,
	useReplyRegistrationMutation
} = registrationApi
