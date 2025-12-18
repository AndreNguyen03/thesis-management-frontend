import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'
import { baseApi, type ApiResponse } from './baseApi'
import type { Faculty } from '@/features/admin/manage_lecturer/types'
import type { PaginatedResponse } from '@/models'

export const facultyApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getFaculties: builder.query<PaginatedResponse<Faculty>, PaginationQueryParamsDto>({
			query: (params) => {
                const queryString = buildQueryString(params)
                return {
                    url: `/faculties?${queryString}`,
                    method: 'GET'
                }
            },
			transformResponse: (response: ApiResponse<PaginatedResponse<Faculty>>) => response.data
		})
	}),
	overrideExisting: false
})
export const { useGetFacultiesQuery } = facultyApi
