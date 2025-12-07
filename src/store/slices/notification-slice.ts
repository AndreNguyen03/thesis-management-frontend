import { MOCK_NOTIFICATIONS, type NotificationItem } from '@/models/notification.model'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { io, type Socket } from 'socket.io-client'

interface NotificationState {
	notifications: NotificationItem[]
}
const initialState: NotificationState = {
	notifications: MOCK_NOTIFICATIONS
}
const notificationSlice = createSlice({
	name: 'notification',
	initialState,
	reducers: {
		setNotifications: (state, action: PayloadAction<NotificationItem[]>) => {
			state.notifications = action.payload
		}
	}
})

export const { setNotifications } = notificationSlice.actions
export default notificationSlice
