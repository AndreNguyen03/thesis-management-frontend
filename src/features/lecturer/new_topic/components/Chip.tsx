import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ChipProps {
	label: string
	onRemove: () => void
	className?: string
}

export function Chip({ label, onRemove, className }: ChipProps) {
	return (
		<div
			className={cn(
				'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5',
				'bg-secondary text-secondary-foreground',
				'border border-border',
				'transition-all duration-200',
				'hover:shadow-sm',
				'duration-200 animate-in fade-in-0 zoom-in-95',
				className
			)}
		>
			<span className='text-sm font-medium'>{label}</span>
			<button
				onClick={onRemove}
				className='rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1'
				aria-label={`Remove ${label}`}
			>
				<X className='h-3.5 w-3.5' />
			</button>
		</div>
	)
}
