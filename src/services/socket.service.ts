/* eslint-disable @typescript-eslint/no-explicit-any */
// services/socket.service.ts
import { io, Socket } from 'socket.io-client'

/**
 * Multi-Namespace Socket Service - Singleton pattern
 * Quản lý nhiều socket connections cho các namespaces khác nhau
 */
class SocketService {
	private sockets: Map<string, Socket> = new Map() // namespace -> socket
	private userId: string | null = null
	private baseUrl: string
	private reconnectAttempts: Map<string, number> = new Map()
	private maxReconnectAttempts: number = 5

	constructor() {
		this.baseUrl = 'http://localhost:3000'
	}

	/**
	 * Connect đến một namespace
	 * @param userId - ID của user hiện tại
	 * @param namespace - Namespace name (vd: '/chat', '/notification')
	 * @param options - Config options
	 */
	connect(
		userId: string,
		namespace: string = '/chat',
		options?: {
			url?: string
			autoConnect?: boolean
		}
	): Socket {
		// Kiểm tra đã connect namespace này chưa
		const existingSocket = this.sockets.get(namespace)
		if (existingSocket?.connected && this.userId === userId) {
			console.log(`✅ Socket already connected to ${namespace}`)
			return existingSocket
		}

		// Nếu user changed, disconnect all old sockets
		if (this.userId && this.userId !== userId) {
			console.log('🔄 User changed, disconnecting all sockets...')
			this.disconnectAll()
		}

		this.userId = userId
		const url = options?.url || this.baseUrl

		console.log(`🔌 Connecting to ${url}${namespace}...`)

		const socket = io(`${url}${namespace}`, {
			auth: { userId },
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionAttempts: this.maxReconnectAttempts,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 20000,
			autoConnect: options?.autoConnect ?? true
		})

		// Setup listeners cho namespace này
		this.setupListeners(socket, namespace)

		// Lưu socket
		this.sockets.set(namespace, socket)
		this.reconnectAttempts.set(namespace, 0)

		return socket
	}

	connectAdmin(
		namespace: string = '/chat',
		options?: {
			url?: string
			autoConnect?: boolean
		}
	): Socket {
		// Kiểm tra đã connect namespace này chưa
		const existingSocket = this.sockets.get(namespace)
		if (existingSocket?.connected) {
			console.log(`✅ Admin socket already connected to ${namespace}`)
			return existingSocket
		}

		const url = options?.url || this.baseUrl
		console.log(`🔌 Connecting admin socket to ${url}${namespace}...`)

		const socket = io(`${url}${namespace}`, {
			transports: ['websocket', 'polling'],
			reconnection: true,
			reconnectionAttempts: this.maxReconnectAttempts,
			reconnectionDelay: 1000,
			reconnectionDelayMax: 5000,
			timeout: 20000,
			autoConnect: options?.autoConnect ?? true
		})

		// Setup listeners đầy đủ
		socket.on('connect', () => {
			console.log(`✅ [${namespace}] Admin socket connected:`, socket.id)
			this.reconnectAttempts.set(namespace, 0)
			// Join admin room ngay khi connect
			socket.emit('join-admin')
		})

		socket.on('disconnect', (reason) => {
			console.log(`❌ [${namespace}] Admin socket disconnected:`, reason)
			if (reason === 'io server disconnect') {
				socket.connect()
			}
		})

		socket.on('connect_error', (error) => {
			console.error(`⚠️ [${namespace}] Admin connection error:`, error.message)
			const attempts = (this.reconnectAttempts.get(namespace) || 0) + 1
			this.reconnectAttempts.set(namespace, attempts)
			if (attempts >= this.maxReconnectAttempts) {
				console.error(`❌ [${namespace}] Admin max reconnect attempts reached`)
			}
		})

		socket.io.on('reconnect_attempt', (attempt) => {
			console.log(`🔄 [${namespace}] Admin reconnect attempt ${attempt}...`)
		})

		socket.io.on('reconnect', (attempt) => {
			console.log(`✅ [${namespace}] Admin reconnected after ${attempt} attempts`)
			this.reconnectAttempts.set(namespace, 0)
		})

		socket.io.on('reconnect_failed', () => {
			console.error(`❌ [${namespace}] Admin reconnection failed`)
		})

		// Lưu socket
		this.sockets.set(namespace, socket)
		this.reconnectAttempts.set(namespace, 0)

		return socket
	}

