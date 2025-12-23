import { useState, useEffect } from 'react'
import { X, Sparkles, ArrowRight, TrendingUp, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RecommendationCard } from './RecommendationCard'
import { FallbackState } from './FallBackState'

interface RecommendationPanelProps {
	isOpen: boolean
	onClose: () => void
	hasProfile: boolean
}

const personalizedTopics = [
	{
		rank: 1,
		title: 'Ứng dụng AI trong chẩn đoán y tế',
		matchScore: 95,
		badges: [
			{ type: 'interest' as const, label: 'Khớp sở thích' },
			{ type: 'skill' as const, label: 'Kỹ năng phù hợp' },
			{ type: 'trend' as const, label: 'Xu hướng 2024' }
		],
		fields: ['AI/ML', 'Healthcare'],
		instructor: 'TS. Nguyễn Văn A',
		slots: 2
	},
	{
		rank: 2,
		title: 'Hệ thống nhận diện khuôn mặt real-time',
		matchScore: 88,
		badges: [
			{ type: 'skill' as const, label: 'Python Expert' },
			{ type: 'similar' as const, label: 'SV tương tự chọn' }
		],
		fields: ['AI/ML', 'Security'],
		instructor: 'PGS.TS. Hoàng Văn E',
		slots: 1
	},
	{
		rank: 3,
		title: 'Website thương mại điện tử với Next.js',
		matchScore: 82,
		badges: [
			{ type: 'interest' as const, label: 'Web Development' },
			{ type: 'popular' as const, label: '24 quan tâm' }
		],
		fields: ['Web', 'E-commerce'],
		instructor: 'TS. Lê Văn C',
		slots: 5
	}
]

const allRecommendedTopics = [
	...personalizedTopics,
	{
		rank: 4,
		title: 'Phát triển Chatbot hỗ trợ học tập',
		matchScore: 78,
		badges: [
			{ type: 'interest' as const, label: 'NLP' },
			{ type: 'trend' as const, label: 'Hot 2024' }
		],
		fields: ['AI/ML', 'Education'],
		instructor: 'TS. Trần Văn B',
		slots: 3
	},
	{
		rank: 5,
		title: 'Ứng dụng mobile theo dõi sức khỏe',
		matchScore: 75,
		badges: [
			{ type: 'skill' as const, label: 'React Native' },
			{ type: 'popular' as const, label: '15 quan tâm' }
		],
		fields: ['Mobile', 'Healthcare', 'AI/ML'],
		instructor: 'ThS. Phạm Thị D',
		slots: 4
	},
	{
		rank: 6,
		title: 'Hệ thống quản lý thư viện thông minh',
		matchScore: 72,
		badges: [{ type: 'similar' as const, label: 'SV tương tự chọn' }],
		fields: ['Web', 'Database'],
		instructor: 'TS. Nguyễn Văn F',
		slots: 2
	},
	{
		rank: 7,
		title: 'Game giáo dục với Unity',
		matchScore: 68,
		badges: [{ type: 'interest' as const, label: 'Game Dev' }],
		fields: ['Game', 'Education'],
		instructor: 'ThS. Lê Văn G',
		slots: 3
	},
	{
		rank: 8,
		title: 'Hệ thống IoT giám sát môi trường',
		matchScore: 65,
		badges: [
			{ type: 'trend' as const, label: 'IoT Trending' },
			{ type: 'skill' as const, label: 'Embedded' }
		],
		fields: ['IoT', 'Embedded', 'Data'],
		instructor: 'PGS.TS. Trần Văn H',
		slots: 2
	}
]

const popularTopics = [
	{
		title: 'Website thương mại điện tử với Next.js',
		interactions: 24,
		fields: ['Web', 'E-commerce'],
		instructor: 'TS. Lê Văn C'
	},
	{
		title: 'Hệ thống nhận diện khuôn mặt real-time',
		interactions: 18,
		fields: ['AI/ML', 'Security'],
		instructor: 'PGS.TS. Hoàng Văn E'
	},
	{
		title: 'Ứng dụng mobile theo dõi sức khỏe',
		interactions: 15,
		fields: ['Mobile', 'Healthcare', 'AI/ML'],
		instructor: 'ThS. Phạm Thị D'
	}
]

