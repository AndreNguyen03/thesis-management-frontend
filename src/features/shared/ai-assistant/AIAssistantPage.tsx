/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useToast } from '@/hooks/use-toast'
import {
	Bot,
	User,
	Send,
	Paperclip,
	MessageSquare,
	BookOpen,
	FileText,
	Search,
	TrendingUp,
	CheckCircle,
	Lightbulb,
	ThumbsUp,
	ThumbsDown,
	History,
	Plus,
	Trash2,
	Clock,
	Tag,
	Users,
	Menu,
	Loader2,
	CheckCircle2
} from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { cn, renderMarkdown } from '@/lib/utils'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useGetChatbotVersionQuery } from '@/services/chatbotApi'
import type {
	AddMessgePayload,
	ConversationMessage,
	GetConversationsDto,
	LecturerResult,
	LecturerSnapshot,
	TopicResult,
	TopicSnapshot
} from '@/models/chatbot-conversation.model'
import {
	useAddMessageMutation,
	useCreateConversationMutation,
	useDeleteConversationMutation,
	useGetConversationsQuery,
	useUpdateConversationMutation
} from '@/services/chatbotConversationApi'
import { useAppSelector } from '@/store'
import { LecturerCard } from './component/LecturerCard'
import { getUserIdFromAppUser, sleep } from '@/utils/utils'
import { useBreadcrumb } from '@/hooks'
import clsx from 'clsx'

const API_BASE = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000/api'
const DESCRIPTION_PREVIEW_LENGTH = 150

interface ChatResponse {
	response: string
	steps?: Array<{
		tool: string
		input: any
		output: string
	}>
	success: boolean
}

type AgentUXEvent =
	| {
			type: 'step'
			step: 'receive_request' | 'thinking' | 'tool_running' | 'tool_done'
			tool?: string
			message?: string
	  }
	| {
			type: 'content'
			delta: string
	  }
	| {
			type: 'result'
			resultType: 'topics' | 'lecturers'
			payload: any
	  }
	| {
			type: 'done'
	  }
	| {
			type: 'error'
			error: string
	  }

type UXStepStatus = 'pending' | 'running' | 'done'

interface UXStep {
	key: string
	label: string
	status: UXStepStatus
	runtimeLabel?: string
}

interface AgentStepperProps {
	steps: UXStep[]
}

export function AgentStepper({ steps }: AgentStepperProps) {
	return (
		<div className='flex flex-col gap-3 rounded-lg border bg-muted/30 p-4'>
			{steps.map((step, index) => {
				const isLast = index === steps.length - 1

				return (
					<div key={step.key} className='flex items-start gap-3'>
						{/* ICON + LINE */}
						<div className='flex flex-col items-center'>
							{step.status === 'done' && <CheckCircle2 className='h-4 w-4 text-green-600' />}

							{step.status === 'running' && <Loader2 className='h-4 w-4 animate-spin text-blue-600' />}

							{step.status === 'pending' && (
								<div className='h-4 w-4 rounded-full border border-muted-foreground/40' />
							)}

							{!isLast && <div className='mt-1 h-6 w-px bg-muted-foreground/20' />}
						</div>

						{/* LABEL */}
						<div
							className={cn(
								'text-sm leading-snug transition-all',
								step.status === 'running' && 'font-medium',
								step.status === 'done' && 'text-muted-foreground',
								step.status === 'pending' && 'text-muted-foreground/60'
							)}
						>
							{step.status === 'running' ? (
								<span className='shimmer-text'>{step.runtimeLabel ?? step.label}</span>
							) : (
								<span>{step.runtimeLabel ?? step.label}</span>
							)}
						</div>
					</div>
				)
			})}
		</div>
	)
}

