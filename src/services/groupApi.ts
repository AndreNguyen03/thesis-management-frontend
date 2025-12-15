import { baseApi, type ApiResponse } from './baseApi'
import type { GroupResponseDto, PaginatedGroup } from '@/models/groups.model'

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
		})
	})
})

export const { useGetPaginateGroupsQuery, useGetGroupDetailQuery } = groupApi
