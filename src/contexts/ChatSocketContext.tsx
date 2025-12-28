/* eslint-disable @typescript-eslint/no-explicit-any */
// context/ChatContext.tsx
import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { socketService } from '@/services/socket.service'
import type { DirectSidebarGroup, GroupSidebar, MessageDto } from '@/models/groups.model'
import { groupApi } from '@/services/groupApi'
import { store } from '@/store'

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

interface GroupLastMessagePayload {
	groupId: string
	lastMessage: {
		content: string
		senderId: string
		createdAt: string
	}
}

// interface GroupUnreadUpdatePayload {
// 	groupId: string
// 	userId: string
// }

// interface GroupSeenUpdatePayload {
// 	groupId: string
// 	userId: string
// 	seenAt: string
// }

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

	fetchGroupMessages: (groupId: string, limit?: number, before?: string) => Promise<ChatMessage[]>
	searchGroupMessages: (groupId: string, keyword: string, limit?: number) => Promise<ChatMessage[]>

	markAllMessagesAsSeenLocal: (groupId: string) => void
	hasUnreadDirect: boolean
	setHasUnreadDirect: React.Dispatch<React.SetStateAction<boolean>>
	groupSidebars: GroupSidebar[]
	setGroupSidebars: React.Dispatch<React.SetStateAction<GroupSidebar[]>>
	directSidebars: DirectSidebarGroup[]
	setDirectSidebars: React.Dispatch<React.SetStateAction<DirectSidebarGroup[]>>
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
	const [groupSidebars, setGroupSidebars] = useState<GroupSidebar[]>([])
	const [directSidebars, setDirectSidebars] = useState<DirectSidebarGroup[]>([])
	const [hasUnreadDirect, setHasUnreadDirect] = useState(false)

	/* ====== RTK Query lazy hook ====== */
	const [triggerFetchGroupMessages] = groupApi.useLazyGetGroupMessagesQuery()
	const [triggerSearchGroupMessages] = groupApi.useLazySearchGroupMessagesQuery()
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
        console.log('group sidebar :::', groupSidebars)
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
				if (message.senderId !== userId) {
					setHasUnreadDirect(true)
				}
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

		/* ========== SIDEBAR EVENTS ========== */

		const unsubGroupLastMessage = socketService.on(
			CHAT_NS,
			'group:last_message',
			(payload: GroupLastMessagePayload) => {
				setGroupSidebars((prev) =>
					prev.map((g) => {
						if (g._id !== payload.groupId) return g

						const sender = g.participants.find((p) => p.id === payload.lastMessage.senderId)

						return {
							...g,
							lastMessage: {
								...payload.lastMessage,
								fullName: sender?.fullName
							},
							updatedAt: payload.lastMessage.createdAt
						}
					})
				)
			}
		)

		const unsubDirectLastMessage = socketService.on(
			CHAT_NS,
			'direct:last_message',
			(payload: GroupLastMessagePayload) => {
				setDirectSidebars((prev) =>
					prev.map((g) => {
						if (g._id !== payload.groupId) return g

						return {
							...g,
							lastMessage: {
								...payload.lastMessage
							},
							updatedAt: payload.lastMessage.createdAt
						}
					})
				)
			}
		)

		return () => {
			unsubNewMessage()
			unsubUserStatus()
			unsubTyping()
			unsubSeen()

			unsubGroupLastMessage()
			unsubDirectLastMessage()
		}
	}, [userId])

	/* ========== ACTIONS (EMIT) ========== */

	const sendGroupMessage: ChatContextValue['sendGroupMessage'] = useCallback(
		(data) => {
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
		},
		[userId]
	)

	const sendTyping = (groupId: string, isTyping: boolean) => {
		socketService.emit(CHAT_NS, 'typing', { groupId, isTyping })
	}

	// ================== Seen ==================
	const markGroupSeen = (groupId: string) => {
		socketService.emit(CHAT_NS, 'group_message_seen', { groupId })
	}

	// ================= ACTIONS =================
	/* ========== On-demand fetch group messages ====== */
	const fetchGroupMessages = useCallback(
		async (groupId: string, limit?: number, before?: string) => {
			try {
				const result = await triggerFetchGroupMessages({ groupId, limit, before }).unwrap()

				const newMessages: ChatMessage[] = result.map((m: MessageDto) => ({
					_id: m._id,
					groupId: m.groupId,
					senderId: m.senderId._id,
					content: m.content,
					type: m.type,
					attachments: m.attachments ?? [],
					replyTo: m.replyTo ?? undefined,
					createdAt: m.createdAt,
					status: m.status ?? 'sent',
					lastSeenAtByUser: { [userId]: new Date().toISOString() }
				}))

				setMessagesByGroup((prev) => {
					const existing = prev[groupId] ?? []

					// Merge: nếu message đã có, giữ lastSeenAtByUser cũ, nếu mới thì thêm
					const merged = [
						...newMessages
							.filter((m) => !existing.some((e) => e._id === m._id))
							.map((m) => ({
								...m,
								lastSeenAtByUser: {
									[userId]: new Date().toISOString(), // đánh dấu đã seen cho user hiện tại
									...m.lastSeenAtByUser
								}
							})),
						...existing
					]

					return {
						...prev,
						[groupId]: merged
					}
				})

				return newMessages
			} catch (error) {
				console.error('Failed to fetch messages', error)
				return []
			}
		},
		[triggerFetchGroupMessages, userId]
	)

	/* ========== On-demand search messages ====== */
	const searchGroupMessages: ChatContextValue['searchGroupMessages'] = useCallback(
		async (groupId, keyword, limit) => {
			try {
				const result = await triggerSearchGroupMessages({ groupId, keyword, limit }).unwrap()
				const messages: ChatMessage[] = result.map((m: MessageDto) => ({
					_id: m._id,
					groupId: m.groupId,
					senderId: m.senderId._id,
					content: m.content,
					type: m.type,
					attachments: m.attachments ?? [],
					replyTo: m.replyTo ?? undefined,
					createdAt: m.createdAt,
					status: m.status ?? 'sent',
					lastSeenAtByUser: { [userId]: new Date().toISOString() }
				}))
				return messages
			} catch (error) {
				console.error('Failed to search messages', error)
				return []
			}
		},
		[triggerSearchGroupMessages, userId]
	)

	const markAllMessagesAsSeenLocal = useCallback(
		(groupId: string) => {
			setMessagesByGroup((prev) => {
				const list = prev[groupId] ?? []
				const now = new Date().toISOString()
				return {
					...prev,
					[groupId]: list.map((m) => ({
						...m,
						status: 'seen',
						lastSeenAtByUser: {
							...m.lastSeenAtByUser,
							[userId]: now
						}
					}))
				}
			})
		},
		[userId]
	)

	useEffect(() => {
		const checkInitialUnread = async () => {
			try {
				const result = await store.dispatch(groupApi.endpoints.getPaginateDirectGroups.initiate()).unwrap()
				if (result?.data?.some((g: any) => g.unreadCount > 0)) {
					setHasUnreadDirect(true)
				}
			} catch (e) {
				console.warn('Skip initial unread check')
			}
		}
		checkInitialUnread()
	}, [])

	const value = useMemo(
		() => ({
			messagesByGroup,
			onlineUsersByGroup,
			sendGroupMessage,
			sendTyping,
			typingUsersByGroup,
			markGroupSeen,
			fetchGroupMessages,
			searchGroupMessages,
			markAllMessagesAsSeenLocal,
			hasUnreadDirect,
			setHasUnreadDirect,
			groupSidebars,
			setGroupSidebars,
			directSidebars,
			setDirectSidebars
		}),
		[
			messagesByGroup,
			onlineUsersByGroup,
			typingUsersByGroup,
			hasUnreadDirect,
			groupSidebars,
			directSidebars,
			fetchGroupMessages,
			markAllMessagesAsSeenLocal,
			searchGroupMessages,
			sendGroupMessage
		]
	)

	return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export { ChatContext, ChatProvider }
