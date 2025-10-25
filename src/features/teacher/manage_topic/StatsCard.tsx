import { Card, CardContent } from '@/components/ui/card'
import type { LucideIcon } from 'lucide-react'

interface StatsCardProps {
	title: string
	value: string | number
	icon: LucideIcon
	description?: string
	trend?: {
		value: string
		isPositive: boolean
	}
}

export function StatsCard({ title, value, icon: Icon, description, trend }: StatsCardProps) {
	return (
		<Card className='overflow-hidden transition-shadow hover:shadow-md'>
			<CardContent className='p-6'>
				<div className='flex items-center justify-between'>
					<div className='space-y-1'>
						<p className='text-sm font-medium text-muted-foreground'>{title}</p>
						<p className='text-3xl font-bold text-foreground'>{value}</p>
						{description && <p className='text-sm text-muted-foreground'>{description}</p>}
						{trend && (
							<p
								className={`text-sm font-medium ${trend.isPositive ? 'text-success' : 'text-destructive'}`}
							>
								{trend.isPositive ? '↑' : '↓'} {trend.value}
							</p>
						)}
					</div>
					<div className='flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10'>
						<Icon className='h-7 w-7 text-primary' />
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
