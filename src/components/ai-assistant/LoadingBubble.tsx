import React from 'react'
import { Bot, Loader } from 'lucide-react'

const LoadingBubble = () => {
	return (
		<div className='mb-5 flex items-center p-4'>
			<Loader className='h-6 w-6 animate-spin text-[#411b8d]' />
		</div>
	)
}

export default LoadingBubble
