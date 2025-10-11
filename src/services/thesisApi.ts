import type { Thesis } from 'models/thesis.model'
import { baseApi, type ApiResponse } from './baseApi'
import type { Registration } from 'models'

export const thesisApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTheses: builder.query<Thesis[], void>({
			query: () => `/theses`,
			transformResponse: (response: ApiResponse<Thesis[]>) => response.data,
			providesTags: ['Theses']
		}),

		saveThesis: builder.mutation<ApiResponse<Thesis>, { thesisId: string }>({
			query: ({ thesisId }) => ({
				url: `/theses/save-thesis/${thesisId}`,
				method: 'POST'
			})
		}),
		getSavedTheses: builder.query<Thesis[], void>({
			query: () => `/theses/saved-theses`,
			transformResponse: (response: ApiResponse<Thesis[]>) => response.data,
			providesTags: ['Theses']
		}),
		unsaveThesis: builder.mutation<ApiResponse<Thesis>, { thesisId: string }>({
			query: ({ thesisId }) => ({
				url: `/theses/unsave-thesis/${thesisId}`,
				method: 'PATCH'
			})
		}),
		// Lấy danh sách đề tài đã đăng ký của sinh viên
		getRegisteredThesis: builder.query<Registration[], void>({
			query: () => `/theses/get-registered`,
			transformResponse: (response: ApiResponse<Registration[]>) => response.data,
			providesTags: ['Theses']
		}),
		// Thêm các endpoint khác nếu cần
		createRegistration: builder.mutation<ApiResponse<Thesis>, { thesisId: string }>({
			query: (body) => ({
				url: `/theses/register-thesis/${body.thesisId}`,
				method: 'POST',
				body: body
			})
		}),
		cancelRegistration: builder.mutation<ApiResponse<Registration>, { thesisId: string }>({
			query: ({ thesisId }) => ({
				url: `/theses/cancel-registration/${thesisId}`,
				method: 'DELETE'
			})
		})
	}),
	overrideExisting: false
})

export const {
	useGetThesesQuery,
	useSaveThesisMutation,
	useUnsaveThesisMutation,
	useGetSavedThesesQuery,
	useGetRegisteredThesisQuery,
	useCreateRegistrationMutation,
	useCancelRegistrationMutation
} = thesisApi
