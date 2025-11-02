import type { GetFieldNameReponseDto } from '@/models/field.model'
import { baseApi, type ApiResponse } from './baseApi'

export const fieldApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getFields: builder.query<GetFieldNameReponseDto[], void>({
			query: () => '/fields',
			transformResponse: (response: ApiResponse<GetFieldNameReponseDto[]>) => response.data
		})
	}),
	overrideExisting: false
})
export const { useGetFieldsQuery } = fieldApi
