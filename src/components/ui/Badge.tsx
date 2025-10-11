import type { ReactNode } from 'react'

export const Badge = ({
	children,
	variant = 'default',
	className = ''
}: {
	children: ReactNode
	variant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'registered'
	className?: string
}) => {
	const variantStyles = {
		default: 'bg-primary text-primary-foreground',
		destructive: 'bg-red-600 text-white',
		secondary: 'bg-gray-200 text-gray-800',
		outline: 'border border-gray-300 text-gray-800',
		registered: 'bg-green-600 text-white'
	}

	return (
		<span
			className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`}
		>
			{children}
		</span>
	)
}
