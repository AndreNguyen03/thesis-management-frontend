import React from 'react'
import type { LucideIcon } from 'lucide-react'

interface StatCardProps {
	title: string
	value: string | number
	subtitle?: string
	icon: LucideIcon
	variant: 'primary' | 'success' | 'warning' | 'info'
	trend?: {
		value: number
		isPositive: boolean
	}
}

const variantStyles = {
	primary: {
		card: 'bg-primary/10',
		icon: 'bg-primary text-white',
		text: 'text-primary'
	},
	success: {
		card: 'bg-success/10',
		icon: 'bg-success text-white',
		text: 'text-success'
	},
	warning: {
		card: 'bg-warning/10',
		icon: 'bg-warning text-white',
		text: 'text-warning'
	},
	info: {
		card: 'bg-muted',
		icon: 'bg-muted-foreground text-white',
		text: 'text-muted-foreground'
	}
}

export const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle, icon: Icon, variant, trend }) => {
	const styles = variantStyles[variant]
	return (
		<div className={`rounded-lg p-4 flex items-center gap-3 ${styles.card}`}>
			<div className={`rounded-full p-2 shadow ${styles.icon}`}>
				<Icon className='h-5 w-5' />
			</div>
			<div className='flex-1'>
				<div className='flex items-baseline gap-2'>
					<span className={`text-2xl font-bold ${styles.text}`}>{value}</span>
					{trend && (
						<span className={`inline-flex items-center text-xs font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}>
							{trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
						</span>
					)}
				</div>
				<p className='text-sm font-medium text-muted-foreground'>{title}</p>
				{subtitle && <p className='mt-1 text-xs text-muted-foreground'>{subtitle}</p>}
			</div>
		</div>
	)
}
