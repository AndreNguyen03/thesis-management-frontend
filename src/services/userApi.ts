import type { AppUser } from '@/models'
import { baseApi, type ApiResponse } from './baseApi'
import type { PatchLecturerDto, PatchStudentDto } from '@/models/update-users'

export const userApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		// lấy profile của chính mình
		getProfile: builder.query<AppUser, void>({
			query: () => '/users/profile',
			transformResponse: (response: ApiResponse<AppUser>) => response.data,
			providesTags: ['UserProfile']
		}),

		// lấy profile của người khác
		getUser: builder.query<AppUser, { role: 'student' | 'lecturer' | 'admin'; id: string }>({
			query: ({ role, id }) => `/users/${role}/${id}`,
			transformResponse: (response: ApiResponse<AppUser>) => response.data,
			providesTags: ['UserProfile']
		}),

		patchStudent: builder.mutation<AppUser, { id: string; body: PatchStudentDto }>({
			query: ({ id, body }) => ({
				url: `/users/student/${id}`,
				method: 'PATCH',
				body
			}),
			transformResponse: (response: ApiResponse<AppUser>) => response.data,
			invalidatesTags: ['UserProfile']
		}),

		patchLecturer: builder.mutation<AppUser, { id: string; body: PatchLecturerDto }>({
			query: ({ id, body }) => ({
				url: `/users/lecturer/${id}`,
				method: 'PATCH',
				body
			}),
			transformResponse: (response: ApiResponse<AppUser>) => response.data,
			invalidatesTags: ['UserProfile']
		})
	}),
	overrideExisting: false
})

export const { useGetProfileQuery, useGetUserQuery, usePatchStudentMutation, usePatchLecturerMutation } = userApi
