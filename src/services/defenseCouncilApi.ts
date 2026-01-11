import type {
	CreateDefenseCouncilPayload,
	QueryDefenseCouncilsParams,
	ResDefenseCouncil,
	ResponseDefenseCouncil
} from '@/models/defenseCouncil.model'
import { baseApi, type ApiResponse } from './baseApi'

import { buildQueryString } from '@/models/query-params'

export const defenseCouncilApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getCouncils: builder.query<ResponseDefenseCouncil, QueryDefenseCouncilsParams>({
			query: (params) => ({
				url: `/defense-councils?${buildQueryString(params)}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ResponseDefenseCouncil>) => response.data
		}),
		createCouncil: builder.mutation<ApiResponse<any>, CreateDefenseCouncilPayload>({
			query: (body) => ({
				url: '/defense-councils',
				method: 'POST',
				body
			})
		}),
		getCouncilById: builder.query<ResDefenseCouncil, string>({
			query: (councilId) => ({
				url: `/defense-councils/${councilId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ResDefenseCouncil>) => response.data,
			providesTags: (_result, _error, councilId) => [{ type: 'Theses', id: councilId }]
		}),
		addTopicToCouncil: builder.mutation<ApiResponse<any>, { councilId: string; payload: any }>({
			query: ({ councilId, payload }) => ({
				url: `/defense-councils/${councilId}/topics`,
				method: 'POST',
				body: payload
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'Theses', id: councilId }]
		}),
		removeTopicFromCouncil: builder.mutation<ApiResponse<any>, { councilId: string; topicId: string }>({
			query: ({ councilId, topicId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'Theses', id: councilId }]
		}),
		updateTopicMembers: builder.mutation<ApiResponse<any>, { councilId: string; topicId: string; payload: any }>({
			query: ({ councilId, topicId, payload }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/members`,
				method: 'PATCH',
				body: payload
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'Theses', id: councilId }]
		}),
		updateTopicOrder: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; topicId: string; defenseOrder: number }
		>({
			query: ({ councilId, topicId, defenseOrder }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}/order`,
				method: 'PATCH',
				body: { defenseOrder }
			}),
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'Theses', id: councilId }]
		})
	}),
	overrideExisting: false
})

export const {
	useGetCouncilsQuery,
	useCreateCouncilMutation,
	useGetCouncilByIdQuery,
	useAddTopicToCouncilMutation,
	useRemoveTopicFromCouncilMutation,
	useUpdateTopicMembersMutation,
	useUpdateTopicOrderMutation
} = defenseCouncilApi
