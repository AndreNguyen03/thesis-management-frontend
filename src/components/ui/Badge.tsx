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
	| 'success'
	| 'graybold'
	| 'status'
	| 'mini'
	| 'outlineBlue'
	| 'info'
	| 'warning'

interface BadgeProps {
	children: ReactNode
	variant?: BadgeVariant
	className?: string
}

export const Badge = ({ children, variant = 'default', className }: BadgeProps) => {
	const variantStyles: Record<BadgeVariant, string> = {
		default: 'bg-primary text-primary-foreground transition-transform scale-100 hover:scale-105',
		destructive: 'bg-red-600 text-white transition-transform scale-100 hover:scale-105',
		secondary: 'bg-gray-200 text-gray-800 transition-transform scale-100 hover:scale-105',
		outline: 'border border-gray-300 text-gray-800 transition-transform scale-100 hover:scale-105',
		registered: 'bg-green-600 text-white transition-transform scale-100 hover:scale-105',
		blue: 'bg-blue-600 text-white transition-transform scale-100 hover:scale-105',
		lightBlue: 'bg-blue-100 text-blue-800',
		gray: 'border border-gray-500 text-gray-700',
		graybold: 'bg-gray-500 text-white',
		success: 'bg-green-600 text-white',
		//màu xanh nhạt
		status: 'bg-green-100 text-green-800',
		mini: 'px-1.5 py-0.5 text-xs bg-gray-200 text-gray-800 transition-transform scale-100 hover:scale-105',
		outlineBlue: 'border border-blue-500 text-blue-700 px-1 py-0',
		info: 'bg-indigo-600 text-white',
		warning: 'bg-yellow-500 text-yellow-900 transition-transform scale-100 hover:scale-105'
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
