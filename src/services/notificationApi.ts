import type { SendRemainIssueNoti } from '@/models/period.model'
import { baseApi, type ApiResponse } from './baseApi'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'
import type { PaginatedNotifications } from '@/models/notification.model'

export const periodApi = baseApi.injectEndpoints({
	endpoints: (builder) => ({
		sendRemainIssueNoti: builder.mutation<void, SendRemainIssueNoti>({
			query: (data) => ({
				url: 'notifications/remain-issue',
				method: 'POST',
				body: data
			})
		}),
		getNotifications: builder.query<PaginatedNotifications, PaginationQueryParamsDto>({
			query: (queries) => {
				const queryString = buildQueryString(queries)
				return {
					url: `/notifications/user?${queryString}`
				}
			},
			transformResponse: (response: ApiResponse<PaginatedNotifications>) => response.data
		})
	})
})

export const { useSendRemainIssueNotiMutation, useGetNotificationsQuery } = periodApi
