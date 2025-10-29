import { parseMarkdown } from '@/utils/markdown'
import { Bot } from 'lucide-react'
import React, { useEffect, useState } from 'react'

const Bubble: React.FC<{ message: string; role: string }> = ({ message, role }) => {
	const [html, setHtml] = useState('')
	useEffect(() => {
		parseMarkdown(message).then(setHtml)
	}, [message])
	const baseClass =
		'max-w-4/5 m-2 w-4/5 break-words px-4 py-3 text-left text-[15px] shadow-[0_8px_24px_rgba(149,157,165,0.1)] border-none'
	const userClass = 'rounded-[20px_20px_0_20px] bg-[#e1f4ff] ml-auto text-[#1a365d]'
	const assistantClass = 'rounded-[18px] text-[#383838] bg-white self-start'
	return (
		<div>
			<div className={'ml-2 flex items-end'}>
				{role === 'assistant' ? <Bot /> : <span className='ml-auto font-light'>You</span>}
			</div>

			<div
				className={`${baseClass} ${role === 'user' ? userClass : assistantClass}`}
				dangerouslySetInnerHTML={{ __html: html }}
			/>
		</div>
	)
}

export default Bubble
