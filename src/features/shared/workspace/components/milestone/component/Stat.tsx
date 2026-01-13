import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

type StatVariant = 'default' | 'success' | 'warning' | 'info' | 'danger'

interface StatProps {
	title: string
	value: string | number
	icon: LucideIcon
	variant?: StatVariant
}

const VARIANT_STYLES: Record<
	StatVariant,
	{
		card: string
		iconBg: string
		iconColor: string
	}
> = {
	default: {
		card: 'bg-white border-slate-200',
		iconBg: 'bg-slate-100',
		iconColor: 'text-slate-600'
	},
	success: {
		card: 'bg-white border-emerald-200',
		iconBg: 'bg-emerald-100',
		iconColor: 'text-emerald-600'
	},
	info: {
		card: 'bg-white border-indigo-200',
		iconBg: 'bg-indigo-100',
		iconColor: 'text-indigo-600'
	},
	warning: {
		card: 'bg-white border-orange-200',
		iconBg: 'bg-orange-100',
		iconColor: 'text-orange-600'
	},
	danger: {
		card: 'bg-white border-red-200',
		iconBg: 'bg-red-100',
		iconColor: 'text-red-600'
	}
}

export const Stat = ({ title, value, icon: Icon, variant = 'default' }: StatProps) => {
	const styles = VARIANT_STYLES[variant]

	return (
		<div
			className={cn(
				'flex items-center gap-4 rounded-xl border p-4 shadow-sm transition-colors',
				styles.card
			)}
		>
			<div
				className={cn(
					'flex h-10 w-10 items-center justify-center rounded-lg',
					styles.iconBg
				)}
			>
				<Icon className={cn('h-5 w-5', styles.iconColor)} />
			</div>

			<div className='min-w-0'>
				<p className='text-xs font-medium text-muted-foreground'>{title}</p>
				<p className='truncate text-lg font-semibold text-slate-900'>{value}</p>
			</div>
		</div>
	)
}
