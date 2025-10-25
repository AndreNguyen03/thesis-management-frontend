import type { Topic } from '../models'
import { baseApi, type ApiResponse } from './baseApi'

export const registrationApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		createRegistration: builder.mutation<ApiResponse<any>, { topicId: string }>({
			query: (body) => ({
				url: `/registrations/register-topic/${body.topicId}`,
				method: 'POST'
			})
		})
	}),
	overrideExisting: false
})
export const { useCreateRegistrationMutation } = registrationApi
