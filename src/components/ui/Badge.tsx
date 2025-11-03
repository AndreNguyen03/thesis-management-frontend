import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export type BadgeVariant =
	| 'default'
	| 'destructive'
	| 'secondary'
	| 'outline'
	| 'registered'
	| 'blue'
	| 'gray'
	| 'lightBlue'

interface BadgeProps {
	children: ReactNode
	variant?: BadgeVariant
	className?: string
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
	const variantStyles: Record<BadgeVariant, string> = {
		default: 'bg-primary text-primary-foreground',
		destructive: 'bg-red-600 text-white',
		secondary: 'bg-gray-200 text-gray-800 scale-100 hover:scale-105',
		outline: 'border border-gray-300 text-gray-800',
		registered: 'bg-green-600 text-white',
		blue: 'bg-blue-600 text-white transition-transform scale-100 hover:scale-105',
		lightBlue: 'bg-blue-100 text-blue-800',
		gray: 'border border-gray-500 text-gray-700'
	}

	return (
		<span
			className={cn(
				'inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold transition-transform',
				variantStyles[variant],
				className
			)}
		>
			{children}
		</span>
	)
}
