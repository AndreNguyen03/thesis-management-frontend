import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

export const uploadApi = createApi({
	reducerPath: 'uploadApi',
	baseQuery: fetchBaseQuery({
		baseUrl: import.meta.env.VITE_API_BASE_URL,
		prepareHeaders: (headers) => {
			const token = sessionStorage.getItem('accessToken')
			if (token) headers.set('Authorization', `Bearer ${token}`)
			return headers
		}
	}),
	endpoints: (builder) => ({
		uploadAvatar: builder.mutation<{ avatarUrl: string }, FormData>({
			query: (formData) => {
				return {
					url: '/users/upload-avatar',
					method: 'POST',
					body: formData // fetch tự set multipart/form-data
				}
			}
		})
	})
})

export const { useUploadAvatarMutation } = uploadApi
