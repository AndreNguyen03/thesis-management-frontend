import { baseApi } from './baseApi'
import type { Thesis } from '@/models/thesis.model'

export const thesisApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTheses: builder.query<Thesis[], void>({
			query: () => '/theses'
		})
		// Thêm các endpoint khác nếu cần
	}),
	overrideExisting: false
})

export const { useGetThesesQuery } = thesisApi
