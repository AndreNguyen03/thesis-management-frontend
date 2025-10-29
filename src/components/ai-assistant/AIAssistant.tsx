import { useRef, useEffect, useState } from 'react'
import { MessageCircle, Send, Sparkles } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/Dialog'
import { Badge, Button, Input } from '../ui'
import { DialogDescription } from '@radix-ui/react-dialog'
import { useChat } from '@ai-sdk/react'
import { TextStreamChatTransport } from 'ai'
import Bubble from './Bubble'
import LoadingBubble from './LoadingBubble'
const suggestedQuestions = [
	'Cách đăng ký đề tài luận văn?',
	'Tìm đề tài phù hợp với ngành AI',
	'Quy trình nộp báo cáo tiến độ',
	'Liên hệ giảng viên hướng dẫn',
	'Xu hướng đề tài hot năm 2024'
]

export const AIAssistant = () => {
	const [isOpen, setIsOpen] = useState(false)
	const [input, setInput] = useState('')
	const bottomRef = useRef<HTMLDivElement>(null)

	const { messages, sendMessage, status } = useChat({
		transport: new TextStreamChatTransport({
			api: 'http://localhost:3000/api/chatbot'
		})
	})

	useEffect(() => {
		if (bottomRef.current) {
			bottomRef.current.scrollIntoView({ behavior: 'smooth' })
		}
	}, [messages, status])

	const noMessages = !messages || messages.length === 0
	const handleSubmit = (promptText: string) => {
		//console.log('Submitting prompt:', promptText)
		sendMessage({ text: promptText })
		setInput('')
	}
	const handleQuestionClick = (question: string) => {
		setInput(question)
	}
	return (
		<>
			{/* Floating Button */}
			<Dialog open={isOpen} onOpenChange={setIsOpen}>
				<DialogTrigger asChild>
					<Button
						className='fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full bg-gradient-primary shadow-xl transition-all duration-300 hover:shadow-2xl'
						size='icon'
					>
						<MessageCircle className='h-6 w-6' />
						<div className='absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent'>
							<Sparkles className='h-2 w-2 text-accent-foreground' />
						</div>
					</Button>
				</DialogTrigger>

				<DialogContent className='flex max-h-[80vh] flex-col sm:max-w-2xl'>
					<DialogHeader>
						<DialogTitle className='flex items-center gap-2'>
							<div className='flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary'>
								<Sparkles className='h-4 w-4 text-primary-foreground' />
							</div>
							AI Assistant - UIT Thesis Management
						</DialogTitle>
						<DialogDescription>
							Trợ lý AI thông minh giúp bạn trong quá trình nghiên cứu và quản lý đề tài
						</DialogDescription>
					</DialogHeader>

					{/* Chat Messages */}
					{!noMessages && (
						<div className='flex-1 space-y-4 overflow-y-auto py-4'>
							{messages.map((message, index) => {
								return message.parts.map((part, i) => {
									switch (part.type) {
										case 'text':
											return (
												<Bubble
													key={`message-${index}-part-${i}`}
													message={part.text}
													role={message.role}
												/>
											)
									}
								})
							})}
							{status !== 'ready' && <LoadingBubble />}
							<div ref={bottomRef} />
						</div>
					)}
					{/* Suggested Questions */}
					<div className='border-t pt-4'>
						<p className='mb-2 text-sm font-medium'>Câu hỏi gợi ý:</p>
						<div className='mb-4 flex flex-wrap gap-2'>
							{suggestedQuestions.map((question, index) => (
								<div key={index} onClick={() => handleQuestionClick(question)}>
									<Badge variant='outline' className='cursor-pointer text-xs hover:bg-muted'>
										{question}
									</Badge>
								</div>
							))}
						</div>
					</div>

					{/* Message Input */}
					<div className='gap-2 border-t pt-4'>
						<form
							onSubmit={(e) => {
								e.preventDefault()
								handleSubmit(input)
								setInput('')
							}}
						>
							<div className='grid w-full grid-cols-5 gap-2'>
								<Input
									className='col-span-4'
									onChange={(e) => setInput(e.target.value)}
									value={input}
									placeholder='Hãy hỏi tôi bất cứ điều gì...'
									disabled={status !== 'ready'}
								/>
								<Button
									className='col-span-1'
									variant='outline'
									value={status !== 'ready' ? 'Thinking...' : 'Send'}
									disabled={status !== 'ready'}
								>
									<Send className='h-4 w-4' />
								</Button>
							</div>
						</form>
					</div>
				</DialogContent>
			</Dialog>
		</>
	)
}
