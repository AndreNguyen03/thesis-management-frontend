/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Search, Loader } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChat } from '@/hooks'
import { useAppSelector } from '@/store'
import { formatDateLabel, getUserIdFromAppUser, isSameDay } from '@/utils/utils'
import type { ChatMessage } from '@/contexts/ChatSocketContext'
import { Avatar } from './Avatar'

interface Participant {
	_id: string
	fullName: string
	avatarUrl?: string | undefined
}

interface ChatPanelProps {
	groupId: string
	groupName: string
	participants: Participant[]
	onBack?: () => void
	onOpenWork?: () => void
}

export const ChatPanel = ({ groupId, groupName, participants }: ChatPanelProps) => {
	const {
		searchGroupMessages,
		messagesByGroup,
		onlineUsersByGroup,
		sendGroupMessage,
		sendTyping,
		typingUsersByGroup,
		markGroupSeen,
		fetchGroupMessages,
		markAllMessagesAsSeenLocal
	} = useChat()
	const user = useAppSelector((state) => state.auth.user)

	const userId = getUserIdFromAppUser(user)

	const [message, setMessage] = useState('')
	const [isSearchOpen, setIsSearchOpen] = useState(false)
	const [searchQuery, setSearchQuery] = useState('')
	const [searchResults, setSearchResults] = useState<ChatMessage[] | null>(null)

	const scrollRef = useRef<HTMLDivElement | null>(null)
	const bottomRef = useRef<HTMLDivElement | null>(null)

	const [isAtBottom, setIsAtBottom] = useState(true)
	const [hasNewMessage, setHasNewMessage] = useState(false)

	const [loadingHistory, setLoadingHistory] = useState(false)
	const [hasMoreHistory, setHasMoreHistory] = useState(true)

	const [isInitialLoading, setIsInitialLoading] = useState(false)

	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const markSeenTimeout = useRef<NodeJS.Timeout | null>(null)
	const loadingHistoryRef = useRef(false)
	const searchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

	/* ================= DERIVED DATA ================= */

	const messages = messagesByGroup[groupId] ?? []
	const onlineUserIds = onlineUsersByGroup[groupId] ?? []
	const typingUserIds = typingUsersByGroup[groupId] ?? []

	const participantMap = useMemo(() => {
		const map = new Map<string, Participant>()
		participants.forEach((p) => map.set(p._id, p))
		return map
	}, [participants])

	const lastMessageIndexOfMine = useMemo(() => {
		for (let i = messages.length - 1; i >= 0; i--) {
			if (messages[i].senderId === userId) return i
		}
		return -1
	}, [messages, userId])

	/* ================= UTILS ================= */

	const SAME_TIME_THRESHOLD = 60 * 1000 // 1 phút

	const isSameTimeBlock = (prev: ChatMessage, curr: ChatMessage) => {
		if (!prev) return false
		return Math.abs(new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime()) <= SAME_TIME_THRESHOLD
	}

	const shouldShowTime = (prev: ChatMessage | null, curr: ChatMessage) => {
		if (!prev) return true
		if (prev.senderId !== curr.senderId) return true
		if (!isSameTimeBlock(prev, curr)) return true
		return false
	}

	const isLastMessageOfMineBlock = (messages: ChatMessage[], index: number, userId: string) => {
		const msg = messages[index]
		if (msg.senderId !== userId) return false

		const next = messages[index + 1]
		if (!next) return true

		if (next.senderId !== userId) return true
		if (!isSameTimeBlock(msg, next)) return true

		return false
	}

	const MessageStatus = ({ status }: { status?: string }) => {
		if (!status) return null

		switch (status) {
			case 'sending':
				return <span className='ml-1 text-[10px] text-muted-foreground'>Đang gửi</span>
			case 'sent':
				return <span className='ml-1 text-[10px] text-muted-foreground'>Đã gửi</span>
			case 'delivered':
				return <span className='ml-1 text-[10px] text-muted-foreground'>Đã nhận</span>
			case 'seen':
				return <span className='ml-1 text-[10px] text-muted-foreground'>Đã xem</span>
			default:
				return null
		}
	}

	/* ================= HANDLERS ================= */

	const handleSearch = async (keyword: string) => {
		if (!keyword.trim()) {
			setSearchResults(null)
			return
		}
		if (!groupId) return

		try {
			const results = await searchGroupMessages(groupId, keyword, 20)
			setSearchResults(results)
		} catch (err) {
			console.error(err)
		}
	}

	const handleSearchDebounced = (keyword: string) => {
		if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current)
		searchTimeoutRef.current = setTimeout(() => {
			handleSearch(keyword) // gọi API sau 500ms
		}, 500)
	}

	const handleSendMessage = () => {
		if (!message.trim()) return

		sendGroupMessage({
			groupId,
			content: message,
			type: 'text'
		})
		setMessage('')
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault() // tránh xuống dòng mặc định
			handleSendMessage() // gửi tin nhắn
		}
	}

	const handleScroll = async () => {
		const el = scrollRef.current
		if (!el) return

		const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
		setIsAtBottom(atBottom)
		if (atBottom) {
			setHasNewMessage(false)
			markAllMessagesAsSeenLocal(groupId)
			markGroupSeen(groupId)
		}
	}

	const loadOlderMessages = async () => {
		if (loadingHistoryRef.current || !hasMoreHistory) return
		loadingHistoryRef.current = true
		setLoadingHistory(true)

		const scrollDiv = scrollRef.current
		if (!scrollDiv) return

		const previousScrollHeight = scrollDiv.scrollHeight
		const previousScrollTop = scrollDiv.scrollTop

		const oldestMsg = messages[0]
		const result = await fetchGroupMessages(groupId, 20, oldestMsg.createdAt)

		// Nếu API trả về ít hơn limit, tức là đã load hết
		if (result.length < 20) setHasMoreHistory(false)

		setTimeout(() => {
			if (!scrollDiv) return
			scrollDiv.scrollTop = scrollDiv.scrollHeight - previousScrollHeight + previousScrollTop
		}, 0)

		loadingHistoryRef.current = false
		setLoadingHistory(false)
	}
	const messagesToRender = (searchResults ?? messages).slice().sort((a, b) => {
		return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
	})

	/* ================= EFFECTS ================= */

	useEffect(() => setMessage(''), [groupId])

	useEffect(() => {
		if (!groupId) return

		const loadHistory = async () => {
			try {
				setIsInitialLoading(true)
				setHasMoreHistory(true)
				await fetchGroupMessages(groupId, 20)
			} catch (err) {
				console.error(err)
			} finally {
				setIsInitialLoading(false)
			}
		}

		loadHistory()
	}, [groupId])

	useEffect(() => {
		if (isAtBottom) bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
		else setHasNewMessage(true)
	}, [messages.length])

	useEffect(() => {
		if (isAtBottom && messages.length > 0) {
			if (markSeenTimeout.current) clearTimeout(markSeenTimeout.current)
			markSeenTimeout.current = setTimeout(() => markGroupSeen(groupId), 500)
		}
	}, [isAtBottom, messages.length, groupId, markGroupSeen])

	useEffect(() => {
		if (!isSearchOpen) {
			// scroll xuống tin nhắn mới nhất khi tắt search
			bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
			setHasNewMessage(false)
		}
	}, [isSearchOpen])

	/* ================= RENDER ================= */

	return (
		<div className='flex h-full flex-col bg-chat'>
			{/* Header */}
			<div className='panel-header flex items-center justify-between px-4 py-3'>
				<div className='flex flex-col gap-1'>
					<h2 className='line-clamp-2 max-w-[260px] text-sm font-semibold text-foreground' title={groupName}>
						{groupName}
					</h2>
					<div className='flex items-center gap-1'>
						{participants.map((p) => {
							const isOnline = onlineUserIds.includes(p._id)
							return (
								<div key={p._id} className='relative h-6 w-6 rounded-full' title={p.fullName}>
									<Avatar
										fullName={p.fullName}
										avatarUrl={p.avatarUrl}
										size={24}
										className='border-background'
									/>
									{isOnline && (
										<span className='absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white' />
									)}
								</div>
							)
						})}
					</div>
				</div>
				<div className='flex items-center gap-2'>
					<button
						className='rounded-lg p-2 hover:bg-secondary'
						onClick={() => setIsSearchOpen((prev) => !prev)}
					>
						<Search className='h-4 w-4 text-muted-foreground' />
					</button>
				</div>
			</div>

			{/* Search */}
			{isSearchOpen && (
				<div className='mt-1 flex items-center gap-2 px-4'>
					<input
						type='text'
						placeholder='Tìm kiếm tin nhắn...'
						value={searchQuery}
						onChange={(e) => {
							setSearchQuery(e.target.value)
							handleSearchDebounced(e.target.value)
						}}
						className='flex-1 rounded-lg border border-border bg-secondary px-3 py-1 text-sm focus:outline-none'
					/>
					<button
						onClick={() => {
							setIsSearchOpen(false)
							setSearchQuery('')
							setSearchResults(null)
						}}
					>
						✕
					</button>
				</div>
			)}

			{/* Messages */}
			<div ref={scrollRef} className='flex-1 overflow-y-auto p-4' onScroll={handleScroll}>
				{/* INITIAL LOADING */}
				{isInitialLoading && (
					<div className='flex h-full items-center justify-center'>
						<ChatSkeleton />
					</div>
				)}

				{/* EMPTY STATE */}
				{!isInitialLoading && messages.length === 0 && !searchResults && (
					<GroupChatEmptyState
						groupName={groupName}
						participants={participants.filter((p) => p._id !== userId)}
					/>
				)}

				{!isInitialLoading && messages.length > 0 && (
					<>
						<div className='mb-2 flex flex-col items-center'>
							{/* Button load older messages */}
							{hasMoreHistory && messages.length > 0 && (
								<button
									onClick={loadOlderMessages}
									className='rounded-full bg-secondary px-3 py-1 text-xs text-foreground shadow'
									disabled={loadingHistory}
								>
									{loadingHistory ? (
										<div className='flex items-center gap-1'>
											<Loader className='h-4 w-4 animate-spin' /> Đang tải...
										</div>
									) : (
										'Xem tin nhắn cũ'
									)}
								</button>
							)}
							{!hasMoreHistory && messages.length > 0 && (
								<span className='mt-2 text-xs text-muted-foreground'>Không còn tin nhắn cũ</span>
							)}
						</div>
						<div className='space-y-1'>
							{messagesToRender.map((msg, index) => {
								const prevMsg = messagesToRender[index - 1]
								const showDateSeparator = !prevMsg || !isSameDay(prevMsg.createdAt, msg.createdAt)
								const dateLabel = showDateSeparator ? formatDateLabel(msg.createdAt) : null

								const isMine = msg.senderId === userId
								const sender = participantMap.get(msg.senderId)
								console.log('participants map :::', participantMap)
								let seenBy: Participant[] = []
								if (isLastMessageOfMineBlock(messages, index, userId) && msg.lastSeenAtByUser) {
									seenBy = Object.entries(msg.lastSeenAtByUser)
										.filter(
											([uid, seenAt]) =>
												uid !== userId && new Date(msg.createdAt) <= new Date(seenAt)
										)
										.map(([uid]) => participantMap.get(uid))
										.filter(Boolean) as Participant[]
								}
								const isSenderOnline = onlineUserIds.includes(msg.senderId)
								const isSameSenderAsPrev = prevMsg?.senderId === msg.senderId
								const isSameTimeAsPrev = prevMsg && isSameTimeBlock(prevMsg, msg)
								const showTime = shouldShowTime(prevMsg ?? null, msg)

								return (
									<React.Fragment key={msg._id + '-' + index}>
										{showDateSeparator && (
											<div className='my-3 flex justify-center'>
												<span className='rounded-full bg-secondary px-3 py-1 text-xs text-muted-foreground'>
													{dateLabel}
												</span>
											</div>
										)}

										<div
											className={cn(
												'flex gap-2',
												isMine ? 'justify-end' : 'justify-start',
												!isSameSenderAsPrev || !isSameTimeAsPrev ? 'mt-3' : 'mt-1'
											)}
										>
											{!isMine && (!isSameSenderAsPrev || !isSameTimeAsPrev) && (
												<div className='relative h-8 w-8'>
													<Avatar
														fullName={sender?.fullName}
														avatarUrl={sender?.avatarUrl}
														size={24}
													/>
													{isSenderOnline && (
														<span className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background' />
													)}
												</div>
											)}
											{!isMine && isSameSenderAsPrev && isSameTimeAsPrev && (
												<div className='w-8' />
											)}
											<div className={cn('flex max-w-[70%] flex-col', isMine && 'items-end')}>
												{!isMine && (!isSameSenderAsPrev || !isSameTimeAsPrev) && (
													<span className='mb-0.5 text-xs font-medium text-muted-foreground'>
														{sender?.fullName ?? 'Unknown'}
													</span>
												)}
												<div
													className={cn(
														'max-w-[250px] whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm shadow-sm',
														isMine
															? 'self-end bg-primary text-primary-foreground'
															: 'border border-border bg-muted text-foreground shadow',
														isSameSenderAsPrev &&
															isSameTimeAsPrev &&
															(isMine ? 'rounded-tr-md' : 'rounded-tl-md')
													)}
												>
													{msg.content}
												</div>
												{showTime && (
													<div
														className={cn(
															'mt-0.5 flex items-center',
															isMine && 'justify-end'
														)}
													>
														<span className='text-[10px] text-muted-foreground'>
															{new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
																hour: '2-digit',
																minute: '2-digit'
															})}
														</span>
														{isLastMessageOfMineBlock(messages, index, userId) &&
															isMine && <MessageStatus status={msg.status} />}
													</div>
												)}
												{index === lastMessageIndexOfMine && seenBy.length > 0 && (
													<div className='mt-1 flex -space-x-2'>
														{seenBy.map((p) => (
															<img
																key={p._id + msg._id}
																src={p.avatarUrl || 'https://i.pravatar.cc/150?img=65'}
																alt={p.fullName}
																className='h-4 w-4 animate-slide-up rounded-full border-2 border-white'
															/>
														))}
													</div>
												)}
											</div>
										</div>
									</React.Fragment>
								)
							})}
							<div ref={bottomRef} />
						</div>
					</>
				)}
			</div>

			{/* New messages button */}
			{hasNewMessage && !isAtBottom && (
				<button
					onClick={() => {
						bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
						setHasNewMessage(false)
						markAllMessagesAsSeenLocal(groupId)
						markGroupSeen(groupId)
					}}
					className='absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground shadow-lg'
				>
					Tin nhắn mới ↓
				</button>
			)}

			{/* Typing indicator */}
			{typingUserIds.length > 0 && (
				<div className='px-4 pb-1 text-xs italic text-muted-foreground'>
					{typingUserIds.length === 1
						? `${participantMap.get(typingUserIds[0])?.fullName} đang nhập...`
						: 'Nhiều người đang nhập...'}
				</div>
			)}

			{/* Input */}
			<div className='border-t border-border bg-card p-4'>
				<div className='flex items-center gap-2'>
					<textarea
						value={message}
						onChange={(e) => {
							setMessage(e.target.value)
							sendTyping(groupId, true)
							if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
							typingTimeoutRef.current = setTimeout(() => sendTyping(groupId, false), 1500)
						}}
						onKeyDown={handleKeyDown}
						placeholder='Nhập tin nhắn...'
						className='max-h-36 flex-1 resize-none overflow-y-auto rounded-xl bg-secondary px-4 py-2.5 focus:outline-none'
					/>

					<button
						onClick={handleSendMessage}
						disabled={!message.trim()}
						className='rounded-xl bg-primary p-2.5 text-primary-foreground disabled:opacity-50'
					>
						<Send className='h-5 w-5' />
					</button>
				</div>
			</div>
		</div>
	)
}

