import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { io, type Socket } from 'socket.io-client'

interface SocketState {
	isConnected: boolean
	onlineUsers: string[]
}
const initialState: SocketState = {
	isConnected: false,
	onlineUsers: []
}
const socketSlice = createSlice({
	name: 'socket',
	initialState,
	reducers: {
		connectSocket: (state) => {
			state.isConnected = true
		},
		disconnectSocket: (state) => {
			state.isConnected = false
			state.onlineUsers = []
		},
		setOnlineUsers: (state, action: PayloadAction<string[]>) => {
			state.onlineUsers = action.payload
		}
	}
})

export const { connectSocket, disconnectSocket } = socketSlice.actions
export default socketSlice
