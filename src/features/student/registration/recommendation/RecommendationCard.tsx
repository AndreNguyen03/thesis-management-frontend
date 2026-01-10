import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { FallbackTopic, RecommendationResult, RecommendTopic } from '@/models/recommend.model'

interface RecommendationCardProps {
    onRegister: (val: (RecommendTopic | FallbackTopic)) => void
	result: RecommendationResult
	index: number
}

export function RecommendationCard({ result, index, onRegister }: RecommendationCardProps) {
	const { topic, type, badges = [], rank, semanticScore } = result

	const slotsLeft = topic.maxStudents - topic.studentsNum
	const isFull = slotsLeft <= 0

	const scorePercent = type === 'recommend' && semanticScore ? Math.round(semanticScore * 100) : null

	const isTopMatch = scorePercent !== null && scorePercent >= 70

	return (
		<div
			className={cn(
				'group relative rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-md',
				type === 'recommend'
					? isTopMatch
						? 'border-foreground/20 shadow-sm'
						: 'border-border hover:border-foreground/10'
					: 'border-border'
			)}
			style={{ animationDelay: `${index * 100}ms` }}
		>
			{/* Rank */}
			{rank && (
				<div className='absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background'>
					#{rank}
				</div>
			)}

			{/* Score */}
			{scorePercent !== null && (
				<div className='absolute -right-1 -top-1'>
					<div
						className={cn(
							'rounded-full px-2 py-0.5 text-xs font-semibold',
							isTopMatch ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
						)}
					>
						{scorePercent}%
					</div>
				</div>
			)}

			{/* Content */}
			<div className='pt-2'>
				<h4 className='pr-8 font-medium leading-tight text-foreground'>{topic.titleVN}</h4>

				{/* Người tạo + Fields */}
				<div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
					{topic.createByInfo?.fullName && <span>{topic.createByInfo.fullName}</span>}
					{topic.fields?.length > 0 && (
						<>
							<span>•</span>
							<div className='flex items-center gap-1'>
								{topic.fields.slice(0, 2).map((field, idx) => (
									<span key={field._id ?? idx}>
										{field.name}
										{idx < Math.min(topic.fields.length, 2) - 1 && ', '}
									</span>
								))}
								{topic.fields.length > 2 && (
									<span className='text-muted-foreground/70'>+{topic.fields.length - 2}</span>
								)}
							</div>
						</>
					)}
				</div>

				{/* Badges */}
				{badges?.length > 0 && (
					<div className='mt-2 flex flex-wrap gap-1'>
						{badges.map((badge, idx) => (
							<>
								<span
									key={idx}
									className={cn(
										'rounded-full px-2 py-0.5 text-xs font-medium',
										badge.color === 'blue'
											? 'bg-blue-100 text-blue-800'
											: 'bg-muted text-muted-foreground'
									)}
									title={badge.tooltip}
								>
									{badge.label}
								</span>
							</>
						))}
					</div>
				)}

				{/* Actions */}
				<div className='mt-4 flex items-center justify-between'>
					<span className={cn('text-xs', isFull ? 'text-red-500' : 'text-muted-foreground')}>
						{isFull ? 'Đã hết slot' : `Còn ${slotsLeft} slot`}
					</span>

					<Button size='sm' className='h-7 text-xs' disabled={isFull} onClick={() => onRegister(topic)}>
						Đăng ký
					</Button>
				</div>
			</div>
		</div>
	)
}
