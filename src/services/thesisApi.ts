import type { Thesis } from 'models/thesis.model'
import { baseApi, type ApiResponse } from './baseApi'
import type { Registration } from 'models'

export const thesisApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		getTheses: builder.query<Thesis[], void>({
			query: () => `/theses/student`,
			transformResponse: (response: ApiResponse<Thesis[]>) => response.data,
			providesTags: ['Theses']
		}),
		getSavedTheses: builder.query<Thesis[], { userId: string; role: string }>({
			query: ({ userId, role }) => `/theses/saved-by-user?userId=${userId}&role=${role}`,
			transformResponse: (response: ApiResponse<Thesis[]>) => response.data,
			providesTags: ['Theses']
		}),
		saveThesis: builder.mutation<ApiResponse<Thesis>, { userId: string; thesisId: string; role: string }>({
			query: (body) => ({
				url: `/theses/save`,
				method: 'POST',
				body: body
			})
		}),
		// Lấy danh sách đề tài đã đăng ký của sinh viên
		studentGetRegisteredThesis: builder.query<Registration[], void>({
			query: () => `/theses/get-registered`,
			transformResponse: (response: ApiResponse<Registration[]>) => response.data,
			providesTags: ['Theses']
		}),
		// Thêm các endpoint khác nếu cần
		createStudentRegistration: builder.mutation<ApiResponse<Thesis>, { studentId: string; thesisId: string }>({
			query: (body) => ({
				url: `/theses/student/${body.studentId}/register/${body.thesisId}`,
				method: 'PATCH',
				body: body
			})
		})
	}),
	overrideExisting: false
})

export const {
	useGetThesesQuery,
	useSaveThesisMutation,
	useGetSavedThesesQuery,
	useStudentGetRegisteredThesisQuery,
	useCreateStudentRegistrationMutation
} = thesisApi