	/**
	 * Setup event listeners cho một socket
	 */
	private setupListeners(socket: Socket, namespace: string): void {
		socket.on('connect', () => {
			console.log(`✅ [${namespace}] Socket connected:`, socket.id)
			this.reconnectAttempts.set(namespace, 0)
		})

		socket.on('disconnect', (reason) => {
			console.log(`❌ [${namespace}] Socket disconnected:`, reason)

			if (reason === 'io server disconnect') {
				socket.connect()
			}
		})

		socket.on('connect_error', (error) => {
			console.error(`⚠️ [${namespace}] Connection error:`, error.message)

			const attempts = (this.reconnectAttempts.get(namespace) || 0) + 1
			this.reconnectAttempts.set(namespace, attempts)

			if (attempts >= this.maxReconnectAttempts) {
				console.error(`❌ [${namespace}] Max reconnect attempts reached`)
			}
		})

		socket.io.on('reconnect_attempt', (attempt) => {
			console.log(`🔄 [${namespace}] Reconnect attempt ${attempt}...`)
		})

		socket.io.on('reconnect', (attempt) => {
			console.log(`✅ [${namespace}] Reconnected after ${attempt} attempts`)
			this.reconnectAttempts.set(namespace, 0)
		})

		socket.io.on('reconnect_failed', () => {
			console.error(`❌ [${namespace}] Reconnection failed`)
		})
	}

	/**
	 * Lấy socket của một namespace cụ thể
	 */
	getSocket(namespace: string = '/chat'): Socket | null {
		return this.sockets.get(namespace) || null
	}

	/**
	 * Lấy tất cả sockets
	 */
	getAllSockets(): Map<string, Socket> {
		return this.sockets
	}

	/**
	 * Emit event đến một namespace
	 */
	emit(namespace: string, event: string, data?: any, callback?: (response: any) => void): void {
		const socket = this.sockets.get(namespace)

		if (!socket) {
			console.error(`❌ Socket for namespace ${namespace} not initialized`)
			return
		}

		if (!socket.connected) {
			console.warn(`⚠️ Socket ${namespace} not connected. Event will be queued.`)
		}

		if (callback) {
			socket.emit(event, data, callback)
		} else {
			socket.emit(event, data)
		}
	}

	/**
	 * Subscribe to event trong một namespace
	 */
	on(namespace: string, event: string, handler: (...args: any[]) => void): () => void {
		const socket = this.sockets.get(namespace)

		if (!socket) {
			console.error(`❌ Socket for namespace ${namespace} not initialized`)
			return () => {}
		}

		socket.on(event, handler)

		// Return cleanup function
		return () => {
			socket.off(event, handler)
		}
	}

	/**
	 * Unsubscribe khỏi event
	 */
	off(namespace: string, event: string, handler?: (...args: any[]) => void): void {
		const socket = this.sockets.get(namespace)
		if (!socket) return

		if (handler) {
			socket.off(event, handler)
		} else {
			socket.off(event)
		}
	}

	/**
	 * Disconnect một namespace cụ thể
	 */
	disconnect(namespace: string): void {
		const socket = this.sockets.get(namespace)

		if (socket) {
			console.log(`🔌 Disconnecting ${namespace}...`)
			socket.disconnect()
			this.sockets.delete(namespace)
			this.reconnectAttempts.delete(namespace)
		}
	}

	/**
	 * Disconnect tất cả namespaces (khi logout)
	 */
	disconnectAll(): void {
		console.log('🔌 Disconnecting all sockets...')

		this.sockets.forEach((socket, namespace) => {
			console.log(`  Disconnecting ${namespace}...`)
			socket.disconnect()
		})

		this.sockets.clear()
		this.reconnectAttempts.clear()
		this.userId = null
	}

	/**
	 * Reconnect một namespace
	 */
	reconnect(namespace: string): void {
		const socket = this.sockets.get(namespace)

		if (socket && !socket.connected) {
			console.log(`🔄 Reconnecting ${namespace}...`)
			socket.connect()
		}
	}

	/**
	 * Reconnect tất cả namespaces
	 */
	reconnectAll(): void {
		this.sockets.forEach((socket, namespace) => {
			if (!socket.connected) {
				console.log(`🔄 Reconnecting ${namespace}...`)
				socket.connect()
			}
		})
	}

	/**
	 * Kiểm tra connection status của một namespace
	 */
	isConnected(namespace: string): boolean {
		const socket = this.sockets.get(namespace)
		return socket?.connected || false
	}

	/**
	 * Kiểm tra tất cả namespaces có connected không
	 */
	isAllConnected(): boolean {
		if (this.sockets.size === 0) return false

		return Array.from(this.sockets.values()).every((socket) => socket.connected)
	}

	/**
	 * Get current userId
	 */
	getUserId(): string | null {
		return this.userId
	}

	/**
	 * Get socket ID của một namespace
	 */
	getSocketId(namespace: string): string | undefined {
		return this.sockets.get(namespace)?.id
	}

	/**
	 * Get tất cả namespaces đang connected
	 */
	getConnectedNamespaces(): string[] {
		const connected: string[] = []

		this.sockets.forEach((socket, namespace) => {
			if (socket.connected) {
				connected.push(namespace)
			}
		})

		return connected
	}
}

// Export singleton instance
export const socketService = new SocketService()

// Export class
export { SocketService }
