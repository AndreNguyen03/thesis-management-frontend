import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import type { FallbackTopic, RecommendTopic } from '@/models/recommend.model'

type RecommendationCardProps =
	| {
			mode: 'recommend'
			topic: RecommendTopic
			index: number
	  }
	| {
			mode: 'fallback'
			topic: FallbackTopic
			index: number
	  }

export function RecommendationCard(props: RecommendationCardProps) {
	const { topic, index, mode } = props

	const slotsLeft = topic.maxStudents - topic.studentsNum
	const isFull = slotsLeft <= 0

	// ✅ TS biết chắc chỉ recommend mới có score
	const scorePercent = mode === 'recommend' ? Math.round(topic.score * 100) : null

	const isTopMatch = mode === 'recommend' && scorePercent !== null && scorePercent >= 70

	return (
		<div
			className={cn(
				'group relative rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-md',
				mode === 'recommend'
					? isTopMatch
						? 'border-foreground/20 shadow-sm'
						: 'border-border hover:border-foreground/10'
					: 'border-border'
			)}
			style={{ animationDelay: `${index * 100}ms` }}
		>
			{/* Rank – CHỈ fallback */}
			{mode === 'fallback' && (
				<div className='absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background'>
					#{index + 1}
				</div>
			)}

			{/* Score – CHỈ recommend */}
			{mode === 'recommend' && scorePercent !== null && (
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

				<div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
					<span>{topic.createByInfo.fullName}</span>
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
				</div>

				{/* Actions */}
				<div className='mt-4 flex items-center justify-between'>
					<span className={cn('text-xs', isFull ? 'text-red-500' : 'text-muted-foreground')}>
						{isFull ? 'Đã hết slot' : `Còn ${slotsLeft} slot`}
					</span>

					<Button size='sm' className='h-7 text-xs' disabled={isFull}>
						Đăng ký
					</Button>
				</div>
			</div>
		</div>
	)
}
