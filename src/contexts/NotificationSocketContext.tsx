/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useEffect, useState, useCallback } from 'react'
import { socketService } from '@/services/socket.service'
import type { NotificationItem } from '@/models/notification.model'
import { useGetNotificationsQuery } from '@/services/notificationApi'

const NOTIFICATION_NS = '/notifications'

interface NotificationSocketContextValue {
	notifications: NotificationItem[]
	unreadCount: number
	markAsRead: (notificationId: string) => void
	markAllAsRead: () => void
	loadMore: () => void
	hasMore: boolean
	refresh: () => void
}

export const NotificationEvent = {
	NEW: 'notification:new',
	MARK_READ_ALL: 'notification:mark-read-all',
	MARKED_READ: 'notification:marked-read'
} as const

const NotificationSocketContext = createContext<NotificationSocketContextValue | null>(null)

export const NotificationSocketProvider: React.FC<{ userId: string; children: React.ReactNode }> = ({
	userId,
	children
}) => {
	const [notifications, setNotifications] = useState<NotificationItem[]>([])
	const [page, setPage] = useState(1)
	const [hasMore, setHasMore] = useState(true)
	const limit = 10

	const { data, refetch } = useGetNotificationsQuery(
		{ page, limit, sort_by: 'createdAt', sort_order: 'desc' },
		{ skip: !userId }
	)

	// Merge dữ liệu fetch vào state
	useEffect(() => {
		if (data?.data?.length) {
			setNotifications((prev) => {
				const ids = new Set(prev.map((n) => n._id))
				const merged = [...prev, ...data.data.filter((n) => !ids.has(n._id))]
				return merged
			})
			setHasMore(data.meta?.totalPages > page) // giả sử API trả meta.totalPages
		}
	}, [data, page])

	// Connect socket
	useEffect(() => {
		if (!userId) return
		socketService.connect(userId, NOTIFICATION_NS)
		return () => {
			socketService.disconnect(NOTIFICATION_NS)
		}
	}, [userId])

	// Subscribe socket events
	useEffect(() => {
		const unsubNew = socketService.on(NOTIFICATION_NS, NotificationEvent.NEW, (newNoti: NotificationItem) => {
			setNotifications((prev) => [newNoti, ...prev.filter((n) => n._id !== newNoti._id)])
		})

		const unsubRead = socketService.on(NOTIFICATION_NS, NotificationEvent.MARKED_READ, (notificationId: string) => {
			setNotifications((prev) => prev.map((n) => (n._id === notificationId ? { ...n, isRead: true } : n)))
		})

		const unsubReadAll = socketService.on(NOTIFICATION_NS, NotificationEvent.MARK_READ_ALL, () => {
			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
		})

		return () => {
			unsubNew()
			unsubRead()
			unsubReadAll()
		}
	}, [])

	// Methods
	const markAsRead = useCallback((id: string) => {
		socketService.emit(NOTIFICATION_NS, NotificationEvent.MARKED_READ, { notificationId: id })
		setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
	}, [])

	const markAllAsRead = useCallback(() => {
		socketService.emit(NOTIFICATION_NS, NotificationEvent.MARK_READ_ALL, {})
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
	}, [])

	const loadMore = useCallback(() => {
		if (!hasMore) return
		setPage((prev) => prev + 1)
	}, [hasMore])

	const refresh = useCallback(() => {
		setPage(1)
		setNotifications([])
		refetch()
	}, [refetch])

	const unreadCount = notifications.filter((n) => !n.isRead).length

	const value: NotificationSocketContextValue = {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		loadMore,
		hasMore,
		refresh
	}

	return <NotificationSocketContext.Provider value={value}>{children}</NotificationSocketContext.Provider>
}

export { NotificationSocketContext }
