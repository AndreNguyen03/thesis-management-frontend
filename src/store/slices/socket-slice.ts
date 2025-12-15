import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { io, type Socket } from 'socket.io-client'

interface RoomOnlineUsers {
	roomId: string
	users: string[] // User IDs online trong room
}

interface SocketState {
	isConnected: boolean
	onlineUsers: string[] // Global online users (toàn app, optional nếu không cần)
	currentRoom: string | null // Room đang active (group._id)
	roomOnlineUsers: Record<string, string[]> // Per-room: { groupId: [userIds online] }
}

const initialState: SocketState = {
	isConnected: false,
	onlineUsers: [],
	currentRoom: null,
	roomOnlineUsers: {}
}

const socketSlice = createSlice({
	name: 'socket',
	initialState,
	reducers: {
		// Global connect/disconnect (giữ nguyên)
		connectSocket: (state) => {
			state.isConnected = true
		},
		disconnectSocket: (state) => {
			state.isConnected = false
			state.onlineUsers = []
			state.currentRoom = null
			state.roomOnlineUsers = {} // Clear all rooms khi disconnect
		},
		setOnlineUsers: (state, action: PayloadAction<string[]>) => {
			state.onlineUsers = action.payload // Global
		},
		// Per-room reducers mới
		joinRoom: (state, action: PayloadAction<string>) => {
			const roomId = action.payload
			if (state.currentRoom) {
				// Leave old room (optional, BE handle emit)
				delete state.roomOnlineUsers[state.currentRoom]
			}
			state.currentRoom = roomId
			if (!state.roomOnlineUsers[roomId]) {
				state.roomOnlineUsers[roomId] = [] // Init empty
			}
		},
		leaveRoom: (state) => {
			const roomId = state.currentRoom
			if (roomId) {
				delete state.roomOnlineUsers[roomId]
				state.currentRoom = null
			}
		},
		setRoomOnlineUsers: (state, action: PayloadAction<{ roomId: string; users: string[] }>) => {
			const { roomId, users } = action.payload
			state.roomOnlineUsers[roomId] = users // Update per-room online list
		}
	}
})

export const { connectSocket, disconnectSocket, setOnlineUsers, joinRoom, leaveRoom, setRoomOnlineUsers } =
	socketSlice.actions
export default socketSlice.reducer
