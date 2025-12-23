import type { TopicInteractionRequest } from '@/models/topic-interaction.model'
import { baseApi, type ApiResponse } from './baseApi'

export const topicInteractinApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		logTopicInteraction: builder.mutation<ApiResponse<void>, TopicInteractionRequest>({
			query: (body) => ({
				url: '/topic-interaction',
				method: 'POST',
				body
			})
		})
	}),
	overrideExisting: false
})
export const { useLogTopicInteractionMutation } = topicInteractinApi
