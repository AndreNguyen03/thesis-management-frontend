import type { Middleware } from '@reduxjs/toolkit'
import { connectSocket, disconnectSocket } from '../slices/socket-slice'
import { io, Socket } from 'socket.io-client'
import type { NotificationItem } from '@/models/notification.model'
import { setNotifications } from '../slices/notification-slice'

export const socketMiddleware: Middleware = (store) => {
	let socket: Socket | null = null

	return (next) => (action: any) => {
		// 1. Xử lý kết nối
		if (connectSocket.match(action)) {
			if (socket) return next(action) // nếu đã có socket thì không tạo lại
			const token = sessionStorage.getItem('accessToken')
			socket = io('http://localhost:3000/notifications', {
				auth: { token },
				transports: ['websocket']
			}) // Lắng nghe sự kiện kết nối
			socket.on('connect', () => {
				console.log('🟢 Connected to WebSocket')
			})

			//lắng nghe các sự kiện khác của socket ở đây
			socket.on('notification', (data: NotificationItem) => {
				store.dispatch(setNotifications([data, ...store.getState().notification.notifications]))
				console.log('New notification received via WebSocket', data)
			})
		}

		// 2. Xử lý ngắt kết nối
		if (disconnectSocket.match(action)) {
			if (socket) {
				socket.disconnect()
				socket = null
				console.log('🔴 Disconnected WebSocket')
			}
		}
		return next(action)
	}
}
