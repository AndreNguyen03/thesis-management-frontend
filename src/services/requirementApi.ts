import { baseApi, type ApiResponse } from './baseApi'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'
import type {
	CreateRequirementDto,
	GetRequirementNameReponseDto,
	PaginatedRequirement
} from '@/models/requirement.model'

export const requirementApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getRequirements: builder.query<PaginatedRequirement, PaginationQueryParamsDto>({
			query: (queries) => {
				const queryString = buildQueryString(queries)
				return {
					url: `/requirements/get-all/combobox?${queryString}`
				}
			},
			transformResponse: (response: ApiResponse<PaginatedRequirement>) => response.data
		}),
		createRequirement: builder.mutation<GetRequirementNameReponseDto, CreateRequirementDto>({
			query: (body) => {
				return {
					url: `/requirements`,
					method: 'POST',
					body: body
				}
			},
			transformResponse: (response: ApiResponse<GetRequirementNameReponseDto>) => response.data
		})
	}),
	overrideExisting: false
})
export const { useGetRequirementsQuery,useCreateRequirementMutation } = requirementApi
