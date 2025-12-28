import type { GetChatbotVerDto } from '@/models/chatbot-version'
import { baseApi, type ApiResponse } from './baseApi'
import type { GetPaginatedKnowledgeDto } from '@/models/knowledge-source.model'
import type {
	ChatbotResource,
	CreateResourceDto,
	GetPaginatedResourcesDto,
	UpdateResourceDto
} from '@/models/chatbot-resource.model'

export const chatbotApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// ========== Chatbot Config ==========
		getChatbotVersion: builder.query<GetChatbotVerDto, void>({
			query: () => `/chatbots/chatbot-version/enabled`,
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data,
			providesTags: ['ChatbotConfig']
		}),

		updateChatbotVersion: builder.mutation<
			GetChatbotVerDto,
			Partial<Pick<GetChatbotVerDto, 'name' | 'description' | 'status'>>
		>({
			query: (data) => ({
				url: `/chatbots/chatbot-version`,
				method: 'PATCH',
				body: data
			}),
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data,
			invalidatesTags: ['ChatbotConfig']
		}),

		// ========== Knowledge Sources (Legacy) ==========
		getKnowledgeSources: builder.query<GetPaginatedKnowledgeDto, void>({
			query: () => `/knowledge-sources`,
			transformResponse: (response: ApiResponse<GetPaginatedKnowledgeDto>) => response.data,
			providesTags: ['KnowledgeSources']
		}),

		// ========== Resources Management (New) ==========
		getResources: builder.query<
			GetPaginatedResourcesDto,
			{ page?: number; limit?: number; status?: string; type?: string }
		>({
			query: (params) => ({
				url: `/chatbot/resources`,
				params: {
					page: params.page || 1,
					limit: params.limit || 10,
					...(params.status && { status: params.status }),
					...(params.type && { type: params.type })
				}
			}),
			transformResponse: (response: ApiResponse<GetPaginatedResourcesDto>) => response.data,
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ _id }) => ({ type: 'ChatbotResources' as const, id: _id })),
							{ type: 'ChatbotResources', id: 'LIST' }
						]
					: [{ type: 'ChatbotResources', id: 'LIST' }]
		}),

		getResource: builder.query<ChatbotResource, string>({
			query: (id) => `/chatbot/resources/${id}`,
			transformResponse: (response: ApiResponse<ChatbotResource>) => response.data,
			providesTags: (_result, _error, id) => [{ type: 'ChatbotResources', id }]
		}),

		createResource: builder.mutation<ChatbotResource, CreateResourceDto>({
			query: (data) => ({
				url: `/chatbot/resources`,
				method: 'POST',
				body: data
			}),
			transformResponse: (response: ApiResponse<ChatbotResource>) => response.data,
			invalidatesTags: [{ type: 'ChatbotResources', id: 'LIST' }]
		}),

		updateResource: builder.mutation<ChatbotResource, { id: string; data: UpdateResourceDto }>({
			query: ({ id, data }) => ({
				url: `/chatbot/resources/${id}`,
				method: 'PATCH',
				body: data
			}),
			transformResponse: (response: ApiResponse<ChatbotResource>) => response.data,
			invalidatesTags: (_result, _error, { id }) => [
				{ type: 'ChatbotResources', id },
				{ type: 'ChatbotResources', id: 'LIST' }
			]
		}),

		deleteResource: builder.mutation<void, string>({
			query: (id) => ({
				url: `/chatbot/resources/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: 'ChatbotResources', id },
				{ type: 'ChatbotResources', id: 'LIST' }
			]
		}),

		retryResource: builder.mutation<void, string>({
			query: (id) => ({
				url: `/chatbot/resources/${id}/retry`,
				method: 'POST'
			}),
			invalidatesTags: (_result, _error, id) => [
				{ type: 'ChatbotResources', id },
				{ type: 'ChatbotResources', id: 'LIST' }
			]
		}),

		// ========== Query Suggestions ==========
		createQuerySuggestion: builder.mutation<GetChatbotVerDto, { content: string }>({
			query: (data) => ({
				url: `/chatbots/chatbot-version/query-suggestions`,
				method: 'POST',
				body: data
			}),
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data,
			invalidatesTags: ['ChatbotConfig']
		}),

		updateQuerySuggestion: builder.mutation<GetChatbotVerDto, { id: string; content: string; enabled: boolean }>({
			query: ({ id, ...data }) => ({
				url: `/chatbots/chatbot-version/query-suggestions/${id}`,
				method: 'PATCH',
				body: data
			}),
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data,
			invalidatesTags: ['ChatbotConfig']
		}),

		deleteQuerySuggestion: builder.mutation<GetChatbotVerDto, string>({
			query: (id) => ({
				url: `/chatbots/chatbot-version/query-suggestions/${id}`,
				method: 'DELETE'
			}),
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data,
			invalidatesTags: ['ChatbotConfig']
		})
	}),
	overrideExisting: false
})

export const {
	useGetChatbotVersionQuery,
	useUpdateChatbotVersionMutation,
	useGetKnowledgeSourcesQuery,
	useGetResourcesQuery,
	useGetResourceQuery,
	useCreateResourceMutation,
	useUpdateResourceMutation,
	useDeleteResourceMutation,
	useRetryResourceMutation,
	useCreateQuerySuggestionMutation,
	useUpdateQuerySuggestionMutation,
	useDeleteQuerySuggestionMutation
} = chatbotApi
