/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useChat } from '@/hooks'
import { useAppSelector } from '@/store'
import { getUserIdFromAppUser } from '@/utils/utils'

interface Participant {
	id: string
	fullName: string
	avatarUrl: string
}

interface ChatPanelProps {
	groupId: string
	groupName: string
	participants: Participant[]
}

export const ChatPanel = ({ groupId, groupName, participants }: ChatPanelProps) => {
	const { messagesByGroup, onlineUsersByGroup, sendGroupMessage, sendTyping, typingUsersByGroup, markGroupSeen } =
		useChat()
	const user = useAppSelector((state) => state.auth.user)

	const userId = getUserIdFromAppUser(user)

	const [message, setMessage] = useState('')

	const scrollRef = useRef<HTMLDivElement | null>(null)
	const bottomRef = useRef<HTMLDivElement | null>(null)

	const [isAtBottom, setIsAtBottom] = useState(true)
	const [hasNewMessage, setHasNewMessage] = useState(false)

	const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
	const markSeenTimeout = useRef<NodeJS.Timeout | null>(null)

	/* ================= DERIVED DATA ================= */

	const messages = messagesByGroup[groupId] ?? []
	const onlineUserIds = onlineUsersByGroup[groupId] ?? []
	const typingUserIds = typingUsersByGroup[groupId] ?? []

	const participantMap = useMemo(() => {
		const map = new Map<string, Participant>()
		participants.forEach((p) => map.set(p.id, p))
		return map
	}, [participants])

	// 🔹 Tìm index của tin nhắn cuối cùng của mình
	const lastMessageIndexOfMine = useMemo(() => {
		for (let i = messages.length - 1; i >= 0; i--) {
			if (messages[i].senderId === userId) return i
		}
		return -1
	}, [messages, userId])

	/* ================= EFFECTS ================= */

	// reset input khi đổi group
	useEffect(() => {
		setMessage('')
	}, [groupId])

	useEffect(() => {
		if (isAtBottom) {
			bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
		} else {
			setHasNewMessage(true)
		}
	}, [messages.length])

	useEffect(() => {
		if (isAtBottom && messages.length > 0) {
			if (markSeenTimeout.current) clearTimeout(markSeenTimeout.current)

			markSeenTimeout.current = setTimeout(() => {
				markGroupSeen(groupId)
			}, 500) // delay 0.5s để tránh emit quá nhiều
		}
	}, [isAtBottom, messages.length, groupId, markGroupSeen])

	/* ================= UTILS ================= */

	const SAME_TIME_THRESHOLD = 60 * 1000 // 1 phút

	const isSameTimeBlock = (prev: any, curr: any) => {
		if (!prev) return false
		return Math.abs(new Date(curr.createdAt).getTime() - new Date(prev.createdAt).getTime()) <= SAME_TIME_THRESHOLD
	}

	const shouldShowTime = (prev: any, curr: any) => {
		if (!prev) return true
		if (prev.senderId !== curr.senderId) return true
		if (!isSameTimeBlock(prev, curr)) return true
		return false
	}

	const isLastMessageOfMineBlock = (messages: any[], index: number, userId: string) => {
		const msg = messages[index]
		if (msg.senderId !== userId) return false

		const next = messages[index + 1]
		if (!next) return true

		// message tiếp theo khác sender hoặc khác block time
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

	const handleSendMessage = () => {
		if (!message.trim()) return

		sendGroupMessage({
			groupId,
			content: message,
			type: 'text'
		})

		setMessage('')
	}

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	/* ================= RENDER ================= */

	return (
		<div className='flex h-full min-h-0 flex-col bg-chat'>
			{/* ===== Header ===== */}
			<div className='panel-header flex items-center justify-between px-4 py-3'>
				{/* Left */}
				<div className='flex flex-col gap-1'>
					{/* Group name */}
					<h2 className='line-clamp-2 max-w-[260px] text-sm font-semibold text-foreground' title={groupName}>
						{groupName}
					</h2>

					{/* Participants */}
					<div className='flex items-center gap-1'>
						{participants.map((p) => {
							const isOnline = onlineUserIds.includes(p.id)

							return (
								<div key={p.id} className='relative h-6 w-6 rounded-full' title={p.fullName}>
									<img
										src={p.avatarUrl || 'https://i.pravatar.cc/150?img=65'}
										alt={p.fullName}
										className='h-full w-full rounded-full object-cover'
									/>

									{/* Online dot */}
									{isOnline && (
										<span className='absolute bottom-0 right-0 h-2 w-2 rounded-full bg-green-500 ring-1 ring-white' />
									)}
								</div>
							)
						})}
					</div>
				</div>

				{/* Right */}
				<div className='flex items-center gap-2'>
					<button className='rounded-lg p-2 hover:bg-secondary'>
						<Phone className='h-4 w-4 text-muted-foreground' />
					</button>
					<button className='rounded-lg p-2 hover:bg-secondary'>
						<Video className='h-4 w-4 text-muted-foreground' />
					</button>
					<button className='rounded-lg p-2 hover:bg-secondary'>
						<MoreVertical className='h-4 w-4 text-muted-foreground' />
					</button>
				</div>
			</div>

			{/* ===== Messages ===== */}
			<div
				ref={scrollRef}
				className='flex-1 overflow-y-auto p-4'
				onScroll={() => {
					const el = scrollRef.current
					if (!el) return

					const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 40
					setIsAtBottom(atBottom)

					if (atBottom) {
						setHasNewMessage(false)
					}
				}}
			>
				<div className='space-y-1'>
					{messages.map((msg, index) => {
						const isMine = msg.senderId === userId
						const sender = participantMap.get(msg.senderId)
						// seenBy cho tin nhắn cuối cùng của mình
						let seenBy: Participant[] = []
						if (isLastMessageOfMineBlock(messages, index, userId) && msg.lastSeenAtByUser) {
							seenBy = Object.entries(msg.lastSeenAtByUser)
								.filter(
									([uid, seenAt]) => uid !== userId && new Date(msg.createdAt) <= new Date(seenAt)
								)
								.map(([uid]) => participantMap.get(uid))
								.filter(Boolean) as Participant[]
						}

						const isSenderOnline = onlineUserIds.includes(msg.senderId)
						const prevMsg = messages[index - 1]

						const isSameSenderAsPrev = prevMsg?.senderId === msg.senderId
						const isSameTimeAsPrev = prevMsg && isSameTimeBlock(prevMsg, msg)

						const showTime = shouldShowTime(prevMsg, msg)

						return (
							<div
								key={msg._id}
								className={cn(
									'flex gap-2',
									isMine ? 'justify-end' : 'justify-start',
									!isSameSenderAsPrev || !isSameTimeAsPrev ? 'mt-3' : 'mt-1'
								)}
							>
								{/* Avatar (only for others & first message in block) */}
								{!isMine && (!isSameSenderAsPrev || !isSameTimeAsPrev) && (
									<div className='relative h-8 w-8'>
										<img
											src={sender?.avatarUrl || 'https://i.pravatar.cc/150?img=65'}
											alt={sender?.fullName}
											className='h-8 w-8 rounded-full object-cover'
										/>

										{/* Online dot */}
										{isSenderOnline && (
											<span className='absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-green-500 ring-2 ring-background' />
										)}
									</div>
								)}

								{/* Spacer giữ alignment khi cùng sender */}
								{!isMine && isSameSenderAsPrev && isSameTimeAsPrev && <div className='w-8' />}

								<div className={cn('flex max-w-[70%] flex-col', isMine && 'items-end')}>
									{/* Sender name */}
									{!isMine && (!isSameSenderAsPrev || !isSameTimeAsPrev) && (
										<span className='mb-0.5 text-xs font-medium text-muted-foreground'>
											{sender?.fullName ?? 'Unknown'}
										</span>
									)}

									{/* Bubble */}
									<div
										className={cn(
											'rounded-2xl px-3 py-2 text-sm shadow-sm',
											isMine
												? 'bg-primary text-primary-foreground'
												: 'border border-border bg-muted text-foreground shadow',
											isSameSenderAsPrev &&
												isSameTimeAsPrev &&
												(isMine ? 'rounded-tr-md' : 'rounded-tl-md')
										)}
									>
										{msg.content}
									</div>

									{/* Time + Status */}
									{showTime && (
										<div className={cn('mt-0.5 flex items-center', isMine && 'justify-end')}>
											<span className='text-[10px] text-muted-foreground'>
												{new Date(msg.createdAt).toLocaleTimeString('vi-VN', {
													hour: '2-digit',
													minute: '2-digit'
												})}
											</span>

											{/* Status: chỉ message cuối của mình */}
											{isLastMessageOfMineBlock(messages, index, userId) && isMine && (
												<MessageStatus status={msg.status} />
											)}
										</div>
									)}

									{/* Seen Avatars */}
									{index === lastMessageIndexOfMine && seenBy.length > 0 && (
										<div className='mt-1 flex -space-x-2'>
											{seenBy.map((p) => (
												<img
													key={p.id + msg._id}
													src={p.avatarUrl || 'https://i.pravatar.cc/150?img=65'}
													alt={p.fullName}
													className='animate-slide-up h-4 w-4 rounded-full border-2 border-white'
												/>
											))}
										</div>
									)}
								</div>
							</div>
						)
					})}
					<div ref={bottomRef} />
				</div>
			</div>

			{/* ===== New Messages ===== */}
			{hasNewMessage && !isAtBottom && (
				<button
					onClick={() => {
						bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
						setHasNewMessage(false)
					}}
					className='absolute bottom-24 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-xs text-primary-foreground shadow-lg'
				>
					Tin nhắn mới ↓
				</button>
			)}

			{/* ===== Typing ===== */}
			{typingUserIds.length > 0 && (
				<div className='px-4 pb-1 text-xs italic text-muted-foreground'>
					{typingUserIds.length === 1
						? `${participantMap.get(typingUserIds[0])?.fullName} đang nhập...`
						: 'Nhiều người đang nhập...'}
				</div>
			)}

			{/* ===== Input ===== */}
			<div className='border-t border-border bg-card p-4'>
				<div className='flex items-center gap-2'>
					<button className='rounded-lg p-2 hover:bg-secondary'>
						<Paperclip className='h-5 w-5 text-muted-foreground' />
					</button>

					<input
						type='text'
						value={message}
						onChange={(e) => {
							setMessage(e.target.value)

							sendTyping(groupId, true)

							if (typingTimeoutRef.current) {
								clearTimeout(typingTimeoutRef.current)
							}

							typingTimeoutRef.current = setTimeout(() => {
								sendTyping(groupId, false)
							}, 1500)
						}}
						onKeyPress={handleKeyPress}
						placeholder='Nhập tin nhắn...'
						className='flex-1 rounded-xl bg-secondary px-4 py-2.5 focus:outline-none'
					/>

					<button className='rounded-lg p-2 hover:bg-secondary'>
						<Smile className='h-5 w-5 text-muted-foreground' />
					</button>

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
