import type { AddMessgePayload, ConversationMessage, GetConversationsDto } from '@/models/chatbot-conversation.model'
import { baseApi, type ApiResponse } from './baseApi'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'

export const chatbotConversationApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getConversations: builder.query<GetConversationsDto[], { status: 'active' | 'archived'; search?: string }>({
			query: ({ status, search }) => `/chatbot/conversations?${buildQueryString({ status, search })}`,
			transformResponse: (response: ApiResponse<GetConversationsDto[]>) => response.data,
			providesTags: (result, error, arg) => [{ type: 'ConversationsChatBot' }]
		}),
		createConversation: builder.mutation<string, { title?: string; initialMessage?: string }>({
			query: (body) => ({
				url: '/chatbot/conversations',
				method: 'POST',
				body: {
					...body
				}
			}),
			transformResponse: (response: ApiResponse<string>) => response.data,
			invalidatesTags: (result, error, arg) => [{ type: 'ConversationsChatBot' }]
		}),
		getConversationById: builder.query<GetConversationsDto, string>({
			query: (id) => `/chatbot/conversations/${id}`,
			transformResponse: (response: ApiResponse<GetConversationsDto>) => response.data
		}),
		updateConversation: builder.mutation<any, { id: string; data: { title?: string; status?: string } }>({
			query: ({ id, data }) => ({
				url: `/chatbot/conversations/${id}`,
				method: 'PATCH',
				body: data
			})
		}),
		deleteConversation: builder.mutation<any, string>({
			query: (id) => ({
				url: `/chatbot/conversations/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: (result, error, arg) => [{ type: 'ConversationsChatBot' }]
		}),
		addMessage: builder.mutation<ConversationMessage, { id: string; data: AddMessgePayload }>({
			query: ({ id, data }) => ({
				url: `/chatbot/conversations/${id}/messages`,
				method: 'POST',
				body: {
                    role: data.role,
                    content: data.content,
                    topics: data.topics
                }
			}),
			transformResponse: (response: ApiResponse<ConversationMessage>) => response.data,
			invalidatesTags: (result, error, arg) => [{ type: 'ConversationsChatBot' }]
		})
	}),
	overrideExisting: false
})
export const {
	useGetConversationsQuery,
	useCreateConversationMutation,
	useGetConversationByIdQuery,
	useUpdateConversationMutation,
	useDeleteConversationMutation,
	useAddMessageMutation
} = chatbotConversationApi
