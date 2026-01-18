import type { RequestKnowledgeSourceDto } from '@/models'
import { baseApi, type ApiResponse } from './baseApi'
import type {
	GetPaginatedKnowledgeDto,
	KnowledgeSource,
	UpdateKnowledgeSourcePayload
} from '@/models/knowledge-source.model'
import { buildQueryString } from '@/models/query-params'

export const knowledgeSourceApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// ========== Knowledge Sources Management ==========
		getKnowledgeSources: builder.query<GetPaginatedKnowledgeDto, { queries: RequestKnowledgeSourceDto }>({
			query: ({ queries }) => {
				const queryString = buildQueryString(queries)
				return `/knowledge-sources?${queryString}`
			},
			transformResponse: (response: ApiResponse<GetPaginatedKnowledgeDto>) => response.data,
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ _id }) => ({ type: 'KnowledgeSources' as const, id: _id })),
							{ type: 'KnowledgeSources', id: 'LIST' }
						]
					: [{ type: 'KnowledgeSources', id: 'LIST' }]
		}),

		getKnowledgeSourceById: builder.query<KnowledgeSource, string>({
			query: (id) => `/knowledge-sources/${id}`,
			transformResponse: (response: ApiResponse<KnowledgeSource>) => response.data,
			providesTags: (_result, _error, id) => [{ type: 'KnowledgeSources', id }]
		}),

		uploadKnowledgeFile: builder.mutation<KnowledgeSource, FormData>({
			query: (formData) => ({
				url: `/knowledge-sources/upload-files`,
				method: 'POST',
				body: formData
			}),
			transformResponse: (response: ApiResponse<KnowledgeSource>) => response.data,
			invalidatesTags: [{ type: 'KnowledgeSources', id: 'LIST' }]
		}),

		updateKnowledgeChunks: builder.mutation<KnowledgeSource, { id: string; formData: FormData }>({
			query: ({ id, formData }) => ({
				url: `/knowledge-sources/${id}/knowledge-chunks`,
				method: 'PATCH',
				body: formData
			}),
			transformResponse: (response: ApiResponse<KnowledgeSource>) => response.data,
			invalidatesTags: (_result, _error, { id }) => [
				{ type: 'KnowledgeSources', id },
				{ type: 'KnowledgeSources', id: 'LIST' }
			]
		}),

		updateKnowledgeSource: builder.mutation<KnowledgeSource, { id: string; data: UpdateKnowledgeSourcePayload }>({
			query: ({ id, data }) => ({
				url: `/knowledge-sources/${id}`,
				method: 'PATCH',
				body: data
			}),
			transformResponse: (response: ApiResponse<KnowledgeSource>) => response.data,
			invalidatesTags: (_result, _error, { id }) => [
				{ type: 'KnowledgeSources', id },
				{ type: 'KnowledgeSources', id: 'LIST' }
			]
		}),

		deleteKnowledgeSource: builder.mutation<void, string>({
			query: (id) => ({
				url: `/knowledge-sources/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: 'KnowledgeSources', id },
				{ type: 'KnowledgeSources', id: 'LIST' }
			]
		}),

		semanticSearchKnowledgeSources: builder.query<KnowledgeSource[], string>({
			query: (query) => ({
				url: `/knowledge-sources/search-semantic`,
				params: { query }
			}),
			transformResponse: (response: ApiResponse<KnowledgeSource[]>) => response.data
		}),

		syncTopicsToKnowledgeSource: builder.mutation<{ message: string }, { periodId: string }>({
			query: (body) => ({
				url: `/knowledge-sources/sync-topics-to-knowledge-source`,
				method: 'POST',
				body
			}),
			invalidatesTags: [{ type: 'KnowledgeSources', id: 'LIST' }]
		}),

		syncLecturerProfiles: builder.mutation<{ message: string }, void>({
			query: () => ({
				url: `/knowledge-sources/sync-lecturer-profiles`,
				method: 'POST'
			}),
			invalidatesTags: [{ type: 'KnowledgeSources', id: 'LIST' }]
		}),

		crawlUrl: builder.mutation<
			{ message: string; knowledgeSourceId: string },
			{ url: string; name: string; description?: string }
		>({
			query: (body) => ({
				url: `/knowledge-sources/crawl-url`,
				method: 'POST',
				body
			}),
			invalidatesTags: [{ type: 'KnowledgeSources', id: 'LIST' }]
		})
	}),
	overrideExisting: false
})

export const {
	useGetKnowledgeSourcesQuery,
	useGetKnowledgeSourceByIdQuery,
	useUploadKnowledgeFileMutation,
	useUpdateKnowledgeChunksMutation,
	useUpdateKnowledgeSourceMutation,
	useDeleteKnowledgeSourceMutation,
	useLazySemanticSearchKnowledgeSourcesQuery,
	useSyncRegisteringTopicsToKnowledgeSourceMutation,
    useSyncTopicsInLibraryToKnowledgeSourceMutation,
	useSyncLecturerProfilesMutation,
	useCrawlUrlMutation
} = knowledgeSourceApi
