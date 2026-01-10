import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Loader2, BookOpen, Users, Tag } from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'
const MAX_WIDTH_NORMAL = 'max-w-[70%]'
const MAX_WIDTH_WITH_TOPICS = 'max-w-[85%]'
const DESCRIPTION_PREVIEW_LENGTH = 150
import { useNavigate } from 'react-router-dom'
import { renderMarkdown } from '@/lib/utils'
import type { TopicResult } from '@/models/chatbot-conversation.model'



interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
	timestamp: Date
	isStreaming?: boolean
	topics?: TopicResult[] // Thêm field để lưu danh sách topics
}

interface ChatResponse {
	response: string
	steps?: Array<{
		tool: string
		input: any
		output: string
	}>
	success: boolean
}

export const AgentChat: React.FC = () => {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [useStreaming, setUseStreaming] = useState(false)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const eventSourceRef = useRef<EventSource | null>(null)

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	// Cleanup EventSource on unmount
	useEffect(() => {
		return () => {
			if (eventSourceRef.current) {
				eventSourceRef.current.close()
			}
		}
	}, [])

	/**
	 * Parse topics từ output JSON nếu có
	 */
	const parseTopicsFromContent = (content: string): TopicResult[] | null => {
		try {
			// Tìm JSON trong content
			const jsonMatch = content.match(/\{[\s\S]*"topics"[\s\S]*\}/)
			if (!jsonMatch) return null

			const parsed = JSON.parse(jsonMatch[0])
			if (parsed.topics && Array.isArray(parsed.topics)) {
				return parsed.topics
			}
		} catch (error) {
			console.log('No valid topics JSON found')
		}
		return null
	}

	/**
	 * 1. NORMAL CHAT - POST request, đợi full response
	 */
	const sendNormalChat = async (message: string) => {
		try {
			const response = await fetch(`${API_BASE}/chatbot-agent/chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message,
					chatHistory: messages.map((m) => ({
						role: m.role,
						content: m.content
					}))
				})
			})

			if (!response.ok) {
				throw new Error('Failed to get response')
			}

			const data: ChatResponse = await response.json().then((res) => res.data)
			console.log(data)
			// Parse topics từ step cuối nếu có
			let topics: TopicResult[] | null = null
			if (data.steps && data.steps.length > 0) {
				const lastStep = data.steps[data.steps.length - 1]
				if (lastStep.output) {
					topics = parseTopicsFromContent(lastStep.output)
				}
			}

			// Thêm response vào messages
			const assistantMessage: Message = {
				id: Date.now().toString(),
				role: 'assistant',
				content: data.response,
				timestamp: new Date(),
				topics: topics || undefined
			}

			setMessages((prev) => [...prev, assistantMessage])

			// Log debug info
			if (data.steps && data.steps.length > 0) {
				console.log(
					'🔧 Tools used:',
					data.steps.map((s) => s.tool)
				)
				console.log('📊 Steps:', data.steps)
			}
		} catch (error) {
			console.error('❌ Chat error:', error)
			setMessages((prev) => [
				...prev,
				{
					id: Date.now().toString(),
					role: 'assistant',
					content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại.',
					timestamp: new Date()
				}
			])
		}
	}

	/**
	 * 2. STREAMING CHAT - fetch() với ReadableStream
	 */
	const sendStreamingChat = async (message: string) => {
		const streamingMessageId = Date.now().toString()
		const streamingMessage: Message = {
			id: streamingMessageId,
			role: 'assistant',
			content: '',
			timestamp: new Date(),
			isStreaming: true
		}

		setMessages((prev) => [...prev, streamingMessage])

		try {
			const response = await fetch(`${API_BASE}/chatbot-agent/stream-chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message,
					chatHistory: messages.map((m) => ({
						role: m.role,
						content: m.content
					}))
				})
			})

			if (!response.ok) {
				throw new Error('Stream failed')
			}

			const reader = response.body?.getReader()
			const decoder = new TextDecoder()
			let buffer = ''
			let fullContent = ''

			while (true) {
				const { done, value } = await reader!.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })

				// Xử lý từng message SSE (kết thúc bằng \n\n)
				let lines = buffer.split('\n\n')
				buffer = lines.pop() || '' // Giữ lại phần chưa hoàn chỉnh

				for (const line of lines) {
					if (!line.startsWith('data: ')) continue

					try {
						const jsonStr = line.slice(6)
						const data = JSON.parse(jsonStr)

						if (data.error) throw new Error(data.error)

						if (data.done) {
							// Parse topics từ fullContent nếu có
							const topicsMatch = fullContent.match(
								/__TOPICS_DATA_START__\n([\s\S]*?)\n__TOPICS_DATA_END__/
							)
							let topics: TopicResult[] | undefined

							if (topicsMatch) {
								try {
									const topicsData = JSON.parse(topicsMatch[1])
									topics = topicsData.topics || []
									console.log('📚 Parsed topics:', topics?.length)

									// Remove markers từ content để không hiển thị
									fullContent = fullContent
										.replace(/__TOPICS_DATA_START__[\s\S]*?__TOPICS_DATA_END__/g, '')
										.trim()
								} catch (e) {
									console.error('Failed to parse topics:', e)
								}
							}

							// Update message với content đã clean và topics
							setMessages((prev) =>
								prev.map((m) =>
									m.id === streamingMessageId
										? {
												...m,
												content: fullContent,
												isStreaming: false,
												topics: topics
											}
										: m
								)
							)
						} else if (data.content) {
							// Tích lũy content
							fullContent += data.content

							// Update UI (hiển thị real-time, kể cả markers)
							setMessages((prev) =>
								prev.map((m) =>
									m.id === streamingMessageId ? { ...m, content: m.content + data.content } : m
								)
							)
						}
					} catch (e) {
						console.error('Parse error:', e)
					}
				}
			}
		} catch (error: any) {
			console.error('❌ Stream error:', error)
			setMessages((prev) =>
				prev.map((m) =>
					m.id === streamingMessageId
						? {
								...m,
								content: m.content || `Xin lỗi, đã có lỗi xảy ra: ${error.message}`,
								isStreaming: false
							}
						: m
				)
			)
		}
	}

	/**
	 * Handle send message
	 */
	const handleSend = async () => {
		if (!input.trim() || isLoading) return

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: input.trim(),
			timestamp: new Date()
		}

		setMessages((prev) => [...prev, userMessage])
		setInput('')
		setIsLoading(true)

		try {
			if (useStreaming) {
				await sendStreamingChat(userMessage.content)
			} else {
				await sendNormalChat(userMessage.content)
			}
		} catch (error) {
			console.error('Send error:', error)
		} finally {
			setIsLoading(false)
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault()
			handleSend()
		}
	}

	/**
	 * Render topic card
	 */
	const TopicCard: React.FC<{ topic: TopicResult }> = ({ topic }) => {
		const navigate = useNavigate()
		return (
			<div
				className='mb-3 cursor-pointer rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
				onClick={() => navigate(`/detail-topic/${topic._id}`)}
			>
				<div className='mb-2 flex items-start justify-between'>
					<div className='flex-1'>
						<h3 className='text-base font-semibold leading-snug text-gray-800'>{topic.titleVN}</h3>
						<p className='text-sm italic text-gray-500'>{topic.titleEng}</p>
					</div>
					<span className='ml-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700'>
						{topic.major}
					</span>
				</div>

				<div
					className='mb-3 line-clamp-3 text-sm text-gray-600'
					dangerouslySetInnerHTML={{
						__html:
							topic.description.replace(/<[^>]*>/g, '').substring(0, DESCRIPTION_PREVIEW_LENGTH) + '...'
					}}
				/>
				<div className='space-y-2 text-xs'>
					<div className='flex items-start gap-2'>
						<Tag className='h-4 w-4 flex-shrink-0 text-purple-500' />
						<div>
							<span className='font-medium text-gray-700'>Lĩnh vực:</span>
							<span className='ml-1 text-gray-600'>{topic.fields}</span>
						</div>
					</div>

					<div className='flex items-start gap-2'>
						<BookOpen className='h-4 w-4 flex-shrink-0 text-green-500' />
						<div>
							<span className='font-medium text-gray-700'>Yêu cầu:</span>
							<span className='ml-1 text-gray-600'>{topic.requirements}</span>
						</div>
					</div>

					<div className='flex items-start gap-2'>
						<Users className='h-4 w-4 flex-shrink-0 text-orange-500' />
						<div>
							<span className='font-medium text-gray-700'>GVHD:</span>
							<span className='ml-1 text-gray-600'>{topic.lecturers}</span>
						</div>
					</div>

					<div className='border-t border-gray-100 pt-2'>
						<span className='text-gray-500'>Tối đa: </span>
						<span className='font-medium text-gray-700'>{topic.maxStudents} sinh viên</span>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='mx-auto flex h-screen max-w-4xl flex-col bg-gray-50'>
			{/* Header */}
			<div className='border-b border-gray-200 bg-white p-4 shadow-sm'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<div className='flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
							<Bot className='h-6 w-6 text-white' />
						</div>
						<div>
							<h1 className='text-xl font-bold text-gray-800'>AI Agent Chatbot</h1>
							<p className='text-sm text-gray-500'>Trợ lý tư vấn khóa luận</p>
						</div>
					</div>

					{/* Toggle Streaming Mode */}
					<label className='flex cursor-pointer items-center gap-2'>
						<input
							type='checkbox'
							checked={useStreaming}
							onChange={(e) => setUseStreaming(e.target.checked)}
							className='h-4 w-4'
						/>
						<span className='text-sm text-gray-600'>{useStreaming ? '⚡ Streaming' : '📦 Normal'}</span>
					</label>
				</div>
			</div>

			{/* Messages */}
			<div className='flex-1 space-y-4 overflow-y-auto p-4'>
				{messages.length === 0 && (
					<div className='mt-20 text-center text-gray-500'>
						<Bot className='mx-auto mb-4 h-16 w-16 text-gray-300' />
						<p className='text-lg font-medium'>Chào bạn! Tôi có thể giúp gì cho bạn?</p>
						<p className='mt-2 text-sm'>Thử hỏi: "Tìm đề tài về AI" hoặc "Quy trình đăng ký đề tài"</p>
					</div>
				)}

				{messages.map((message, index) => (
					<div
						key={index}
						className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
					>
						{message.role === 'assistant' && (
							<div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
								<Bot className='h-5 w-5 text-white' />
							</div>
						)}

						<div
							className={`rounded-2xl px-4 py-3 ${
								message.role === 'user'
									? `${MAX_WIDTH_NORMAL} bg-blue-500 text-white`
									: message.topics && message.topics.length > 0
										? `${MAX_WIDTH_WITH_TOPICS} border border-gray-200 bg-white text-gray-800 shadow-sm`
										: `${MAX_WIDTH_NORMAL} border border-gray-200 bg-white text-gray-800 shadow-sm`
							}`}
						>
							{/* Text response */}
							<div
								className='whitespace-pre-wrap'
								dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
							/>

							{/* Topic cards */}
							{message.topics && message.topics.length > 0 && (
								<div className='mt-3 space-y-2'>
									<div className='mb-2 text-sm font-medium text-gray-700'>
										📚 Tìm thấy {message.topics.length} đề tài:
									</div>
									{message.topics.map((topic) => (
										<TopicCard key={topic._id} topic={topic} />
									))}
								</div>
							)}

							{message.isStreaming && (
								<span className='ml-1 inline-block h-4 w-2 animate-pulse bg-gray-400'></span>
							)}
							<div className='mt-1 text-xs opacity-60'>
								{message.timestamp.toLocaleTimeString('vi-VN', {
									hour: '2-digit',
									minute: '2-digit'
								})}
							</div>
						</div>

						{message.role === 'user' && (
							<div className='flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gray-300'>
								<User className='h-5 w-5 text-gray-600' />
							</div>
						)}
					</div>
				))}

				{isLoading && !useStreaming && (
					<div className='flex justify-start gap-3'>
						<div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600'>
							<Bot className='h-5 w-5 text-white' />
						</div>
						<div className='rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm'>
							<Loader2 className='h-5 w-5 animate-spin text-gray-400' />
						</div>
					</div>
				)}

				<div ref={messagesEndRef} />
			</div>

			{/* Input */}
			<div className='border-t border-gray-200 bg-white p-4'>
				<div className='flex gap-2'>
					<textarea
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyPress}
						placeholder='Nhập câu hỏi của bạn...'
						aria-label='Nhập câu hỏi'
						className='flex-1 resize-none rounded-xl border border-gray-300 px-4 py-3 focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500'
						rows={1}
						disabled={isLoading || messages.some((m) => m.isStreaming)}
					/>
					<button
						onClick={handleSend}
						disabled={isLoading || messages.some((m) => m.isStreaming) || !input.trim()}
						aria-label='Gửi tin nhắn'
						className='flex items-center gap-2 rounded-xl bg-blue-500 px-6 py-3 text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:bg-gray-300'
					>
						{isLoading ? (
							<Loader2 className='h-5 w-5 animate-spin' />
						) : (
							<>
								<Send className='h-5 w-5' />
								<span>Gửi</span>
							</>
						)}
					</button>
				</div>
				<div className='mt-2 text-xs text-gray-500'>
					💡 Tip: Bật "Streaming" để thấy phản hồi theo thời gian thực như ChatGPT
				</div>
			</div>
		</div>
	)
}
