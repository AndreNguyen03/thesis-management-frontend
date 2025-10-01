import { useState, type ReactNode } from 'react'

interface DropdownProps {
	trigger: ReactNode
	children: ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export const Dropdown = ({ trigger, children, open, onOpenChange }: DropdownProps) => {
	const [internalOpen, setInternalOpen] = useState(false)

	// Nếu prop `open` được truyền thì dùng controlled mode,
	// ngược lại fallback sang internal state
	const isOpen = open !== undefined ? open : internalOpen

	const toggleOpen = () => {
		if (onOpenChange) {
			onOpenChange(!isOpen)
		} else {
			setInternalOpen(!isOpen)
		}
	}

	return (
		<div className='relative'>
			<div onClick={toggleOpen}>{trigger}</div>
			{isOpen && (
				<div className='absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5'>
					{children}
				</div>
			)}
		</div>
	)
}
