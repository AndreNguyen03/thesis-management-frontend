import { useState, type ReactNode } from 'react'

export const Dropdown = ({ trigger, children }: { trigger: ReactNode; children: ReactNode }) => {
	const [isOpen, setIsOpen] = useState(false)

	return (
		<div className='relative'>
			<div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
			{isOpen && (
				<div className='absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5'>
					{children}
				</div>
			)}
		</div>
	)
}
