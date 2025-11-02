import type { GetChatbotVerDto } from '@/models/chatbot-version'
import { baseApi, type ApiResponse } from './baseApi'

export const chatbotApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getChatbotVersion: builder.query<GetChatbotVerDto, void>({
			query: () => `/chatbot/get-chatbot-version`,
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data
		})
	}),
	overrideExisting: false
})
export const { useGetChatbotVersionQuery } = chatbotApi
