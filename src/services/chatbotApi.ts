import type { GetChatbotVerDto } from '@/models/chatbot-version'
import { baseApi, type ApiResponse } from './baseApi'
import type { GetPaginatedKnowledgeDto, KnowledgeSource } from '@/models/knowledge-source.model'

export const chatbotApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Quản lý chatbot/ thông tin kho tri thức
		getChatbotVersion: builder.query<GetChatbotVerDto, void>({
			query: () => `/chatbots/chatbot-version/enabled`,
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data
		}),
		getKnowledgeSources: builder.query<GetPaginatedKnowledgeDto, void>({
			query: () => `/knowledge-sources`,
			transformResponse: (response: ApiResponse<GetPaginatedKnowledgeDto>) => response.data
		})
	}),
	overrideExisting: false
})
export const { useGetChatbotVersionQuery, useGetKnowledgeSourcesQuery } = chatbotApi
