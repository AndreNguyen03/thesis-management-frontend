import { ChevronDown, ChevronRight } from 'lucide-react'
import React from 'react'

const TitleBox: React.FC<{ title: string; isExpanded: boolean; onClick: () => void }> = ({
	title,
	isExpanded,
	onClick
}) => {
	return (
		<div
			className='flex w-fit items-center space-x-2 border-sky-500 px-3 py-1 hover:cursor-pointer hover:bg-blue-50'
			style={{ borderWidth: 1 }}
			onClick={onClick}
		>
			{isExpanded ? <ChevronDown className='text-primary' /> : <ChevronRight className='text-primary' />}
			<h4 className='text-lg font-semibold text-primary'>{title}</h4>
		</div>
	)
}

export default TitleBox
