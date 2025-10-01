import { type ReactNode } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

interface ProfileSectionProps {
	title: string
	children: ReactNode
	isOpen: boolean
	onToggle: () => void
}

export const ProfileSection = ({ title, children, isOpen, onToggle }: ProfileSectionProps) => {
	return (
		<div className='mb-4 rounded-xl border shadow-sm'>
			<button
				type='button'
				className='flex w-full items-center justify-between rounded-t-xl bg-gray-100 px-4 py-2'
				onClick={onToggle}
			>
				<h3 className='text-2xl font-semibold'>{title}</h3>
				{isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
			</button>
			{isOpen && <div className='p-4'>{children}</div>}
		</div>
	)
}
