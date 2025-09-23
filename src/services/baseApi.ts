import {
	createApi,
	fetchBaseQuery,
	type FetchBaseQueryError,
	type FetchBaseQueryMeta,
	type QueryReturnValue
} from '@reduxjs/toolkit/query/react'
import type { RootState } from 'store'
import { logout, setCredentials } from '../features/shared/auth/authSlice'
import { sleep } from '@/utils/utils'

export type ApiResponse<T> = {
	apiVersion: string
	data: T
}

type RefreshTokenResponse = {
	accessToken: string
}

const rawBaseQuery = fetchBaseQuery({
	baseUrl: import.meta.env.VITE_API_BASE_URL,
	credentials: 'include', // gửi cookie tự động
	prepareHeaders: (headers, { getState }) => {
		const token = (getState() as RootState).auth.accessToken
		if (token) headers.set('Authorization', `Bearer ${token}`)
		return headers
	}
})

export const baseApi = createApi({
	reducerPath: 'api',
	baseQuery: async <T>(
		args: Parameters<typeof rawBaseQuery>[0],
		api: Parameters<typeof rawBaseQuery>[1],
		extraOptions: Parameters<typeof rawBaseQuery>[2]
	): Promise<QueryReturnValue<ApiResponse<T>, FetchBaseQueryError, FetchBaseQueryMeta>> => {
		await sleep(1000)

		let result = await rawBaseQuery(args, api, extraOptions)

		// Nếu 401 → thử refresh token từ cookie
		if (
			result.error?.status === 401 &&
			!(typeof args === 'string' ? args.includes('/auth/sign-in') : args.url?.includes('/auth/sign-in')) &&
			!(typeof args === 'string'
				? args.includes('/auth/forgot-password')
				: args.url?.includes('/auth/forgot-password')) &&
			!(typeof args === 'string'
				? args.includes('/auth/reset-password')
				: args.url?.includes('/auth/reset-password'))
		) {
			console.log('[baseApi] Access token expired, trying to refresh token...')
			const refreshResult = await rawBaseQuery(
				{
					url: '/auth/refresh', // nhớ sửa lại đúng endpoint refresh
					method: 'POST',
					body: {} // cookie sẽ tự gửi nhờ `credentials: 'include'`
				},
				api,
				extraOptions
			)

			if (refreshResult.data) {
				const data = refreshResult.data as RefreshTokenResponse
				api.dispatch(setCredentials({ accessToken: data.accessToken }))
				console.log('[baseApi] New access token:', data.accessToken)

				// Retry request cũ
				result = await rawBaseQuery(args, api, extraOptions)
			} else {
				console.log('[baseApi] Refresh token failed, logging out.')
				api.dispatch(logout())
			}
		}

		return result as QueryReturnValue<ApiResponse<T>, FetchBaseQueryError, FetchBaseQueryMeta>
	},
	endpoints: () => ({})
})
