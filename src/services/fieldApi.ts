import type { PaginatedFieldNames } from '@/models/field.model'
import { baseApi, type ApiResponse } from './baseApi'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'

export const fieldApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getFields: builder.query<PaginatedFieldNames, PaginationQueryParamsDto>({
			query: (queries) => {
				const queryString = buildQueryString(queries)
				return {
					url: `/fields?${queryString}`
				}
			},
			transformResponse: (response: ApiResponse<PaginatedFieldNames>) => response.data
		})
	}),
	overrideExisting: false
})
export const { useGetFieldsQuery } = fieldApi
