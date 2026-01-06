import { useState, useRef, useEffect, type ReactNode } from 'react'

interface DropdownProps {
	trigger: ReactNode
	children: ReactNode
	open?: boolean
	onOpenChange?: (open: boolean) => void
}

export const Dropdown = ({ trigger, children, open, onOpenChange }: DropdownProps) => {
	const [internalOpen, setInternalOpen] = useState(false)
	const dropdownRef = useRef<HTMLDivElement>(null)

	// Controlled hay internal state
	const isOpen = open !== undefined ? open : internalOpen

	const toggleOpen = () => {
		if (onOpenChange) {
			onOpenChange(!isOpen)
		} else {
			setInternalOpen(!isOpen)
		}
	}

	// Click outside handler
	useEffect(() => {
		const handleClickOutside = (e: MouseEvent) => {
			if (isOpen && dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				if (onOpenChange) {
					onOpenChange(false)
				} else {
					setInternalOpen(false)
				}
			}
		}

		document.addEventListener('mousedown', handleClickOutside)
		return () => document.removeEventListener('mousedown', handleClickOutside)
	}, [isOpen, onOpenChange])

	return (
		<div ref={dropdownRef} className='relative'>
			<div onClick={toggleOpen}>{trigger}</div>
			{isOpen && (
				<div className='absolute right-0 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black/5'>
					{children}
				</div>
			)}
		</div>
	)
}
