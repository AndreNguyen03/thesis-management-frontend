import { io, Socket } from 'socket.io-client'

let socket: Socket | null = null

export const connectSocket = (token: string) => {
	if (socket && socket.connected) return socket

	socket = io(import.meta.env.VITE_SOCKET_URL, {
		auth: { token },
		transports: ['websocket']
	})
	return socket
}

export const disconnectSocket = () => {
	if (socket) {
		socket.disconnect()
		socket = null
	}
}

// Hàm quan trọng: Đợi socket sẵn sàng để RTK Query sử dụng
export const waitForSocket = (interval = 500, maxAttempts = 10): Promise<Socket | null> => {
	return new Promise((resolve) => {
		let attempts = 0
		const check = () => {
			if (socket && socket.connected) resolve(socket)
			else if (attempts >= maxAttempts) resolve(null)
			else {
				attempts++
				setTimeout(check, interval)
			}
		}
		check()
	})
}
