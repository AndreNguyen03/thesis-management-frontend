import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Bookmark, Heart, Star, Users, TrendingUp, Flame } from 'lucide-react'

interface TopicBadge {
	type: 'interest' | 'skill' | 'similar' | 'trend' | 'popular'
	label: string
}

interface Topic {
	rank: number
	title: string
	matchScore: number
	badges: TopicBadge[]
	fields: string[]
	instructor: string
	slots: number
}

interface RecommendationCardProps {
	topic: Topic
	index: number
}

const badgeConfig = {
	interest: {
		icon: Heart,
		className: 'bg-pink-500/10 text-pink-600 border-pink-200'
	},
	skill: {
		icon: Star,
		className: 'bg-blue-500/10 text-blue-600 border-blue-200'
	},
	similar: {
		icon: Users,
		className: 'bg-violet-500/10 text-violet-600 border-violet-200'
	},
	trend: {
		icon: TrendingUp,
		className: 'bg-amber-500/10 text-amber-600 border-amber-200'
	},
	popular: {
		icon: Flame,
		className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200'
	}
}

export function RecommendationCard({ topic, index }: RecommendationCardProps) {
	const isTopMatch = topic.matchScore >= 90

	return (
		<div
			className={`group relative rounded-lg border bg-card p-4 transition-all duration-300 hover:shadow-md ${
				isTopMatch ? 'border-foreground/20 shadow-sm' : 'border-border hover:border-foreground/10'
			}`}
			style={{
				animationDelay: `${index * 100}ms`
			}}
		>
			{/* Rank Badge */}
			<div className='absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-xs font-bold text-background'>
				#{topic.rank}
			</div>

			{/* Match Score */}
			<div className='absolute -right-1 -top-1'>
				<div
					className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
						isTopMatch ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
					}`}
				>
					{topic.matchScore}%
				</div>
			</div>

			{/* Content */}
			<div className='pt-2'>
				<div className='flex items-start justify-between gap-2'>
					<div className='flex-1'>
						<h4 className='pr-8 font-medium leading-tight text-foreground'>{topic.title}</h4>
						<div className='mt-1 flex items-center gap-2 text-xs text-muted-foreground'>
							<span>{topic.instructor}</span>
							<span>•</span>
							<div className='flex items-center gap-1'>
								{topic.fields.slice(0, 2).map((field, idx) => (
									<span key={idx}>
										{field}
										{idx < Math.min(topic.fields.length, 2) - 1 && ', '}
									</span>
								))}
								{topic.fields.length > 2 && (
									<span className='text-muted-foreground/70'>+{topic.fields.length - 2}</span>
								)}
							</div>
						</div>
					</div>
				</div>

				{/* Badges */}
				<div className='mt-3 flex flex-wrap gap-1.5'>
					{topic.badges.map((badge, idx) => {
						const config = badgeConfig[badge.type]
						const Icon = config.icon
						return (
							<Badge
								key={idx}
								variant='outline'
								className={`gap-1 text-[10px] font-normal ${config.className}`}
							>
								<Icon className='h-3 w-3' />
								{badge.label}
							</Badge>
						)
					})}
				</div>

				{/* Actions */}
				<div className='mt-4 flex items-center justify-between'>
					<span className={`text-xs ${topic.slots <= 2 ? 'text-red-500' : 'text-muted-foreground'}`}>
						Còn {topic.slots} slot
					</span>
					<div className='flex items-center gap-2'>
						<Button variant='ghost' size='icon' className='h-7 w-7'>
							<Bookmark className='h-3.5 w-3.5' />
						</Button>
						<Button size='sm' className='h-7 text-xs'>
							Đăng ký
						</Button>
					</div>
				</div>
			</div>
		</div>
	)
}
