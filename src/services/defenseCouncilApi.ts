import type {
	AddTopicToCouncilPayload,
	AddMultipleTopicsToCouncilPayload,
	CreateDefenseCouncilPayload,
	QueryDefenseCouncilsParams,
	ResDefenseCouncil,
	ResponseDefenseCouncil,
	UpdateTopicMembersPayload
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
			transformResponse: (response: ApiResponse<ResponseDefenseCouncil>) => response.data,
			providesTags: (result, error, args) => [
				{ type: 'defenseCouncilsInMilestone', id: args.milestoneTemplateId }
			]
		}),
		createCouncil: builder.mutation<ApiResponse<any>, CreateDefenseCouncilPayload>({
			query: (body) => ({
				url: '/defense-councils',
				method: 'POST',
				body
			}),
			invalidatesTags: (result, error, args) => [
				{ type: 'defenseCouncilsInMilestone', id: args.milestoneTemplateId }
			]
		}),
		getCouncilById: builder.query<ResDefenseCouncil, string>({
			query: (councilId) => ({
				url: `/defense-councils/${councilId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ResDefenseCouncil>) => response.data,
			providesTags: (_result, _error, councilId) => [{ type: 'DefenseCouncil', id: councilId }]
		}),
		addTopicToCouncil: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; payload: AddTopicToCouncilPayload; milestonesTemplateId?: string }
		>({
			query: ({ councilId, payload }) => ({
				url: `/defense-councils/${councilId}/topics`,
				method: 'POST',
				body: payload
			}),
			invalidatesTags: (_result, _error, { councilId, milestonesTemplateId }) => [
				{ type: 'DefenseCouncil', id: councilId },
				{ type: 'defenseCouncilsInMilestone', id: milestonesTemplateId },
				{ type: 'AwaitingTopicsInDefensemilestone', id: milestonesTemplateId }
			]
		}),
		addMultipleTopicsToCouncil: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; payload: AddMultipleTopicsToCouncilPayload; milestonesTemplateId?: string }
		>({
			query: ({ councilId, payload }) => ({
				url: `/defense-councils/${councilId}/topics/batch`,
				method: 'POST',
				body: payload
			}),
			invalidatesTags: (_result, _error, { councilId, milestonesTemplateId }) => [
				{ type: 'DefenseCouncil', id: councilId },
				{ type: 'defenseCouncilsInMilestone', id: milestonesTemplateId },
				{ type: 'AwaitingTopicsInDefensemilestone', id: milestonesTemplateId }
			]
		}),
		removeTopicFromCouncil: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; topicId: string; milestonesTemplateId?: string }
		>({
			query: ({ councilId, topicId }) => ({
				url: `/defense-councils/${councilId}/topics/${topicId}`,
				method: 'DELETE'
			}),
			invalidatesTags: (_result, _error, { councilId, milestonesTemplateId }) => [
				{ type: 'DefenseCouncil', id: councilId },
				{ type: 'defenseCouncilsInMilestone', id: milestonesTemplateId },
				{ type: 'AwaitingTopicsInDefensemilestone', id: milestonesTemplateId }
			]
		}),
		updateTopicMembers: builder.mutation<
			ApiResponse<any>,
			{ councilId: string; topicId: string; payload: UpdateTopicMembersPayload }
		>({
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
			invalidatesTags: (_result, _error, { councilId }) => [{ type: 'DefenseCouncil', id: councilId }]
		}),
		getDetailAssignedDefenseCouncils: builder.query<ResDefenseCouncil, string>({
			query: (councilId) => ({
				url: `/defense-councils/lecturer/detail-assigned-defense/${councilId}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ResDefenseCouncil>) => response.data,
			providesTags: (result, error, args) => [{ type: 'AssignedDefenseCouncils', id: 'LIST' }]
		})
	}),
	overrideExisting: false
})

export const {
	useGetCouncilsQuery,
	useCreateCouncilMutation,
	useGetCouncilByIdQuery,
	useAddTopicToCouncilMutation,
	useAddMultipleTopicsToCouncilMutation,
	useRemoveTopicFromCouncilMutation,
	useUpdateTopicMembersMutation,
	useUpdateTopicOrderMutation,
	useGetDetailAssignedDefenseCouncilsQuery
} = defenseCouncilApi
