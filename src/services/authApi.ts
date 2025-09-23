import { baseApi, type ApiResponse } from './baseApi'

export interface LoginRequest {
	email: string
	password: string
	deviceInfo?: string
}

export const authApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		login: builder.mutation<ApiResponse<{ accessToken: string }>, LoginRequest>({
			query: (body) => ({
				url: '/auth/sign-in',
				method: 'POST',
				body
			})
		}),
		forgotPassword: builder.mutation<ApiResponse<{ message: string }>, { email: string }>({
			query: (body) => ({
				url: '/auth/forgot-password',
				method: 'POST',
				body
			})
		}),
		resetPassword: builder.mutation<ApiResponse<{ message: string }>, { token: string; newPassword: string }>({
			query: (body) => ({
				url: '/auth/reset-password',
				method: 'POST',
				body
			})
		}),
		logout: builder.mutation<ApiResponse<{ message: string }>, void>({
			query: () => ({
				url: '/auth/logout',
				method: 'POST'
			})
		})
	}),
	overrideExisting: false
})

export const { useLoginMutation, useForgotPasswordMutation, useResetPasswordMutation, useLogoutMutation } = authApi
