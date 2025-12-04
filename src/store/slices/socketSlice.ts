import { createSlice } from '@reduxjs/toolkit'
import { io, type Socket } from 'socket.io-client'

interface SocketState {
	onlineUsers: string[]
}
const initialState: SocketState = {
	onlineUsers: []
}
const bareUrl = import.meta.env.VITE_SOCKET_URL
let socket: Socket | null = null
const socketSlice = createSlice({
	name: 'socket',
	initialState,
	reducers: {
		connectSocket: (state) => {
			//lấy accessToken từ sessionStorage
			const token = sessionStorage.getItem('accessToken')
			const existingSocket = socket
			//tránh tạo nhiều socket
			if (existingSocket) return
			socket = io(bareUrl, {
				auth: {
					token: `${token}`
				},
				transports: ['websocket']
			})
			socket.on('connect', () => {
				console.log('🟢 [WebSocket] Connected to Notification Server')
			})
		},
		disconnectSocket: (state) => {
            if(socket) {
                socket.disconnect()
                socket = null
                console.log('🔴 [WebSocket] Disconnected from Notification Server')
            }
        }
	}
})

export const { connectSocket, disconnectSocket } = socketSlice.actions

export default socketSlice.reducer
