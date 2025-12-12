import { baseApi, type ApiResponse } from './baseApi'
import type { PaginatedGeneralTopics } from '@/models'

export const topicVectorApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Quản lý chatbot/ thông tin kho tri thức
		advanceSearchRegisteringTopics: builder.query<PaginatedGeneralTopics, void>({
			query: () => `/chatbots/chatbot-version/enabled`,
			transformResponse: (response: ApiResponse<PaginatedGeneralTopics>) => response.data
		}),
		advanceSearchTopicsInLibrary: builder.query<PaginatedGeneralTopics, void>({
			query: () => `/knowledge-sources`,
			transformResponse: (response: ApiResponse<PaginatedGeneralTopics>) => response.data
		})
	}),
	overrideExisting: false
})

export const { useAdvanceSearchRegisteringTopicsQuery, useAdvanceSearchTopicsInLibraryQuery } = topicVectorApi
