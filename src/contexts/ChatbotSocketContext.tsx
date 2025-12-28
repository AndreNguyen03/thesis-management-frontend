/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { socketService } from '@/services/socket.service'
import type { CrawlProgress } from '@/models/chatbot-resource.model'

const CHATBOT_NS = '/chatbot'

/* ================= TYPES ================= */

interface ChatbotSocketContextValue {
	isConnected: boolean
	joinAdminRoom: () => void
	leaveAdminRoom: () => void
	onCrawlProgress: (callback: (data: CrawlProgress) => void) => () => void
	onCrawlCompleted: (callback: (data: CrawlProgress) => void) => () => void
	onCrawlFailed: (callback: (data: CrawlProgress) => void) => () => void
	onEmbeddingProgress: (callback: (data: CrawlProgress) => void) => () => void
	onEmbeddingCompleted: (callback: (data: CrawlProgress) => void) => () => void
	onResourceCreated: (callback: (data: any) => void) => () => void
	onResourceUpdated: (callback: (data: any) => void) => () => void
	onResourceDeleted: (callback: (data: { resourceId: string }) => void) => () => void
}

/* ================= CONTEXT ================= */

const ChatbotSocketContext = createContext<ChatbotSocketContextValue | null>(null)

/* ================= PROVIDER ================= */

export const ChatbotSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [isConnected, setIsConnected] = useState(false)

	useEffect(() => {
		const socket = socketService.getSocket(CHATBOT_NS)

		if (!socket) {
			console.error('⚠️ ChatbotSocket: socket not initialized')
			return
		}

		const handleConnect = () => {
			console.log('✅ ChatbotSocket: connected')
			setIsConnected(true)
		}

		const handleDisconnect = () => {
			console.log('❌ ChatbotSocket: disconnected')
			setIsConnected(false)
		}

		socket.on('connect', handleConnect)
		socket.on('disconnect', handleDisconnect)

		if (socket.connected) {
			handleConnect()
		}

		return () => {
			socket.off('connect', handleConnect)
			socket.off('disconnect', handleDisconnect)
		}
	}, [])

	// Join/Leave admin room
	const joinAdminRoom = useCallback(() => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (socket?.connected) {
			socket.emit('join:chatbot-admin', { roomId: 'chatbot-admin' })
			console.log('🚪 ChatbotSocket: joined admin room')
		}
	}, [])

	const leaveAdminRoom = useCallback(() => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (socket?.connected) {
			socket.emit('leave:chatbot-admin', { roomId: 'chatbot-admin' })
			console.log('🚪 ChatbotSocket: left admin room')
		}
	}, [])

	// Event listeners
	const onCrawlProgress = useCallback((callback: (data: CrawlProgress) => void) => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (!socket) return () => {}

		socket.on('crawl:progress', callback)
		return () => {
			socket.off('crawl:progress', callback)
		}
	}, [])

	const onCrawlCompleted = useCallback((callback: (data: CrawlProgress) => void) => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (!socket) return () => {}

		socket.on('crawl:completed', callback)
		return () => {
			socket.off('crawl:completed', callback)
		}
	}, [])

	const onCrawlFailed = useCallback((callback: (data: CrawlProgress) => void) => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (!socket) return () => {}

		socket.on('crawl:failed', callback)
		return () => {
			socket.off('crawl:failed', callback)
		}
	}, [])

	const onEmbeddingProgress = useCallback((callback: (data: CrawlProgress) => void) => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (!socket) return () => {}

		socket.on('embedding:progress', callback)
		return () => {
			socket.off('embedding:progress', callback)
		}
	}, [])

	const onEmbeddingCompleted = useCallback((callback: (data: CrawlProgress) => void) => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (!socket) return () => {}

		socket.on('embedding:completed', callback)
		return () => {
			socket.off('embedding:completed', callback)
		}
	}, [])

	const onResourceCreated = useCallback((callback: (data: any) => void) => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (!socket) return () => {}

		socket.on('resource:created', callback)
		return () => {
			socket.off('resource:created', callback)
		}
	}, [])

	const onResourceUpdated = useCallback((callback: (data: any) => void) => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (!socket) return () => {}

		socket.on('resource:updated', callback)
		return () => {
			socket.off('resource:updated', callback)
		}
	}, [])

	const onResourceDeleted = useCallback((callback: (data: { resourceId: string }) => void) => {
		const socket = socketService.getSocket(CHATBOT_NS)
		if (!socket) return () => {}

		socket.on('resource:deleted', callback)
		return () => {
			socket.off('resource:deleted', callback)
		}
	}, [])

	return (
		<ChatbotSocketContext.Provider
			value={{
				isConnected,
				joinAdminRoom,
				leaveAdminRoom,
				onCrawlProgress,
				onCrawlCompleted,
				onCrawlFailed,
				onEmbeddingProgress,
				onEmbeddingCompleted,
				onResourceCreated,
				onResourceUpdated,
				onResourceDeleted
			}}
		>
			{children}
		</ChatbotSocketContext.Provider>
	)
}

/* ================= HOOK ================= */

export const useChatbotSocket = () => {
	const context = useContext(ChatbotSocketContext)
	if (!context) {
		throw new Error('useChatbotSocket must be used within ChatbotSocketProvider')
	}
	return context
}
