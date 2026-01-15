import { baseApi, type ApiResponse } from './baseApi'
import type {
	ConceptCandidate,
	ConceptCandidateListQuery,
	ConceptCandidateListResponse,
	ConceptStatistics,
	ApproveConceptDto,
	RejectConceptDto,
	Concept,
	ConceptTreeResponse
} from '@/models/concept.model'

export const conceptApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// Get concept candidates with filters and pagination
		getConceptCandidates: builder.query<ConceptCandidateListResponse, ConceptCandidateListQuery>({
			query: (params) => {
				const searchParams = new URLSearchParams()
				if (params.status) searchParams.append('status', params.status)
				if (params.page) searchParams.append('page', params.page.toString())
				if (params.limit) searchParams.append('limit', params.limit.toString())
				if (params.sortBy) searchParams.append('sortBy', params.sortBy)
				if (params.sortOrder) searchParams.append('sortOrder', params.sortOrder)

				return {
					url: `/admin/concepts/candidates?${searchParams.toString()}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<ConceptCandidateListResponse>) => response.data,
			providesTags: (result) =>
				result
					? [
							...result.data.map(({ _id }) => ({ type: 'ConceptCandidate' as const, id: _id })),
							{ type: 'ConceptCandidate', id: 'LIST' }
						]
					: [{ type: 'ConceptCandidate', id: 'LIST' }]
		}),

		// Get concept candidates statistics
		getConceptStatistics: builder.query<ConceptStatistics, void>({
			query: () => ({
				url: '/admin/concepts/candidates/statistics',
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ConceptStatistics>) => response.data,
			providesTags: [{ type: 'ConceptStatistics', id: 'STATS' }]
		}),

		// Get single concept candidate by ID
		getConceptCandidateById: builder.query<ConceptCandidate, string>({
			query: (id) => ({
				url: `/admin/concepts/candidates/${id}`,
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ConceptCandidate>) => response.data,
			providesTags: (result, error, id) => [{ type: 'ConceptCandidate', id }]
		}),

		// Approve concept candidate
		approveConceptCandidate: builder.mutation<ConceptCandidate, { id: string; data: ApproveConceptDto }>({
			query: ({ id, data }) => ({
				url: `/admin/concepts/candidates/${id}/approve`,
				method: 'POST',
				body: data
			}),
			transformResponse: (response: ApiResponse<ConceptCandidate>) => response.data,
			invalidatesTags: (result, error, { id }) => [
				{ type: 'ConceptCandidate', id },
				{ type: 'ConceptCandidate', id: 'LIST' },
				{ type: 'ConceptStatistics', id: 'STATS' },
				{ type: 'ConceptTree', id: 'TREE' }
			]
		}),

		// Reject concept candidate
		rejectConceptCandidate: builder.mutation<ConceptCandidate, { id: string; data: RejectConceptDto }>({
			query: ({ id, data }) => ({
				url: `/admin/concepts/candidates/${id}/reject`,
				method: 'POST',
				body: data
			}),
			transformResponse: (response: ApiResponse<ConceptCandidate>) => response.data,
			invalidatesTags: (result, error, { id }) => [
				{ type: 'ConceptCandidate', id },
				{ type: 'ConceptCandidate', id: 'LIST' },
				{ type: 'ConceptStatistics', id: 'STATS' }
			]
		}),

		// Delete concept candidate
		deleteConceptCandidate: builder.mutation<void, string>({
			query: (id) => ({
				url: `/admin/concepts/candidates/${id}`,
				method: 'DELETE'
			}),
			invalidatesTags: (result, error, id) => [
				{ type: 'ConceptCandidate', id },
				{ type: 'ConceptCandidate', id: 'LIST' },
				{ type: 'ConceptStatistics', id: 'STATS' }
			]
		}),

		// Reload concept index
		reloadConceptIndex: builder.mutation<{ message: string; note: string }, void>({
			query: () => ({
				url: '/admin/concepts/reload-index',
				method: 'POST'
			}),
			transformResponse: (response: ApiResponse<{ message: string; note: string }>) => response.data,
			invalidatesTags: [{ type: 'ConceptTree', id: 'TREE' }]
		}),

		// Get all concepts (for tree visualization)
		getAllConcepts: builder.query<Concept[], void>({
			query: () => ({
				url: '/concepts',
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<Concept[]>) => response.data,
			providesTags: [{ type: 'ConceptTree', id: 'TREE' }]
		}),

		// Get concept tree structure
		getConceptTree: builder.query<ConceptTreeResponse, void>({
			query: () => ({
				url: '/concepts/tree',
				method: 'GET'
			}),
			transformResponse: (response: ApiResponse<ConceptTreeResponse>) => response.data,
			providesTags: [{ type: 'ConceptTree', id: 'TREE' }]
		})
	}),
	overrideExisting: false
})

export const {
	useGetConceptCandidatesQuery,
	useGetConceptStatisticsQuery,
	useGetConceptCandidateByIdQuery,
	useApproveConceptCandidateMutation,
	useRejectConceptCandidateMutation,
	useDeleteConceptCandidateMutation,
	useReloadConceptIndexMutation,
	useGetAllConceptsQuery,
	useGetConceptTreeQuery
} = conceptApi
