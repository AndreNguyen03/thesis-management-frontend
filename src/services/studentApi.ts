import type { CreateStudentRequest, StudentTable } from '@/features/admin/manage_student/types'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'
import type { PaginatedMiniLecturer, PaginatedStudents } from '@/models/users'
import { baseApi } from '@/services/baseApi'
import type { ApiResponse } from '@/services/baseApi'

export const studentApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// 🧩 Lấy danh sách sinh viên
		getStudents: builder.query<
			{ datas: StudentTable[]; total_records: number },
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
				url: '/users/students',
				method: 'GET',
				params
			}),
			transformResponse: (response: ApiResponse<{ datas: StudentTable[]; total_records: number }>) =>
				response.data,
			providesTags: ['UserProfile', 'ListStudent']
		}),

		// 🧩 Tạo sinh viên mới
		createStudent: builder.mutation<StudentTable, CreateStudentRequest>({
			query: (body) => ({
				url: '/users/students',
				method: 'POST',
				body
			}),
			transformResponse: (response: ApiResponse<StudentTable>) => response.data,
			invalidatesTags: ['UserProfile', 'ListStudent']
		}),

		// 🧩 Tạo hàng loạt sinh viên (Batch)
		createBatchStudents: builder.mutation<{ created: StudentTable[]; failed: string[] }, CreateStudentRequest[]>({
			query: (body) => ({
				url: '/students/batch',
				method: 'POST',
				body
			}),
			transformResponse: (response: ApiResponse<{ created: StudentTable[]; failed: string[] }>) => response.data,
			invalidatesTags: ['UserProfile', 'ListStudent']
		}),

		// 🧩 Cập nhật thông tin sinh viên
		updateStudent: builder.mutation<StudentTable, { id: string; data: Partial<StudentTable> }>({
			query: ({ id, data }) => ({
				url: `/users/students/${id}`,
				method: 'PATCH',
				body: data
			}),
			transformResponse: (response: ApiResponse<StudentTable>) => response.data,
			invalidatesTags: ['UserProfile', 'ListStudent']
		}),

		// 🧩 Xóa sinh viên
		deleteStudent: builder.mutation<{ success: boolean; id: string }, string>({
			query: (id) => ({
				url: `/users/students/${id}`,
				method: 'DELETE'
			}),
			transformResponse: (response: ApiResponse<{ success: boolean; id: string }>) => response.data,
			invalidatesTags: ['UserProfile', 'ListStudent']
		}),
		getStudentsCombobox: builder.query<PaginatedStudents, PaginationQueryParamsDto>({
			query: (queries) => {
				const queryString = buildQueryString(queries)
				return {
					url: `/users/lec/get-all-students/combobox?${queryString}`
				}
			},
			transformResponse: (response: ApiResponse<PaginatedStudents>) => response.data
		})
	})
})

export const {
	useGetStudentsQuery,
	useCreateStudentMutation,
	useUpdateStudentMutation,
	useDeleteStudentMutation,
	useCreateBatchStudentsMutation,
	useGetStudentsComboboxQuery
} = studentApi
