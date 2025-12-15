import React, { useState } from 'react'
import { Send, Paperclip, Smile, MoreVertical, Phone, Video } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
	id: number
	text: string
	sender: 'user' | 'other'
	senderName: string
	time: string
}

interface ChatPanelProps {
	groupName: string
}

const mockMessages: Message[] = [
	{
		id: 1,
		text: 'Chào các bạn! Hôm nay chúng ta họp nhóm nhé?',
		sender: 'other',
		senderName: 'Nguyễn Văn A',
		time: '09:00'
	},
	{ id: 2, text: 'Ok bạn, mình sẵn sàng rồi!', sender: 'user', senderName: 'Bạn', time: '09:02' },
	{
		id: 3,
		text: 'Mình đã hoàn thành phần wireframe, các bạn review giúp nhé',
		sender: 'other',
		senderName: 'Trần Thị B',
		time: '09:05'
	},
	{ id: 4, text: 'Tuyệt vời! Để mình xem ngay', sender: 'user', senderName: 'Bạn', time: '09:07' },
	{
		id: 5,
		text: 'Phần database cũng đã xong, test case đã pass hết',
		sender: 'other',
		senderName: 'Lê Văn C',
		time: '09:10'
	},
	{
		id: 6,
		text: 'Great progress! Họp lúc 10h sáng mai để review tổng thể nhé',
		sender: 'user',
		senderName: 'Bạn',
		time: '09:15'
	}
]

export const ChatPanel = ({ groupName }: ChatPanelProps) => {
	const [message, setMessage] = useState('')
	const [messages, setMessages] = useState<Message[]>(mockMessages)

	const handleSendMessage = () => {
		if (!message.trim()) return

		const newMessage: Message = {
			id: Date.now(),
			text: message,
			sender: 'user',
			senderName: 'Bạn',
			time: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
		}

		setMessages([...messages, newMessage])
		setMessage('')
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSendMessage()
		}
	}

	return (
		<div className='flex h-[100dvh] max-h-[calc(100vh-6rem)] flex-col bg-chat'>
			{/* Header */}
			<div className='panel-header flex items-center justify-between'>
				<div>
					<h2 className='font-semibold text-foreground'>{groupName}</h2>
					<p className='text-xs text-muted-foreground'>3 thành viên online</p>
				</div>
				<div className='flex items-center gap-2'>
					<button className='rounded-lg p-2 transition-colors hover:bg-secondary'>
						<Phone className='h-4 w-4 text-muted-foreground' />
					</button>
					<button className='rounded-lg p-2 transition-colors hover:bg-secondary'>
						<Video className='h-4 w-4 text-muted-foreground' />
					</button>
					<button className='rounded-lg p-2 transition-colors hover:bg-secondary'>
						<MoreVertical className='h-4 w-4 text-muted-foreground' />
					</button>
				</div>
			</div>

			{/* Messages */}
			<div className='flex-1 space-y-4 overflow-y-auto p-4'>
				{messages.map((msg) => (
					<div
						key={msg.id}
						className={cn('flex flex-col', msg.sender === 'user' ? 'items-end' : 'items-start')}
					>
						<span className='mb-1 text-xs text-muted-foreground'>
							{msg.senderName} · {msg.time}
						</span>
						<div
							className={cn(
								'chat-bubble',
								msg.sender === 'user' ? 'chat-bubble-user' : 'chat-bubble-other'
							)}
						>
							<p className='text-sm'>{msg.text}</p>
						</div>
					</div>
				))}
			</div>

			{/* Input */}
			<div className='border-t border-border bg-card p-4'>
				<div className='flex items-center gap-2'>
					<button className='rounded-lg p-2 transition-colors hover:bg-secondary'>
						<Paperclip className='h-5 w-5 text-muted-foreground' />
					</button>
					<div className='relative flex-1'>
						<input
							type='text'
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder='Nhập tin nhắn...'
							className='w-full rounded-xl border-0 bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
						/>
					</div>
					<button className='rounded-lg p-2 transition-colors hover:bg-secondary'>
						<Smile className='h-5 w-5 text-muted-foreground' />
					</button>
					<button
						onClick={handleSendMessage}
						disabled={!message.trim()}
						className='rounded-xl bg-primary p-2.5 text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
					>
						<Send className='h-5 w-5' />
					</button>
				</div>
			</div>
		</div>
	)
}
