/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PaginatedStudentRegistration, QueryReplyRegistration } from '@/models'
import { baseApi, type ApiResponse } from './baseApi'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'

export const registrationApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		assignLecturerToTopic: builder.mutation<
			ApiResponse<{ message: string }>,
			{ topicId: string; lecturerId: string }
		>({
			query: ({ topicId, lecturerId }) => ({
				url: `/registrations/assign-lecturer/${lecturerId}/in/${topicId}`,
				method: 'POST'
			})
		}),
		unassignLecturerFromTopic: builder.mutation<
			ApiResponse<{ message: string }>,
			{ lecturerId: string; topicId: string }
		>({
			query: ({ lecturerId, topicId }) => ({
				url: `/registrations/unassign-lecturer/${lecturerId}/in/${topicId}`,
				method: 'DELETE'
			})
		}),
		assignStudentToTopic: builder.mutation<
			ApiResponse<{ message: string }>,
			{ topicId: string; studentId: string }
		>({
			query: ({ topicId, studentId }) => ({
				url: `/registrations/assign-student/${studentId}/in/${topicId}`,
				method: 'POST'
			})
		}),
		createRegistration: builder.mutation<ApiResponse<any>, { topicId: string }>({
			query: (body) => ({
				url: `/registrations/student-register-topic/${body.topicId}`,
				method: 'POST'
			})
		}),
		leaveTopic: builder.mutation<ApiResponse<any>, { topicId: string }>({
			query: (body) => ({
				url: `/registrations/leave-registration/${body.topicId}`,
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
		}),
		unassignStudentFromTopic: builder.mutation<
			ApiResponse<{ message: string }>,
			{ studentId: string; topicId: string }
		>({
			query: ({ studentId, topicId }) => ({
				url: `/registrations/unassign-student/${studentId}/in/${topicId}`,
				method: 'DELETE'
			})
		})
	}),
	overrideExisting: false
})
export const {
	useAssignLecturerToTopicMutation,
	useAssignStudentToTopicMutation,
	useCreateRegistrationMutation,
	useLeaveTopicMutation,
	useGetRegistrationsHistoryQuery,
	useReplyRegistrationMutation,
	useUnassignLecturerFromTopicMutation,
	useUnassignStudentFromTopicMutation
} = registrationApi