const ChatSkeleton = () => {
	return (
		<div className='flex w-full flex-col space-y-3'>
			{Array.from({ length: 8 }).map((_, i) => {
				const isMine = i % 2 === 0
				return (
					<div key={i} className='flex w-full'>
						{/* wrapper căn trái hoặc phải */}
						<div className={cn('flex w-full', isMine ? 'justify-end' : 'justify-start')}>
							{/* bubble skeleton */}
							<div className={cn('h-9 animate-pulse rounded-2xl bg-muted', isMine ? 'w-40' : 'w-56')} />
						</div>
					</div>
				)
			})}
		</div>
	)
}

const GroupChatEmptyState = ({ groupName, participants }: { groupName: string; participants: Participant[] }) => {
	const visibleParticipants = participants.slice(0, 5)
	const remaining = participants.length - visibleParticipants.length

	return (
		<div className='flex h-full flex-col items-center justify-center text-center text-muted-foreground'>
			{/* Avatar stack */}
			<div className='mb-4 flex -space-x-3'>
				{visibleParticipants.map((p) => (
					<Avatar
						fullName={p.fullName}
						avatarUrl={p.avatarUrl}
						size={40}
						className='border-2 border-background'
					/>
				))}
				{remaining > 0 && (
					<div className='flex h-14 w-14 items-center justify-center rounded-full border-2 border-background bg-secondary text-sm font-medium'>
						+{remaining}
					</div>
				)}
			</div>

			<h3 className='text-sm font-semibold text-foreground'>{groupName}</h3>

			<p className='mt-1 max-w-xs text-xs'>
				Nhóm này chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện với mọi người.
			</p>
		</div>
	)
}
