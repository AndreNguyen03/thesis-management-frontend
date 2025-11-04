import { baseApi } from '@/services/baseApi'
import type { ApiResponse } from '@/services/baseApi'
import type { CreateUserRequest, LecturerTable } from '@/features/admin/manage_lecturer/types'

export const lecturerApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// 🧩 Lấy danh sách giảng viên
		getLecturers: builder.query<
			{ datas: LecturerTable[]; total_records: number },
			{
				page: number
				page_size: number
				search_by?: string
				query?: string
				sort_by?: string
				sort_order?: string
			}
		>({
			query: (params) => ({
				url: '/users/lecturers',
				method: 'GET',
				params
			}),
			transformResponse: (response: ApiResponse<{ datas: LecturerTable[]; total_records: number }>) =>
				response.data,
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
		createBatchLecturers: builder.mutation<{ created: LecturerTable[]; failed: string[] }, CreateUserRequest[]>({
			query: (body) => ({
				url: '/lecturers/batch',
				method: 'POST',
				body
			}),
			transformResponse: (response: ApiResponse<{ created: LecturerTable[]; failed: string[] }>) => response.data,
			invalidatesTags: ['UserProfile', 'ListLecturer']
		}),

		// 🧩 Cập nhật thông tin quản trị viên
		updateLecturer: builder.mutation<LecturerTable, { id: string; data: Partial<LecturerTable> }>({
			query: ({ id, data }) => ({
				url: `/users/lecturers/${id}`,
				method: 'PATCH',
				body: data
			}),
			transformResponse: (response: ApiResponse<LecturerTable>) => response.data,
			invalidatesTags: ['UserProfile', 'ListLecturer']
		}),

		// 🧩 Xóa quản trị viên
		deleteLecturer: builder.mutation<{ success: boolean; id: string }, string>({
			query: (id) => ({
				url: `/users/lecturers/${id}`,
				method: 'DELETE'
			}),
			transformResponse: (response: ApiResponse<{ success: boolean; id: string }>) => response.data,
			invalidatesTags: ['UserProfile', 'ListLecturer']
		})
	})
})

export const { useGetLecturersQuery, useCreateLecturerMutation, useUpdateLecturerMutation, useDeleteLecturerMutation } =
	lecturerApi