export function RecommendationPanel({ isOpen, onClose, hasProfile }: RecommendationPanelProps) {
	const [isLoading, setIsLoading] = useState(false)
	const [visibleCards, setVisibleCards] = useState<number[]>([])
	const [isExpanded, setIsExpanded] = useState(false)
	const [expandedVisibleCards, setExpandedVisibleCards] = useState<number[]>([])

	useEffect(() => {
		if (isOpen && hasProfile && !isExpanded) {
			setIsLoading(true)
			setVisibleCards([])

			const loadingTimer = setTimeout(() => {
				setIsLoading(false)
				personalizedTopics.forEach((_, index) => {
					setTimeout(() => {
						setVisibleCards((prev) => [...prev, index])
					}, index * 400)
				})
			}, 1500)

			return () => clearTimeout(loadingTimer)
		} else if (!isOpen) {
			setVisibleCards([])
			setIsLoading(false)
			setIsExpanded(false)
			setExpandedVisibleCards([])
		}
	}, [isOpen, hasProfile, isExpanded])

	useEffect(() => {
		if (isExpanded) {
			setExpandedVisibleCards([])
			allRecommendedTopics.forEach((_, index) => {
				setTimeout(() => {
					setExpandedVisibleCards((prev) => [...prev, index])
				}, index * 150)
			})
		}
	}, [isExpanded])

	const handleExpand = () => {
		setIsExpanded(true)
	}

	const handleCollapse = () => {
		setIsExpanded(false)
		setExpandedVisibleCards([])
	}

	return (
		<>
			<div
				className={`fixed z-50 border border-border bg-card shadow-2xl transition-all duration-500 ease-out ${
					isExpanded ? 'inset-4 rounded-2xl' : 'top-10 right-4 h-[85vh] w-full max-w-md rounded-xl'
				} ${isOpen ? 'translate-x-0 opacity-100' : 'pointer-events-none translate-x-full opacity-0'}`}
			>
				<div className='flex items-center justify-between rounded-t-xl border-b border-border px-6 py-4'>
					{isExpanded && (
						<Button variant='ghost' size='icon' onClick={handleCollapse} className='mr-2'>
							<ArrowLeft className='h-4 w-4' />
						</Button>
					)}
					<div className='flex items-center gap-2'>
						<div className='flex h-8 w-8 items-center justify-center rounded-lg bg-primary'>
							<Sparkles className='h-4 w-4 text-primary-foreground' />
						</div>
						<div>
							<h2 className='font-semibold text-foreground'>
								{isExpanded ? 'Tất cả gợi ý' : 'Gợi ý cho bạn'}
							</h2>
							<p className='text-xs text-muted-foreground'>
								{isExpanded
									? `${allRecommendedTopics.length} đề tài phù hợp với bạn`
									: hasProfile
										? 'Dựa trên hồ sơ của bạn'
										: 'Đề tài phổ biến'}
							</p>
						</div>
					</div>
					<Button variant='ghost' size='icon' onClick={onClose}>
						<X className='h-4 w-4' />
					</Button>
				</div>

				<div
					className={`overflow-y-auto rounded-b-xl ${isExpanded ? 'h-[calc(100%-73px)]' : 'h-[calc(100%-73px)]'}`}
				>
					{isExpanded ? (
						<div className='p-6'>
							<div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
								{allRecommendedTopics.map((topic, index) => (
									<div
										key={topic.rank}
										className={`transition-all duration-500 ease-out ${
											expandedVisibleCards.includes(index)
												? 'translate-y-0 opacity-100'
												: 'translate-y-4 opacity-0'
										}`}
									>
										{expandedVisibleCards.includes(index) && (
											<RecommendationCard topic={topic} index={index} />
										)}
									</div>
								))}
							</div>

							{expandedVisibleCards.length === allRecommendedTopics.length && (
								<p className='mt-6 border-t border-border pt-6 text-center text-xs text-muted-foreground duration-500 animate-in fade-in'>
									Gợi ý dựa trên sở thích, kỹ năng và hành vi của sinh viên tương tự bạn
								</p>
							)}
						</div>
					) : hasProfile ? (
						<div className='space-y-4 p-6'>
							{isLoading ? (
								<div className='flex flex-col items-center justify-center gap-4 py-16'>
									<div className='relative'>
										<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
										<Sparkles className='absolute -right-1 -top-1 h-4 w-4 animate-pulse text-foreground' />
									</div>
									<div className='space-y-1 text-center'>
										<p className='text-sm font-medium text-foreground'>Đang phân tích hồ sơ...</p>
										<p className='text-xs text-muted-foreground'>
											Tìm kiếm đề tài phù hợp nhất cho bạn
										</p>
									</div>
									<div className='flex gap-1'>
										<div
											className='h-2 w-2 animate-bounce rounded-full bg-foreground/30'
											style={{ animationDelay: '0ms' }}
										/>
										<div
											className='h-2 w-2 animate-bounce rounded-full bg-foreground/30'
											style={{ animationDelay: '150ms' }}
										/>
										<div
											className='h-2 w-2 animate-bounce rounded-full bg-foreground/30'
											style={{ animationDelay: '300ms' }}
										/>
									</div>
								</div>
							) : (
								<>
									{personalizedTopics.map((topic, index) => (
										<div
											key={topic.rank}
											className={`transition-all duration-500 ease-out ${
												visibleCards.includes(index)
													? 'translate-x-0 opacity-100'
													: 'translate-x-8 opacity-0'
											}`}
										>
											{visibleCards.includes(index) && (
												<RecommendationCard topic={topic} index={index} />
											)}
										</div>
									))}

									{visibleCards.length === personalizedTopics.length && (
										<>
											<Button
												variant='outline'
												className='mt-4 w-full gap-2 bg-transparent duration-500 animate-in fade-in'
												onClick={handleExpand}
											>
												<span>Xem tất cả gợi ý</span>
												<ArrowRight className='h-4 w-4' />
											</Button>

											<p className='border-t border-border pt-4 text-center text-xs text-muted-foreground duration-500 animate-in fade-in'>
												Gợi ý dựa trên sở thích, kỹ năng và hành vi của sinh viên tương tự bạn
											</p>
										</>
									)}
								</>
							)}
						</div>
					) : (
						<div className='space-y-6 p-6'>
							<FallbackState />

							<div className='space-y-3'>
								<div className='flex items-center gap-2 text-sm font-medium text-foreground'>
									<TrendingUp className='h-4 w-4' />
									<span>Đề tài nhiều người quan tâm</span>
								</div>

								{popularTopics.map((topic, index) => (
									<div
										key={index}
										className='rounded-lg border border-border bg-card p-4 transition-all hover:bg-muted/30'
										style={{ animationDelay: `${index * 100}ms` }}
									>
										<div className='flex items-start justify-between gap-3'>
											<div className='flex-1'>
												<h4 className='text-sm font-medium text-foreground'>{topic.title}</h4>
												<p className='mt-1 text-xs text-muted-foreground'>{topic.instructor}</p>
											</div>
											<div className='flex items-center gap-1 text-xs text-muted-foreground'>
												<TrendingUp className='h-3 w-3 text-emerald-500' />
												<span>{topic.interactions}</span>
											</div>
										</div>
									</div>
								))}
							</div>

							<p className='border-t border-border pt-4 text-center text-xs text-muted-foreground'>
								Cập nhật hồ sơ để nhận gợi ý được cá nhân hóa
							</p>
						</div>
					)}
				</div>
			</div>
		</>
	)
}
