import { baseApi, type ApiResponse } from './baseApi'
import type { GroupResponseDto, MessageDto, PaginatedGroup } from '@/models/groups.model'

export const groupApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// get user group
		getPaginateGroups: builder.query<PaginatedGroup, void>({
			query: () => ({
				url: '/groups',
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<PaginatedGroup>) => response.data
		}),
		getGroupDetail: builder.query<GroupResponseDto, { groupId: string }>({
			query: ({ groupId }) => ({
				url: `/groups/detail/${groupId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<GroupResponseDto>) => response.data
		}),
		// ===== GET MESSAGES =====
		getGroupMessages: builder.query<MessageDto[], { groupId: string; limit?: number; before?: string }>({
			query: ({ groupId, limit, before }) => ({
				url: `/groups/${groupId}/messages`,
				method: 'GET',
				params: { limit, before }
			}),
			transformResponse: (response: ApiResponse<MessageDto[]>) => response.data
		}),

		// ===== SEARCH MESSAGES =====
		searchGroupMessages: builder.query<MessageDto[], { groupId: string; keyword: string; limit?: number }>({
			query: ({ groupId, keyword, limit }) => ({
				url: `/groups/${groupId}/search`,
				method: 'GET',
				params: { keyword, limit }
			}),
			transformResponse: (response: ApiResponse<MessageDto[]>) => response.data
		})
	})
})

export const {
	useGetPaginateGroupsQuery,
	useGetGroupDetailQuery,
	useGetGroupMessagesQuery,
	useSearchGroupMessagesQuery
} = groupApi
