import { baseApi, type ApiResponse } from './baseApi'
import type {
	CreateDirectGroupDto,
	DirectSidebarGroup,
	GroupDetail,
	MessageDto,
	PaginatedDirectGroups,
	PaginatedGroups
} from '@/models/groups.model'

export const groupApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// get user group
		getPaginatedGroup: builder.query<PaginatedGroups, { page?: number; limit?: number }>({
			query: ({ page, limit }) => ({
				url: '/groups',
				method: 'GET',
				params: { page, limit }
			}),
			transformResponse: (response: ApiResponse<PaginatedGroups>) => response.data
		}),

		// Lấy chi tiết 1 group
		getGroupDetail: builder.query<GroupDetail, { groupId: string }>({
			query: ({ groupId }) => ({
				url: `/groups/detail/${groupId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<GroupDetail>) => response.data
		}),

	
		getPaginateDirectGroups: builder.query<PaginatedDirectGroups, void>({
			query: () => ({
				url: '/groups/user-directs',
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<PaginatedDirectGroups>) => response.data,
			providesTags: ['DirectGroups']
		}),
		// THÊM: Mutation cho createOrGetDirectGroup
		createOrGetDirectGroup: builder.mutation<DirectSidebarGroup, CreateDirectGroupDto>({
			query: (dto) => ({
				url: '/groups/direct',
				method: 'POST',
				body: dto // { targetUserId, topicId? }
			}),
			transformResponse: (response: ApiResponse<DirectSidebarGroup>) => response.data,
			invalidatesTags: ['DirectGroups'] // Refresh paginated list sau tạo
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
	useGetPaginatedGroupQuery,
	useGetGroupDetailQuery,
	useGetPaginateDirectGroupsQuery,
	useCreateOrGetDirectGroupMutation,
	useGetGroupMessagesQuery,
	useSearchGroupMessagesQuery
} = groupApi
