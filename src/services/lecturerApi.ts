import { baseApi } from '@/services/baseApi'
import type { ApiResponse } from '@/services/baseApi'
import type { CreateUserRequest, LecturerTable } from '@/features/admin/manage_lecturer/types'
import type { CreateBatchLecturerDto, CreateLecturerBatchResponse, PaginatedMiniLecturer, PaginatedResponse, PaginationLecturerQueryParams } from '@/models'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'

export const lecturerApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// 🧩 Lấy danh sách giảng viên
		getLecturers: builder.query<PaginatedResponse<LecturerTable>, PaginationLecturerQueryParams>({
			query: (params) => {
				const queryString = buildQueryString(params)
				return {
					url: `/users/get-all-lecturers?${queryString}`,
					method: 'GET'
				}
			},
			transformResponse: (response: ApiResponse<PaginatedResponse<LecturerTable>>) => response.data,
			providesTags: ['UserProfile', 'ListLecturer']
		}),

		// 🧩 Tạo giảng viên mới
		createLecturer: builder.mutation<LecturerTable, CreateUserRequest>({
			query: (body) => ({
				url: '/users/lecturers',
				method: 'POST',
				body
			}),
			transformResponse: (response: ApiResponse<LecturerTable>) => response.data,
			invalidatesTags: ['UserProfile', 'ListLecturer']
		}),

		// 🧩 Tạo hàng loạt giảng viên (Batch)
		createBatchLecturers: builder.mutation<CreateLecturerBatchResponse, CreateBatchLecturerDto[]>({
			query: (body) => ({
				url: '/users/lecturers/batch',
				method: 'POST',
				body
			}),
			transformResponse: (response: ApiResponse<CreateLecturerBatchResponse>) => response.data,
			invalidatesTags: ['UserProfile', 'ListLecturer']
		}),
		updateLecturer: builder.mutation<LecturerTable, { id: string; data: Partial<LecturerTable> }>({
			query: ({ id, data }) => ({
				url: `/users/lecturers/${id}`,
				method: 'PATCH',
				body: data
			}),
			transformResponse: (response: ApiResponse<LecturerTable>) => response.data,
			invalidatesTags: ['UserProfile', 'ListLecturer']
		}),
		deleteLecturer: builder.mutation<{ success: boolean; id: string }, string>({
			query: (id) => ({
				url: `/users/lecturers/${id}`,
				method: 'DELETE'
			}),
			transformResponse: (response: ApiResponse<{ success: boolean; id: string }>) => response.data,
			invalidatesTags: ['UserProfile', 'ListLecturer']
		}),
		getAllLecturersCombobox: builder.query<PaginatedMiniLecturer, PaginationQueryParamsDto>({
			query: (queries) => {
				const query = buildQueryString(queries)
				return `/users/get-all-lecturers/combobox?${query}`
			},
			transformResponse: (response: ApiResponse<PaginatedMiniLecturer>) => response.data
		})
	})
})

export const {
	useGetLecturersQuery,
	useCreateLecturerMutation,
	useUpdateLecturerMutation,
	useDeleteLecturerMutation,
	useGetAllLecturersComboboxQuery,
	useCreateBatchLecturersMutation
} = lecturerApi
