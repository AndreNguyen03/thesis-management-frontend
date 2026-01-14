import type { RequestGetTopicsInAdvanceSearch } from '@/models/topicVector.model'
import { baseApi, type ApiResponse } from './baseApi'
import type { PaginatedGeneralTopics, PaginatedTopicsInLibrary } from '@/models'
import { buildQueryString } from '@/models/query-params'

export const topicVectorApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Quản lý chatbot/ thông tin kho tri thức
		advanceSearchRegisteringTopics: builder.query<
			PaginatedGeneralTopics,
			{ periodId: string; queries: RequestGetTopicsInAdvanceSearch }
		>({
			query: ({ periodId, queries }) => {
				const qs = buildQueryString(queries)
				console.log('🔥 query string:', qs)
				return `/topic-search/advance/registering-topics/${periodId}?${qs}`
			},
			transformResponse: (response: ApiResponse<PaginatedGeneralTopics>) => response.data
		}),
		advanceSearchTopicsInLibrary: builder.query<
			PaginatedTopicsInLibrary,
			{ queries: RequestGetTopicsInAdvanceSearch }
		>({
			query: ({ queries }) => {
				const queriesString = buildQueryString(queries)
				return `/topic-search/advance/topics-in-library?${queriesString}`
			},
			transformResponse: (response: ApiResponse<PaginatedTopicsInLibrary>) => response.data,
            providesTags: ['TopicInLibrary']
		}),
	}),
	overrideExisting: false
})

export const { useAdvanceSearchRegisteringTopicsQuery, useAdvanceSearchTopicsInLibraryQuery } = topicVectorApi
