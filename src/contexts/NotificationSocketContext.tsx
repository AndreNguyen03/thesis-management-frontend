// /* eslint-disable @typescript-eslint/no-explicit-any */
// // contexts/NotificationSocketContext.tsx
// import React, { createContext, useContext, useEffect, useState } from 'react'
// import { socketService } from '@/services/socket.service'
// import type { NotificationItem } from '@/models/notification.model'
// import { notificationApi } from '@/services/notificationApi'
// import { useDispatch } from 'react-redux'

// const NOTIFICATION_NS = '/notification'

// /* ================= TYPES ================= */

// interface NotificationSocketContextValue {
// 	notifications: NotificationItem[]
// 	unreadCount: number
// 	isConnected: boolean
// 	markAsRead: (notificationId: string) => void
// 	markAllAsRead: () => void
// 	refetch: () => void
// }

// /* ================= CONTEXT ================= */

// const NotificationSocketContext = createContext<NotificationSocketContextValue | null>(null)

// /* ================= PROVIDER ================= */

// export const NotificationSocketProvider: React.FC<{
// 	userId: string
// 	children: React.ReactNode
// }> = ({ userId, children }) => {
// 	const [notifications, setNotifications] = useState<NotificationItem[]>([])
// 	const [isConnected, setIsConnected] = useState(false)
// 	const dispatch = useDispatch()

// 	/* ========== CONNECT SOCKET ========== */
// 	useEffect(() => {
// 		if (!userId) return

// 		console.log('🔔 Connecting to notification socket...')
// 		const socket = socketService.connect(userId, NOTIFICATION_NS)

// 		// Track connection status
// 		const handleConnect = () => {
// 			console.log('✅ Notification socket connected')
// 			setIsConnected(true)
// 		}

// 		const handleDisconnect = () => {
// 			console.log('❌ Notification socket disconnected')
// 			setIsConnected(false)
// 		}

// 		socket.on('connect', handleConnect)
// 		socket.on('disconnect', handleDisconnect)

// 		setIsConnected(socket.connected)

// 		return () => {
// 			socket.off('connect', handleConnect)
// 			socket.off('disconnect', handleDisconnect)
// 			socketService.disconnect(NOTIFICATION_NS)
// 		}
// 	}, [userId])

// 	/* ========== SUBSCRIBE TO NEW NOTIFICATIONS ========== */
// 	useEffect(() => {
// 		const unsubscribe = socketService.on(NOTIFICATION_NS, 'new_notification', (notification: NotificationItem) => {
// 			console.log('🔔 New notification received:', notification)

// 			// Thêm notification mới vào đầu list
// 			setNotifications((prev) => [notification, ...prev])

// 			// Invalidate cache để refetch notifications
// 			dispatch(notificationApi.util.invalidateTags([{ type: 'Notification', id: 'LIST' }]))

// 			// Optional: Show toast notification
// 			// toast({
// 			//   title: notification.title,
// 			//   description: notification.message,
// 			//   variant: notification.type === 'ERROR' ? 'destructive' : 'default'
// 			// })
// 		})

// 		return unsubscribe
// 	}, [dispatch])

// 	/* ========== SUBSCRIBE TO NOTIFICATION READ ========== */
// 	useEffect(() => {
// 		const unsubscribe = socketService.on(
// 			NOTIFICATION_NS,
// 			'notification_read',
// 			(data: { notificationId: string }) => {
// 				console.log('👁️ Notification marked as read:', data.notificationId)

// 				// Update local state
// 				setNotifications((prev) =>
// 					prev.map((n) => (n._id === data.notificationId ? { ...n, isRead: true } : n))
// 				)

// 				// Invalidate cache
// 				dispatch(notificationApi.util.invalidateTags([{ type: 'Notification', id: 'LIST' }]))
// 			}
// 		)

// 		return unsubscribe
// 	}, [dispatch])

// 	/* ========== SUBSCRIBE TO ALL NOTIFICATIONS READ ========== */
// 	useEffect(() => {
// 		const unsubscribe = socketService.on(NOTIFICATION_NS, 'all_notifications_read', () => {
// 			console.log('👁️ All notifications marked as read')

// 			// Update local state
// 			setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))

// 			// Invalidate cache
// 			dispatch(notificationApi.util.invalidateTags([{ type: 'Notification', id: 'LIST' }]))
// 		})

// 		return unsubscribe
// 	}, [dispatch])

// 	/* ========== METHODS ========== */

// 	const markAsRead = (notificationId: string) => {
// 		socketService.emit(NOTIFICATION_NS, 'mark_notification_read', {
// 			notificationId
// 		})
// 	}

// 	const markAllAsRead = () => {
// 		socketService.emit(NOTIFICATION_NS, 'mark_all_notifications_read')
// 	}

// 	const refetch = () => {
// 		// Invalidate cache để refetch notifications
// 		dispatch(notificationApi.util.invalidateTags([{ type: 'Notification', id: 'LIST' }]))
// 	}

// 	/* ========== COMPUTED VALUES ========== */ 

// 	const unreadCount = notifications.filter((n) => !n.isRead).length

// 	/* ========== CONTEXT VALUE ========== */

// 	const value: NotificationSocketContextValue = {
// 		notifications,
// 		unreadCount,
// 		isConnected,
// 		markAsRead,
// 		markAllAsRead,
// 		refetch
// 	}

// 	return <NotificationSocketContext.Provider value={value}>{children}</NotificationSocketContext.Provider>
// }

// /* ================= HOOK ================= */

// export const useNotificationSocket = () => {
// 	const context = useContext(NotificationSocketContext)
// 	if (!context) {
// 		throw new Error('useNotificationSocket must be used within NotificationSocketProvider')
// 	}
// 	return context
// }
