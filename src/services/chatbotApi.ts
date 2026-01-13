import type { GetChatbotVerDto } from '@/models/chatbot-version'
import { baseApi, type ApiResponse } from './baseApi'
import type { GenerateTopicResponse, ApplyGeneratedResponse } from '@/models/chatbot-ai.model'
import type { GetPaginatedKnowledgeDto } from '@/models/knowledge-source.model'
import type {
	ChatbotResource,
	CreateResourceDto,
	GetPaginatedResourcesDto,
	PayloadSuggestion,
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
			{ updatePayload: Partial<Pick<GetChatbotVerDto, 'name' | 'description' | 'status'>>; id: string }
		>({
			query: ({ updatePayload, id }) => ({
				url: `/chatbots/update-chatbot-version/${id}`,
				method: 'PATCH',
				body: updatePayload
			}),
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data,
			invalidatesTags: ['ChatbotConfig']
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
		createQuerySuggestion: builder.mutation<
			GetChatbotVerDto,
			{ suggestions: PayloadSuggestion[]; chatbotVersionId: string }
		>({
			query: ({ suggestions, chatbotVersionId }) => ({
				url: `/chatbots/chatbot-version/${chatbotVersionId}/query-suggestions`,
				method: 'POST',
				body: { suggestions }
			}),
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data,
			invalidatesTags: ['ChatbotConfig']
		}),

		updateQuerySuggestion: builder.mutation<
			GetChatbotVerDto,
			{ id: string; suggestionId: string; content: string }
		>({
			query: ({ id, suggestionId, content }) => ({
				url: `/chatbots/chatbot-version/${id}/query-suggestions/${suggestionId}`,
				method: 'PATCH',
				body: {
					newContent: content
				}
			}),
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data,
			invalidatesTags: ['ChatbotConfig']
		}),
		deleteQuerySuggestions: builder.mutation<GetChatbotVerDto, { id: string; suggestionIds: string[] }>({
			query: ({ id, suggestionIds }) => ({
				url: `/chatbots/chatbot-version/${id}/query-suggestions`,
				method: 'DELETE',
				body: { suggestionIds }
			}),
			transformResponse: (response: ApiResponse<GetChatbotVerDto>) => response.data,
			invalidatesTags: ['ChatbotConfig']
		}),

		// ========== Topic generation (AI) ==========
		generateTopic: builder.mutation<GenerateTopicResponse, { prompt: string; limit?: number }>({
			query: (body) => ({ url: `/chatbots/generate-topic`, method: 'POST', body }),
			transformResponse: (response: ApiResponse<GenerateTopicResponse>) => response.data
		}),

		applyGeneratedTopic: builder.mutation<
			ApplyGeneratedResponse,
			{ missingFields: string[]; missingRequirements: string[] }
		>({
			query: (body) => ({ url: `/chatbots/apply-field-requirement`, method: 'POST', body }),
			transformResponse: (response: ApiResponse<ApplyGeneratedResponse>) => response.data,
			invalidatesTags: ['ListFields']
		}),
		toggleChatbotStatus: builder.mutation<
			{ message: string },
			{ id: string; suggestionId: string; status: boolean }
		>({
			query: ({ id, status, suggestionId }) => ({
				url: `/chatbots/chatbot-version/${id}/toggle-suggestion-status`,
				method: 'PATCH',
				body: {
					status,
					suggestionId
				}
			}),
			invalidatesTags: ['ChatbotConfig']
		})
	}),
	overrideExisting: false
})

export const {
	useGetChatbotVersionQuery,
	useUpdateChatbotVersionMutation,
	useGetResourcesQuery,
	useGetResourceQuery,
	useCreateResourceMutation,
	useUpdateResourceMutation,
	useDeleteResourceMutation,
	useRetryResourceMutation,
	useCreateQuerySuggestionMutation,
	useUpdateQuerySuggestionMutation,
	useDeleteQuerySuggestionsMutation,
	useToggleChatbotStatusMutation,
	useGenerateTopicMutation,
	useApplyGeneratedTopicMutation
} = chatbotApi