export const AIAssistantPage = () => {
	const { conversationId } = useParams<{ conversationId: string }>()

	const { setHidden } = useBreadcrumb()

	useEffect(() => {
		setHidden(true)
		return () => setHidden(false)
	}, [setHidden])

	const { toast } = useToast()
	//const { data: chatbot, isLoading: isLoadingChatbot } = useGetChatbotVersionQuery()
	//endpoint để tạo mới cuộc trò chuyện
	const [createConversation, { isLoading: isCreatingConversation }] = useCreateConversationMutation()
	//endpoint để thêm message vào cuộc trò chuyện hiện tại
	const [addMessage, { isLoading: isAddingMessage }] = useAddMessageMutation()
	//endpoint lấy danh sách các cuộc trò chuyện
	const { data: conversations, isLoading: isLoadingConversations } = useGetConversationsQuery({ status: 'active' })
	//gọi endpoint ddeeer xóa cuộc trò chuyện
	const [deleteConversation, { isLoading: isDeletingConversation }] = useDeleteConversationMutation()
	//gọi endpoint để cập nhật title cuộc trò chuyện
	const [updateConversation, { isLoading: isUpdatingConversation }] = useUpdateConversationMutation()
	const { data: chatbot, isLoading: isLoadingChatbot } = useGetChatbotVersionQuery()
	const user = useAppSelector((state) => state.auth.user)
	const [currentChatId, setCurrentChatId] = useState<string>('default')
	const [chatHistories, setChatHistories] = useState<GetConversationsDto[]>([
		{
			_id: 'default',
			title: 'Chat mới',
			messages: [
				{
					id: '1',
					content:
						'Chào bạn! Tôi là AI Assistant của hệ thống UIT Thesis Management. Tôi có thể hỗ trợ bạn:\n\n• 🎯 Gợi ý đề tài phù hợp\n• 🔍 Tìm kiếm thông tin trong thư viện số\n• 📊 Đánh giá tiến độ nghiên cứu\n• 🛡️ Kiểm tra đạo văn\n• 📈 Phân tích xu hướng đề tài\n\nBạn cần hỗ trợ gì hôm nay?',
					role: 'assistant',
					timestamp: new Date(),
					topics: []
				}
			],
			status: 'active',
			lastMessageAt: new Date()
		}
	])
	useEffect(() => {
		if (conversations && conversations.length > 0) {
			setChatHistories(conversations)
		}
	}, [conversations])
	const [messages, setMessages] = useState<ConversationMessage[]>(chatHistories[0].messages)
	const [inputValue, setInputValue] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [showSidebar, setShowSidebar] = useState(true)
	const [useStreaming, setUseStreaming] = useState(false)
	const [agentSteps, setAgentSteps] = useState<AgentUXEvent[]>([])
	const [uxSteps, setUxSteps] = useState<UXStep[]>([])
	const [collapseStepper, setCollapseStepper] = useState(false)
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
	const [chatToDelete, setChatToDelete] = useState<string | null>(null)
	const navigate = useNavigate()
	const [isEdittingId, setIsEdittingId] = useState<string | null>(null)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const inputRef = useRef<HTMLTextAreaElement>(null)
	const fullContentRef = useRef('')

	const userId = getUserIdFromAppUser(useAppSelector((state) => state.auth.user))

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		if (conversationId && chatHistories.length > 0) {
			const foundChat = chatHistories.find((c) => c._id === conversationId)
			if (foundChat && foundChat._id !== currentChatId) {
				selectChat(conversationId)
			}
		}
	}, [conversationId, chatHistories])
	useEffect(() => {
		scrollToBottom()
	}, [messages])

	useEffect(() => {
		inputRef.current?.focus()
	}, [])

	const updateStepStatus = (key: string, status: UXStepStatus) => {
		setUxSteps((prev) => prev.map((s) => (s.key === key ? { ...s, status } : s)))
	}

	const runStep = async (key: string, runtimeLabel?: string) => {
		setUxSteps((prev) =>
			prev.map((s) => {
				if (s.key === key) {
					return {
						...s,
						status: 'running',
						runtimeLabel: runtimeLabel ?? s.runtimeLabel
					}
				}
				if (s.status === 'running') {
					return { ...s, status: 'done' }
				}
				return s
			})
		)
	}

	const finishStep = (key: string) => {
		setUxSteps((prev) => prev.map((s) => (s.key === key ? { ...s, status: 'done' } : s)))
	}
	const pushStep = (key: string, label: string, runtimeLabel?: string) => {
		setUxSteps((prev) => {
			if (prev.some((s) => s.key === key)) return prev

			return [
				...prev.map((s) =>
					s.status === ('running' as UXStepStatus) ? { ...s, status: 'done' as UXStepStatus } : s
				),
				{
					key,
					label,
					runtimeLabel,
					status: 'running' as UXStepStatus
				}
			]
		})
	}
	const updateRuntimeLabel = (key: string, runtimeLabel: string) => {
		setUxSteps((prev) => prev.map((s) => (s.key === key && s.status === 'running' ? { ...s, runtimeLabel } : s)))
	}

	const selectChat = (chatId: string) => {
		const chat = chatHistories.find((c) => c._id === chatId)
		if (chat) {
			setCurrentChatId(chatId)
			setMessages(chat.messages)
			// Update URL
			navigate(`/ai-chat/${chatId}`, { replace: true })
		}
	}

	const confirmDeleteChat = async () => {
		if (!chatToDelete) return

		if (chatHistories.length === 1) {
			toast({
				title: 'Không thể xóa',
				description: 'Phải có ít nhất một cuộc trò chuyện'
			})
			setDeleteDialogOpen(false)
			setChatToDelete(null)
			return
		}

		setChatHistories((prev) => prev.filter((c) => c._id !== chatToDelete))
		await deleteConversation(chatToDelete)
		if (currentChatId === chatToDelete) {
			const remainingChats = chatHistories.filter((c) => c._id !== chatToDelete)
			const newCurrentChat = remainingChats[0]
			setCurrentChatId(newCurrentChat._id)
			setMessages(newCurrentChat.messages)
		}

		toast({
			title: 'Đã xóa cuộc trò chuyện',
			description: 'Lịch sử chat đã được xóa'
		})

		setDeleteDialogOpen(false)
		setChatToDelete(null)
	}

	const deleteChat = (chatId: string) => {
		setChatToDelete(chatId)
		setDeleteDialogOpen(true)
	}

	const updateChatTitle = (chatId: string, firstMessage: string) => {
		const title = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '')
		setChatHistories((prev) => prev.map((chat) => (chat._id === chatId ? { ...chat, title } : chat)))
	}

	const quickPrompts = [
		{
			text: 'Gợi ý đề tài phù hợp với tôi',
			icon: Lightbulb,
			category: 'suggestion'
		},
		{
			text: 'Tìm đề tài về AI trong y tế',
			icon: Search,
			category: 'search'
		},
		{
			text: 'Kiểm tra đạo văn cho báo cáo',
			icon: CheckCircle,
			category: 'plagiarism'
		},
		{
			text: 'Xu hướng đề tài hot năm 2024',
			icon: TrendingUp,
			category: 'trends'
		},
		{
			text: 'Cấu trúc luận văn chuẩn',
			icon: FileText,
			category: 'structure'
		},
		{
			text: 'Phương pháp nghiên cứu nào phù hợp?',
			icon: BookOpen,
			category: 'methodology'
		}
	]

	// Helper function: Parse topics từ output JSON nếu có
	const parseTopicsFromContent = (content: string): TopicSnapshot[] | null => {
		try {
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

	// TopicCard Component
	const TopicCard: React.FC<{ topic: TopicSnapshot }> = ({ topic }) => {
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
					<span className='ml-2 rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700'>
						{topic.similarityScore.toFixed(2)}%
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

	const handleSend = async () => {
		if (!inputValue.trim()) return

		const payload: AddMessgePayload = {
			role: 'user',
			content: inputValue.trim()
		}
		let newChatIdStore = undefined
		let newMessageStore: ConversationMessage | undefined = undefined
		if (currentChatId === 'default') {
			//tạo mới cuộc hội thoại
			const { data: newConversation } = await createConversation({ initialMessage: inputValue.trim() })
			newChatIdStore = newConversation!.conversationId
			setCurrentChatId(newConversation!.conversationId)
			// Update URL
			navigate(`/ai-chat/${newConversation!.conversationId}`, { replace: true })
			newMessageStore = newConversation?.messsage
		} else {
			//thêm message mới vào cuộc hội thoại

			const { data: newMessage } = await addMessage({ id: currentChatId, data: payload })
			newMessageStore = newMessage
		}
		setMessages((prev) => [...prev, newMessageStore!])

		setInputValue('')
		setIsLoading(true)

		try {
			await sendStreamingChat(newChatIdStore ? newChatIdStore : currentChatId)
		} catch (error) {
			console.error('Send error:', error)
		} finally {
			setIsLoading(false)
		}
	}
	const hasStartedContentRef = useRef(false)

	const sendStreamingChat = async (chatId: string) => {
		setCollapseStepper(false)
		setUxSteps([])
		hasStartedContentRef.current = false
		fullContentRef.current = ''

		const streamingMessageId = Date.now().toString()
		const streamingMessage: ConversationMessage = {
			id: streamingMessageId,
			role: 'assistant',
			content: '',
			timestamp: new Date(),
			isStreaming: true
		}

		setMessages((prev) => [...prev, streamingMessage])

		const handleAgentEvent = (event: AgentUXEvent) => {
			switch (event.type) {
				/**
				 * =====================
				 * STEP EVENTS
				 * =====================
				 */
				case 'step': {
					switch (event.step) {
						case 'receive_request': {
							pushStep('receive_request', 'Nhận yêu cầu')
							break
						}

						case 'thinking': {
							pushStep('thinking', 'Đang phân tích yêu cầu')
							break
						}

						case 'tool_running': {
							if (!event.tool) return

							pushStep(event.tool, 'Đang xử lý', event.message ?? 'Đang xử lý')
							break
						}

						case 'tool_done': {
							if (!event.tool) return

							finishStep(event.tool)
							break
						}
					}

					break
				}

				/**
				 * =====================
				 * STREAMING CONTENT
				 * =====================
				 */
				case 'content': {
					// Collapse thinking NGAY KHI có content đầu tiên
					if (!hasStartedContentRef.current) {
						hasStartedContentRef.current = true
						finishStep('thinking')
						setCollapseStepper(true)
					}

					fullContentRef.current += event.delta

					setMessages((prev) =>
						prev.map((m) => (m.id === streamingMessageId ? { ...m, content: fullContentRef.current } : m))
					)
					break
				}

				/**
				 * =====================
				 * FINAL RESULTS (OPTIONAL)
				 * =====================
				 */
				case 'result': {
					setMessages((prev) =>
						prev.map((m) =>
							m.id === streamingMessageId
								? {
										...m,
										[event.resultType]: event.resultType === 'topics' ? event.payload : undefined,
										lecturers: event.resultType === 'lecturers' ? event.payload : undefined
									}
								: m
						)
					)
					break
				}

				/**
				 * =====================
				 * DONE
				 * =====================
				 */
				case 'done': {
					setMessages((prev) =>
						prev.map((m) => (m.id === streamingMessageId ? { ...m, isStreaming: false } : m))
					)

					setTimeout(() => {
						setCollapseStepper(true)
					}, 200)

					break
				}

				/**
				 * =====================
				 * ERROR
				 * =====================
				 */
				case 'error': {
					console.error('Agent error:', event.error)

					setMessages((prev) =>
						prev.map((m) =>
							m.id === streamingMessageId
								? {
										...m,
										content: m.content || `Xin lỗi, đã xảy ra lỗi: ${event.error}`,
										isStreaming: false
									}
								: m
						)
					)
					setCollapseStepper(true)
					break
				}
			}
		}

		try {
			const response = await fetch(`${API_BASE}/chatbot-agent/stream-chat`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					message: inputValue,
					chatHistory: messages.map((m) => ({
						role: m.role,
						content: m.content
					})),
					userId
				})
			})

			if (!response.ok) {
				throw new Error('Stream failed')
			}

			const reader = response.body!.getReader()
			const decoder = new TextDecoder()
			let buffer = ''

			while (true) {
				const { done, value } = await reader.read()
				if (done) break

				buffer += decoder.decode(value, { stream: true })

				let lines = buffer.split('\n')
				buffer = lines.pop() || ''

				for (const line of lines) {
					if (!line.trim()) continue

					const event: AgentUXEvent = JSON.parse(line)
					handleAgentEvent(event)
				}
			}
			const newMessage = messages.filter((m) => m.id === streamingMessageId)[0]
            
			const newPayload: AddMessgePayload = {
				role: 'assistant',
				content: newMessage.content 
			}
			await addMessage({ id: chatId, data: newPayload })
		} catch (error: any) {
			console.error('❌ Stream error:', error)
			const newMessagePayload: AddMessgePayload = {
				role: 'assistant',
				content: `Xin lỗi, đã có lỗi xảy ra: ${error.message}`
			}
			await addMessage({ id: chatId, data: newMessagePayload })
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

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter' && !e.shiftKey && !isAddingMessage) {
			e.preventDefault()
			handleSend()
		}
	}

	const handleQuickPrompt = (prompt: string) => {
		setInputValue(prompt)
		inputRef.current?.focus()
	}

	const handleFeedback = (messageId: string, type: 'like' | 'dislike') => {
		toast({
			title: type === 'like' ? 'Cảm ơn phản hồi!' : 'Chúng tôi sẽ cải thiện',
			description:
				type === 'like'
					? 'Phản hồi này giúp AI học hỏi tốt hơn'
					: 'Phản hồi của bạn giúp chúng tôi cải thiện chất lượng'
		})
	}
	const handleCreateNewChat = () => {
		setCurrentChatId('default')
		setMessages([
			{
				id: '1',
				content:
					'Chào bạn! Tôi là AI Assistant của hệ thống UIT Thesis Management. Tôi có thể hỗ trợ bạn:\n\n• 🎯 Gợi ý đề tài phù hợp\n• 🔍 Tìm kiếm thông tin trong thư viện số\n• 📊 Đánh giá tiến độ nghiên cứu\n• 🛡️ Kiểm tra đạo văn\n• 📈 Phân tích xu hướng đề tài\n\nBạn cần hỗ trợ gì hôm nay?',
				role: 'assistant',
				timestamp: new Date(),
				topics: []
			}
		])
		setIsLoading(false)
		navigate('/ai-chat', { replace: true })
	}

	// Parse agent response để loại bỏ cấu trúc ReAct (Question, Thought, Final Answer)
	const parseAgentResponse = (content: string): string => {
		if (!content) return content

		// Tìm "Final Answer:" và lấy phần sau nó
		const finalAnswerMatch = content.match(/Final Answer:\s*([\s\S]*)/i)
		if (finalAnswerMatch && finalAnswerMatch[1]) {
			return finalAnswerMatch[1].trim()
		}

		// Nếu không tìm thấy Final Answer, trả về content gốc
		return content
	}

	return (
		<div className='flex h-full w-full'>
			{/* Sidebar lịch sử */}
			{showSidebar && (
				<div className='flex w-80 flex-col border-r bg-muted/30'>
					{/* Header sidebar */}
					<div className='border-b p-4'>
						<div className='mb-3 flex items-center justify-between'>
							<h2 className='flex items-center gap-2 text-[15px] font-semibold'>
								<History className='h-5 w-5 text-primary' />
								Lịch sử chat
							</h2>
							<Button size='sm' className='gap-0' onClick={handleCreateNewChat}>
								<Plus className='mr-1 h-4 w-4 text-white' />
								<span className='text-[12px]'>Mới</span>
							</Button>
						</div>
					</div>

					{/* Danh sách chat */}
					{isLoadingConversations ? (
						<div className='flex h-full w-full items-center justify-center'>
							<Loader2 className='h-8 w-8 animate-spin' />
						</div>
					) : (
						<ScrollArea className='h-full flex-1'>
							<div className='space-y-1 p-2'>
								{chatHistories.map((chat) => (
									<div
										key={chat._id}
										className={`group flex cursor-pointer items-center gap-2 rounded-lg p-3 transition-colors hover:bg-muted ${
											currentChatId === chat._id ? 'border border-primary/20 bg-primary/10' : ''
										}`}
										onClick={() => selectChat(chat._id)}
									>
										<MessageSquare className='h-4 w-4 flex-shrink-0 text-muted-foreground' />
										<div className='min-w-0 flex-1'>
											{isEdittingId === chat._id ? (
												<input
													type='text'
													className='w-full rounded-md border border-gray-300 px-2 py-1 text-sm'
													value={chat.title}
													onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
														const updatedTitle = e.target.value
														setChatHistories((prev) =>
															prev.map((c) =>
																c._id === chat._id ? { ...c, title: updatedTitle } : c
															)
														)
													}}
													onBlur={async () => {
														setIsEdittingId(null)
														await updateConversation({
															id: chat._id,
															data: { title: chat.title }
														})
													}}
													onKeyDown={async (e: React.KeyboardEvent<HTMLInputElement>) => {
														if (e.key === 'Enter') {
															setIsEdittingId(null)
															await updateConversation({
																id: chat._id,
																data: { title: chat.title }
															})
														}
													}}
													autoFocus
												/>
											) : (
												<p
													className='truncate text-wrap text-sm font-medium text-gray-900 hover:bg-gray-200'
													onDoubleClick={() => setIsEdittingId(chat._id)}
													title='Nhấn đúp để đổi tên'
												>
													{chat.title}
												</p>
											)}
											<p className='text-xs text-muted-foreground'>
												<Clock className='mr-1 inline h-3 w-3' />
												{new Date(chat.lastMessageAt).toLocaleString('vi-VN')}
											</p>
										</div>
										{chatHistories.length > 1 && (
											<Button
												variant='ghost'
												size='sm'
												className='h-6 w-6 p-0 opacity-0 hover:bg-red-100 group-hover:opacity-100'
												onClick={(e) => {
													e.stopPropagation()
													deleteChat(chat._id)
												}}
											>
												<Trash2 className='h-3 w-3 text-red-500' />
											</Button>
										)}
									</div>
								))}
							</div>
						</ScrollArea>
					)}
				</div>
			)}

			{/* Khu vực chat chính */}
			<div className={`mx-auto flex w-full flex-1 flex-col`}>
				{/* Header */}
				<div className='flex items-center justify-between border-b bg-gradient-to-r from-primary/5 to-primary/10 p-4'>
					<div className='flex items-center gap-3'>
						<Button
							variant='ghost'
							size='sm'
							onClick={() => setShowSidebar(!showSidebar)}
							className='lg:hidden'
						>
							<Menu className='h-4 w-4' />
						</Button>
						<div className='relative'>
							<Bot className='h-8 w-8 text-primary' />

							<div
								className={cn(
									'absolute -right-1 -top-1 h-3 w-3 animate-pulse rounded-full',
									chatbot?.status === 'enabled' ? 'bg-green-500' : 'bg-gray-500'
								)}
							/>
						</div>
						<div>
							<h1 className='text-[14px] font-bold text-primary'>{chatbot?.name}</h1>
							<p className='text-[12px] text-muted-foreground'>
								{chatbot?.description || 'Hỗ trợ nghiên cứu và quản lý đề tài thông minh'}
							</p>
						</div>
					</div>
					<div className='flex items-center gap-2'>
						{chatbot?.status === 'enabled' ? (
							<Badge variant='outline' className='border-green-200 bg-green-50 text-xs text-green-700'>
								<div className='mr-1 h-2 w-2 rounded-full bg-green-500' />
								Trực tuyến
							</Badge>
						) : (
							<Badge variant='outline' className='border-gray-200 bg-gray-50 text-xs text-gray-700'>
								<div className='mr-1 h-2 w-2 rounded-full bg-gray-500' />
								Ngoại tuyến
							</Badge>
						)}

						<Button
							variant='outline'
							size='sm'
							onClick={() => setShowSidebar(!showSidebar)}
							className='hidden lg:flex'
						>
							<History className='mr-2 h-3 w-3' />
							<span className='text-xs'>{showSidebar ? 'Ẩn lịch sử' : 'Hiện lịch sử'}</span>
						</Button>
					</div>
				</div>

				{/* Quick Prompts */}
				<div className='flex items-center gap-1 border-b bg-muted/30 p-2'>
					<h3 className='text-sm font-medium text-muted-foreground'>💡 Gợi ý câu hỏi:</h3>
					<div className='grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4'>
						{chatbot?.query_suggestions.map((prompt, index) => {
							//const IconComponent = prompt.icon;
							return (
								<Button
									key={index}
									variant='outline'
									size='sm'
									className='h-auto justify-start p-3 text-left hover:border-primary/20 hover:bg-primary/5'
									onClick={() => handleQuickPrompt(prompt.content)}
								>
									{/* <IconComponent className="h-4 w-4 mr-2 text-primary flex-shrink-0" /> */}
									<span className='text-xs'>{prompt.content}</span>
								</Button>
							)
						})}
					</div>
				</div>

				{/* Messages */}
				<div className='flex-1 overflow-hidden'>
					<ScrollArea className='h-full'>
						<div className='space-y-6 p-6'>
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex gap-4 ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
								>
									{message.role === 'assistant' ? (
										<Avatar className='h-10 w-10 border-2 border-primary/20'>
											<AvatarFallback className='bg-blue-700 text-primary-foreground'>
												{chatbot?.avatarUrl ? (
													<img src={chatbot.avatarUrl} alt='Bot Avatar' />
												) : (
													<Bot className='h-5 w-5' />
												)}
											</AvatarFallback>
										</Avatar>
									) : (
										<Avatar className='h-10 w-10 border-2 border-muted'>
											<AvatarFallback className='bg-muted'>
												{user?.avatarUrl ? (
													<img src={user.avatarUrl} alt='User Avatar' />
												) : (
													<User className='h-5 w-5' />
												)}
											</AvatarFallback>
										</Avatar>
									)}

									<div className='max-w-[85%]'>
										{message.role === 'assistant' && message.isStreaming && (
											<div
												className={cn(
													'mb-3 overflow-hidden transition-all duration-500',
													collapseStepper ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'
												)}
											>
												<AgentStepper steps={uxSteps} />
											</div>
										)}
										{(message.content.trim().length > 0 ||
											message.topics?.length ||
											message.lecturers?.length) && (
											<div
												className={`rounded-2xl p-4 ${
													message.role === 'user'
														? 'rounded-br-md bg-blue-600 text-primary-foreground'
														: 'rounded-bl-md border bg-card shadow-sm'
												}`}
											>
												<div
													className={`text-sm leading-relaxed ${
														message.role === 'user' ? 'text-white' : 'text-black'
													}`}
													dangerouslySetInnerHTML={{
														__html: renderMarkdown(
															message.role === 'assistant'
																? parseAgentResponse(message.content)
																: message.content
														)
													}}
												/>
											</div>
										)}

										{/* Topic cards */}
										{message.topics && message.topics.length > 0 && (
											<div className='mt-3'>
												<div className='mb-2 text-sm font-medium text-gray-700'>
													Tìm thấy {message.topics.length} đề tài:
												</div>
												{message.topics.map((topic) => (
													<TopicCard key={topic._id} topic={topic} />
												))}
											</div>
										)}

										{/* Lecturer cards */}
										{message.lecturers && message.lecturers.length > 0 && (
											<div className='mt-3'>
												<div className='mb-2 text-sm font-medium text-gray-700'>
													Tìm thấy {message.lecturers.length} giảng viên:
												</div>
												{message.lecturers.map((lecturer) => (
													<LecturerCard key={lecturer._id} lecturer={lecturer} />
												))}
											</div>
										)}

										<div className='mt-2 flex items-center justify-between'>
											<span className='text-xs text-muted-foreground'>
												{new Date(message.timestamp).toLocaleTimeString('vi-VN')}
											</span>

											{message.role === 'assistant' && (
												<div className='flex items-center gap-1'>
													<Button
														variant='ghost'
														size='sm'
														className='h-6 w-6 p-0 hover:bg-green-100'
														onClick={() => handleFeedback(message.id, 'like')}
													>
														<ThumbsUp className='h-3 w-3' />
													</Button>
													<Button
														variant='ghost'
														size='sm'
														className='h-6 w-6 p-0 hover:bg-red-100'
														onClick={() => handleFeedback(message.id, 'dislike')}
													>
														<ThumbsDown className='h-3 w-3' />
													</Button>
												</div>
											)}
										</div>
									</div>
								</div>
							))}

							<div ref={messagesEndRef} />
						</div>
					</ScrollArea>
				</div>

				{/* Input */}
				<div className='border-t bg-background p-2'>
					<div className='mx-auto max-w-4xl'>
						<div className='flex items-end gap-3'>
							<div className='flex-1'>
								<Textarea
									ref={inputRef}
									value={inputValue}
									onChange={(e) => setInputValue(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder='Hỏi AI về đề tài, báo cáo, hoặc xu hướng nghiên cứu...'
									className='max-h-[120px] min-h-[52px] resize-none rounded-xl border-2 focus:border-primary/50'
									rows={1}
								/>
							</div>
							<div className='flex gap-2'>
								{/* <Button
									variant='outline'
									size='icon'
									className='h-12 w-12 rounded-xl'
									title='Đính kèm file'
								>
									<Paperclip className='h-5 w-5' />
								</Button> */}
								<Button
									size='icon'
									className='h-12 w-12 rounded-xl bg-blue-700 hover:bg-blue-600'
									onClick={handleSend}
									disabled={!inputValue.trim() || isLoading}
									title='Gửi tin nhắn (Enter)'
								>
									<Send className='h-5 w-5' />
								</Button>
							</div>
						</div>

						<div className='mt-2 flex items-center justify-between text-xs text-muted-foreground'>
							<div className='flex items-center gap-4'>
								<span>💡 Nhấn Enter để gửi, Shift+Enter để xuống dòng</span>
								{/* <Badge variant='outline' className='text-xs'>
									🔒 Chat được mã hóa và chỉ dùng cho mục đích học thuật
								</Badge> */}
							</div>
							<span className={`${inputValue.length > 1800 ? 'text-red-500' : ''}`}>
								{inputValue.length}/2000
							</span>
						</div>
					</div>
				</div>
			</div>

			{/* Dialog xác nhận xóa */}
			<AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa cuộc trò chuyện</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa cuộc trò chuyện này? Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel onClick={() => setChatToDelete(null)}>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={confirmDeleteChat} className='bg-red-600 hover:bg-red-700'>
							{isDeletingConversation && <Loader2 className='h-5 w-5' />}
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
