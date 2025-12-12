import type { SendRemainIssueNoti } from '@/models/period.model'
import { baseApi, type ApiResponse } from './baseApi'
import { buildQueryString, type PaginationQueryParamsDto } from '@/models/query-params'
import type { NotificationItem, PaginatedNotifications } from '@/models/notification.model'
import { waitForSocket } from '@/utils/socket-client'

export const notificationApi = baseApi.injectEndpoints({
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
			async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
				try {
					await cacheDataLoaded

					const socket = await waitForSocket()
					if (!socket) return

					const listener = (newNoti: NotificationItem) => {
						updateCachedData((draft) => {
							draft.data.unshift(newNoti)
						})
					}
					const markNoti = (notificationId: string) => {
						updateCachedData((draft) => {
							const index = draft.data.findIndex((n) => String(n._id) === String(notificationId))
							if (index !== -1) {
								draft.data[index].isRead = true
							}
						})
					}
					// 4. Bắt đầu lắng nghe
					socket.on('notification:new', listener)
					socket.on('notification:marked-read', markNoti)
					socket.on('notification:mark-read-all', () => {
						updateCachedData((draft) => {
							draft.data.forEach((n) => {
								n.isRead = true
							})
						})
					})
					// 5. Dọn dẹp: Khi user chuyển trang khác, tắt lắng nghe để tránh memory leak
					await cacheEntryRemoved
					socket.off('notification:new', listener)
				} catch (err) {
					console.error('Socket error in RTK Query:', err)
				}
			},
			transformResponse: (response: ApiResponse<PaginatedNotifications>) => response.data
		}),
		markAllNotificationsRead: builder.mutation<void, void>({
			query: () => ({
				url: '/notifications/mark-all-read',
				method: 'POST'
			})
		}),
		markNotificationRead: builder.mutation<void, string>({
			query: (id) => ({
				url: `/notifications/${id}/mark-read`,
				method: 'POST'
			})
		})
	})
})

export const {
	useSendRemainIssueNotiMutation,
	useGetNotificationsQuery,
	useMarkAllNotificationsReadMutation,
	useMarkNotificationReadMutation
} = notificationApi
