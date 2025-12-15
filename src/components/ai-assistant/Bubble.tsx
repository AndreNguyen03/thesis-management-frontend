import { parseMarkdown } from '@/utils/markdown'
import { Bot } from 'lucide-react'
import React, { useEffect, useState } from 'react'

interface BubbleProps {
	message: string
	role: 'user' | 'assistant' | 'system'
}

const Bubble: React.FC<BubbleProps> = ({ message, role }) => {
	const [html, setHtml] = useState('')

	useEffect(() => {
		parseMarkdown(message).then(setHtml)
	}, [message])

	// Base styles
	const baseClass = 'max-w-[75%] m-2 break-words px-4 py-3 text-left text-sm shadow-sm'

	// Role-specific styles
	const userClass =
		'ml-auto rounded-tr-2xl rounded-tl-2xl rounded-bl-2xl bg-chat-bubble-user text-chat-bubble-user-foreground'
	const assistantClass =
		'self-start rounded-tr-2xl rounded-tl-2xl rounded-br-2xl bg-chat-bubble-other text-chat-bubble-other-foreground'

	return (
		<div className='flex flex-col'>
			{/* Header: Bot icon or 'You' */}
			<div className='mb-1 ml-2 flex items-end'>
				{role === 'assistant' ? (
					<Bot className='h-4 w-4 text-chat-bubble-other-foreground' />
				) : (
					<span className='ml-auto text-xs font-light text-chat-bubble-user-foreground'>You</span>
				)}
			</div>

			{/* Message bubble */}
			<div
				className={`${baseClass} ${role === 'user' ? userClass : assistantClass}`}
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	)
}

export default Bubble
