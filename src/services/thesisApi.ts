import type { Thesis } from 'models/thesis.model'
import { baseApi, type ApiResponse } from './baseApi'

export const thesisApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTheses: builder.query<Thesis[], void>({
			query: () => '/theses',
			transformResponse: (response: ApiResponse<Thesis[]>) => response.data,
			providesTags: ['Theses']
		})
		// Thêm các endpoint khác nếu cần
	}),
	overrideExisting: false
})

export const { useGetThesesQuery } = thesisApi
