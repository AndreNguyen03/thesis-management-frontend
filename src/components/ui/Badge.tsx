import type { ReactNode } from 'react'

export const Badge = ({
	children,
	variant = 'default',
	className = ''
}: {
	children: ReactNode
	variant?: 'default' | 'destructive' | 'secondary'
	className?: string
}) => {
	const variantStyles = {
		default: 'bg-primary text-primary-foreground',
		destructive: 'bg-red-600 text-white',
		secondary: 'bg-gray-200 text-gray-800'
	}

	return (
		<span
			className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-semibold ${variantStyles[variant]} ${className}`}
		>
			{children}
		</span>
	)
}
