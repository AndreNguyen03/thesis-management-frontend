import {
	createApi,
	fetchBaseQuery,
	type FetchBaseQueryError,
	type FetchBaseQueryMeta,
	type QueryReturnValue
} from '@reduxjs/toolkit/query/react'
import { logout } from '../features/shared/auth/authSlice'
import { decodeJwt, sleep } from '@/utils/utils'

export type ApiResponse<T> = {
	apiVersion: string
	data: T
}

const rawBaseQuery = fetchBaseQuery({
	baseUrl: import.meta.env.VITE_API_BASE_URL,
	credentials: 'include',
	prepareHeaders: (headers) => {
		const token = sessionStorage.getItem('accessToken')
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
		await sleep(300)

		// ✅ Check token TTL trước khi call API
		const token = sessionStorage.getItem('accessToken')
		const expiry = sessionStorage.getItem('accessTokenExpiry')

		const isAuthEndpoint = typeof args === 'string' ? args.includes('/auth/') : args.url?.includes('/auth/')

		if (token && !isAuthEndpoint) {
			let exp = Number(expiry)
			if (!exp) {
				const decoded = decodeJwt<{ exp: number }>(token)
				if (decoded?.exp) {
					exp = decoded.exp * 1000
					sessionStorage.setItem('accessTokenExpiry', String(exp))
				}
			}

			if (Date.now() > exp) {
				console.log('[baseApi] Token expired, logging out.')
				sessionStorage.removeItem('accessToken')
				sessionStorage.removeItem('accessTokenExpiry')
				api.dispatch(logout())
				return {
					error: {
						status: 401,
						data: { message: 'Token expired' }
					}
				} as QueryReturnValue<ApiResponse<T>, FetchBaseQueryError, FetchBaseQueryMeta>
			}
		}

		let result = await rawBaseQuery(args, api, extraOptions)

		// ✅ Nếu 401 thì thử refresh
		if (result.error?.status === 401 && !isAuthEndpoint) {
			console.log('[baseApi] Access token expired, trying to refresh token...')

			const refreshResult = await rawBaseQuery(
				{ url: '/auth/refresh', method: 'POST', body: {} },
				api,
				extraOptions
			)

			if (refreshResult.data) {
				const data = refreshResult.data as { accessToken: string }
				sessionStorage.setItem('accessToken', data.accessToken)

				const decoded = decodeJwt<{ exp: number }>(data.accessToken)
				if (decoded?.exp) {
					sessionStorage.setItem('accessTokenExpiry', String(decoded.exp * 1000))
				}

				console.log('[baseApi] New access token issued, retrying request...')
				result = await rawBaseQuery(args, api, extraOptions)
			} else {
				console.log('[baseApi] Refresh token failed, logging out.')
				sessionStorage.removeItem('accessToken')
				sessionStorage.removeItem('accessTokenExpiry')
				api.dispatch(logout())
			}
		}

		return result as QueryReturnValue<ApiResponse<T>, FetchBaseQueryError, FetchBaseQueryMeta>
	},
	tagTypes: [
		'UserProfile',
		'Theses',
		'ListLecturer',
		'ListStudent',
		'PeriodDetail',
		'Periods',
		'PhaseTopics',
		'MyRegisteredTopics',
		'Milestones',
		'DirectGroups',
		'MilestonePeriods',
		'ChatbotConfig',
		'ChatbotResources',
		'KnowledgeSources',
		'Milestone-Faculty',
		'ListFields',
		'DefenseMilestone',
		'Topic',
		'TopicRegistration',
		'StudentDashboard',
		'LecturerDashboard',
		'LecturerSubmittedTopics',
		'TopicRatingStats',
		'ConversationsChatBot',
		'TaskDetail', // For Jira-like task detail,
		'SubtaskDetail',
		'defenseCouncilsInMilestone',
		'Task',
		'TaskList',
	],
	endpoints: () => ({})
})
