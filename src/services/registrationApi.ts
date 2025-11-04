/* eslint-disable @typescript-eslint/no-explicit-any */
import { baseApi, type ApiResponse } from './baseApi'

export const registrationApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		createRegistration: builder.mutation<ApiResponse<any>, { topicId: string }>({
			query: (body) => ({
				url: `/registrations/register-topic/${body.topicId}`,
				method: 'POST'
			})
		}),
		deleteRegistration: builder.mutation<ApiResponse<any>, { topicId: string }>({
			query: (body) => ({
				url: `/registrations/cancel-registration/${body.topicId}`,
				method: 'DELETE'
			})
		})
	}),
	overrideExisting: false
})
export const { useCreateRegistrationMutation, useDeleteRegistrationMutation } = registrationApi
