/* eslint-disable @typescript-eslint/no-explicit-any */
// context/ChatContext.tsx
import React, { createContext, useEffect, useMemo, useState } from 'react'
import { socketService } from '@/services/socket.service'

const CHAT_NS = '/chat'

/* ================= TYPES ================= */

export interface ChatMessage {
	_id: string
	groupId: string
	senderId: string
	content: string
	type: 'text' | 'file' | 'image'
	attachments: string[]
	replyTo?: string
	createdAt: string
	status?: 'sending' | 'sent' | 'delivered' | 'seen'
	clientTempId?: string
	lastSeenAtByUser?: Record<string, string>
}

interface UserStatusChangePayload {
	groupId: string
	userId: string
	status: 'online' | 'offline'
	onlineUsers: string[]
	timestamp: string
}

interface TypingPayload {
	groupId: string
	userId: string
	isTyping: boolean
}

interface SeenPayload {
	groupId: string
	userId: string
	seenAt: string
}

interface ChatContextValue {
	messagesByGroup: Record<string, ChatMessage[]>
	onlineUsersByGroup: Record<string, string[]>
	typingUsersByGroup: Record<string, string[]>

	sendGroupMessage: (data: {
		groupId: string
		content: string
		type?: 'text' | 'file' | 'image'
		attachments?: string[]
		replyTo?: string
	}) => void

	sendTyping: (groupId: string, isTyping: boolean) => void
	markGroupSeen: (groupId: string) => void
}

/* ================= CONTEXT ================= */

const ChatContext = createContext<ChatContextValue | null>(null)

/* ================= PROVIDER ================= */

const ChatProvider: React.FC<{
	userId: string
	children: React.ReactNode
}> = ({ userId, children }) => {
	const [messagesByGroup, setMessagesByGroup] = useState<Record<string, ChatMessage[]>>({})
	const [onlineUsersByGroup, setOnlineUsersByGroup] = useState<Record<string, string[]>>({})
	const [typingUsersByGroup, setTypingUsersByGroup] = useState<Record<string, string[]>>({})

	/* ========== CONNECT SOCKET ========== */
	useEffect(() => {
		if (!userId) return

		socketService.connect(userId, CHAT_NS)

		return () => {
			socketService.disconnect(CHAT_NS)
		}
	}, [userId])

	/* ========== SUBSCRIBE EVENTS ========== */
	useEffect(() => {
		const unsubNewMessage = socketService.on(
			CHAT_NS,
			'new_group_message',
			(message: ChatMessage & { clientTempId?: string }) => {
				setMessagesByGroup((prev) => {
					const groupId = message.groupId
					if (!groupId) return prev // bảo vệ nếu message.groupId undefined
					const list = prev[groupId] ?? []

					const exists = list.some(
						(m) =>
							(message.clientTempId && m.clientTempId === message.clientTempId) || m._id === message._id
					)
					if (exists) {
						return {
							...prev,
							[groupId]: list.map((m) =>
								m.clientTempId === message.clientTempId || m._id === message._id
									? { ...message, status: 'delivered' }
									: m
							)
						}
					}

					// Push mới nếu chưa tồn tại
					return { ...prev, [groupId]: [...list, message] }
				})
			}
		)

		const unsubUserStatus = socketService.on(CHAT_NS, 'user_status_change', (payload: UserStatusChangePayload) => {
			setOnlineUsersByGroup((prev) => ({
				...prev,
				[payload.groupId]: payload.onlineUsers
			}))

			// 🔔 Update delivered status
			setMessagesByGroup((prev) => {
				const messages = prev[payload.groupId] ?? []
				const hasOtherOnline = payload.onlineUsers.some((id) => id !== userId)

				if (!hasOtherOnline) return prev

				return {
					...prev,
					[payload.groupId]: messages.map((m) =>
						m.senderId === userId && m.status === 'sent' ? { ...m, status: 'delivered' } : m
					)
				}
			})

			// cleanup typing users
			setTypingUsersByGroup((prev) => {
				const current = prev[payload.groupId] ?? []
				return {
					...prev,
					[payload.groupId]: current.filter((id) => payload.onlineUsers.includes(id))
				}
			})
		})

		const unsubTyping = socketService.on(CHAT_NS, 'user_typing', (payload: TypingPayload) => {
			const { groupId, userId: typingUserId, isTyping } = payload

			setTypingUsersByGroup((prev) => {
				const current = prev[groupId] ?? []

				// không cho user tự thấy mình typing
				if (typingUserId === userId) return prev

				if (isTyping) {
					return {
						...prev,
						[groupId]: Array.from(new Set([...current, typingUserId]))
					}
				}

				return {
					...prev,
					[groupId]: current.filter((id) => id !== typingUserId)
				}
			})
		})

		const unsubSeen = socketService.on(CHAT_NS, 'group_message_seen', (payload: SeenPayload) => {
			setMessagesByGroup((prev) => {
				const list = prev[payload.groupId] ?? []

				return {
					...prev,
					[payload.groupId]: list.map((m) => {
						const mDate = new Date(m.createdAt)
						const seenDate = new Date(payload.seenAt)

						// 🔹 kiểm tra hợp lệ
						if (isNaN(mDate.getTime()) || isNaN(seenDate.getTime())) {
							console.warn('Invalid date detected', m.createdAt, payload.seenAt)
							return m
						}

						return mDate <= seenDate
							? {
									...m,
									status: 'seen',
									lastSeenAtByUser: {
										...m.lastSeenAtByUser,
										[payload.userId]: payload.seenAt
									}
								}
							: m
					})
				}
			})
		})

		return () => {
			unsubNewMessage()
			unsubUserStatus()
			unsubTyping()
			unsubSeen()
		}
	}, [])

	/* ========== ACTIONS (EMIT) ========== */

	const sendGroupMessage: ChatContextValue['sendGroupMessage'] = (data) => {
		if (!data.groupId) {
			console.error('❌ sendGroupMessage without groupId', data)
			return
		}
		const clientTempId = crypto.randomUUID()

		const optimisticMessage: ChatMessage = {
			_id: clientTempId,
			clientTempId,
			groupId: data.groupId,
			senderId: userId,
			content: data.content,
			type: data.type ?? 'text',
			attachments: data.attachments ?? [],
			replyTo: data.replyTo,
			createdAt: new Date().toISOString(),
			status: 'sending',
            lastSeenAtByUser: {}
		}

		// 1️⃣ Optimistic push
		setMessagesByGroup((prev) => ({
			...prev,
			[data.groupId]: [...(prev[data.groupId] ?? []), optimisticMessage]
		}))

		// 2️⃣ Emit kèm clientTempId
		socketService.emit(CHAT_NS, 'send_group_message', {
			...data,
			clientTempId
		})
	}

	const sendTyping = (groupId: string, isTyping: boolean) => {
		socketService.emit(CHAT_NS, 'typing', { groupId, isTyping })
	}

	// ================== Seen ==================
	const markGroupSeen = (groupId: string) => {
		socketService.emit(CHAT_NS, 'group_message_seen', { groupId })
	}

	const value = useMemo(
		() => ({
			messagesByGroup,
			onlineUsersByGroup,
			sendGroupMessage,
			sendTyping,
			typingUsersByGroup,
			markGroupSeen
		}),
		[messagesByGroup, onlineUsersByGroup, typingUsersByGroup]
	)

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export { ChatContext, ChatProvider }
