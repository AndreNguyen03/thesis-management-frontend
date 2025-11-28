import type { PhaseStats } from '@/models/period.model'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { iconVariantStyles, statVariantClasses } from '../utils'

interface StatsCardsProps {
	stats: PhaseStats[]
	onClick?: (chosenStats: PhaseStats) => void
}

export function StatsCards({ stats, onClick }: StatsCardsProps) {
	return (
		<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
			{stats.map((stat, index) => {
				const Icon = stat.icon

				return (
					<motion.div
						key={stat.status}
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: index * 0.1 }}
						whileHover={{ y: -5 }} // ✨ hover dịch lên 5px
						whileTap={{ y: 2 }} // ✨ click dịch xuống 2px
						style={{ cursor: onClick ? 'pointer' : 'default' }}
						onClick={() => onClick?.(stat)}
					>
						<div
							className={cn(
								'animate-fade-in rounded-lg border p-6 shadow-card transition-all duration-200',
								statVariantClasses[stat.variant ?? 'primary']
							)}
						>
							<div className='flex items-start justify-between'>
								<div className='space-y-2'>
									<p className='text-sm font-medium text-muted-foreground'>{stat.label}</p>
									<div className='flex items-baseline gap-2'>
										<p className='text-3xl font-bold tracking-tight text-foreground'>
											{stat.value}
										</p>
									</div>
									{stat.description && (
										<p className='text-xs text-muted-foreground'>{stat.description}</p>
									)}
								</div>
								<div className={cn('rounded-lg p-3', iconVariantStyles[stat.variant ?? 'default'])}>
									{Icon && <Icon className='h-4 w-4' />}
								</div>
							</div>
						</div>
					</motion.div>
				)
			})}
		</div>
	)
}
