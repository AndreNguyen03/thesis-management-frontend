import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PhaseStats } from '@/models/period.model'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

interface StatsCardsProps {
	stats: PhaseStats[]
}

export function StatsCards({ stats }: StatsCardsProps) {
	const getVariantClasses = (variant?: string) => {
		switch (variant) {
			case 'success':
				return 'border-success/20 bg-success/5'
			case 'warning':
				return 'border-warning/20 bg-warning/5'
			case 'destructive':
				return 'border-destructive/20 bg-destructive/5'
			default:
				return 'border-primary/20 bg-primary/5'
		}
	}

	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			{stats.map((stat, index) => (
				<motion.div
					key={stat.label}
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ delay: index * 0.1 }}
				>
					<Card className={cn('px-4 py-2 transition-all hover:shadow-md', getVariantClasses(stat.variant))}>
						<CardHeader className='pb-2'>
							<CardTitle className='text-sm font-medium text-muted-foreground'>{stat.label}</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='text-3xl font-bold'>{stat.value}</div>
						</CardContent>
					</Card>
				</motion.div>
			))}
		</div>
	)
}
