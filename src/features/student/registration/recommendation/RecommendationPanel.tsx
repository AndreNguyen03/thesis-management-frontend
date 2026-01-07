import { useState, useEffect, useMemo } from 'react'
import { X, Sparkles, ArrowRight, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RecommendationCard } from './RecommendationCard'
import { FallbackState } from './FallbackState'
import { useRecommendTopicInPeriodQuery } from '@/services/recommendApi'
import type { FallbackTopic, RecommendTopic } from '@/models/recommend.model'

interface RecommendationPanelProps {
	isOpen: boolean
	onClose: () => void
	hasProfile: boolean
	periodId: string
}

export function RecommendationPanel({ isOpen, onClose, hasProfile, periodId }: RecommendationPanelProps) {
	const [visibleCards, setVisibleCards] = useState<number[]>([])
	const [isExpanded, setIsExpanded] = useState(false)
	const [expandedVisibleCards, setExpandedVisibleCards] = useState<number[]>([])

	const {
		data: recommendations,
		isLoading: loadingRecommend,
		isFetching,
		isError
	} = useRecommendTopicInPeriodQuery(periodId, {
		skip: !isOpen
	})

	console.log('recommendations', recommendations)

	const recommendTopics = useMemo(() => {
		return recommendations?.data?.filter((r) => r.type === 'recommend').map((r) => r.topic) ?? []
	}, [recommendations])

	const fallbackTopics = useMemo(() => {
		return recommendations?.data?.filter((r) => r.type === 'fallback').map((r) => r.topic) ?? []
	}, [recommendations])

	const hasRecommend = recommendTopics.length > 0

	const personalizedTopics = useMemo(() => recommendTopics.slice(0, 3), [recommendTopics])

	const allRecommendedTopics = recommendTopics

	useEffect(() => {
		if (!loadingRecommend && personalizedTopics.length > 0) {
			setVisibleCards([])
			personalizedTopics.forEach((_, index) => {
				setTimeout(() => {
					setVisibleCards((prev) => [...prev, index])
				}, index * 300)
			})
		}
	}, [loadingRecommend, personalizedTopics.length])

	useEffect(() => {
		if (isExpanded) {
			setExpandedVisibleCards([])
			allRecommendedTopics.forEach((_, index) => {
				setTimeout(() => {
					setExpandedVisibleCards((prev) => [...prev, index])
				}, index * 100)
			})
		}
	}, [isExpanded, allRecommendedTopics.length])
	const handleExpand = () => {
		setIsExpanded(true)
	}

	const handleCollapse = () => {
		setIsExpanded(false)
		setExpandedVisibleCards([])
	}

	if (isError) {
		return (
			<div className='p-6 text-sm text-muted-foreground'>Không thể tải gợi ý đề tài. Vui lòng thử lại sau.</div>
		)
	}
	return (
		<>
			<div
				className={`fixed z-50 border border-border bg-card shadow-2xl transition-all duration-500 ease-out ${
					isExpanded ? 'inset-4 rounded-2xl' : 'right-4 top-10 h-[85vh] w-full max-w-md rounded-xl'
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
								{(allRecommendedTopics as RecommendTopic[]).map((topic, index) => (
									<div
										key={index}
										className={`transition-all duration-500 ease-out ${
											expandedVisibleCards.includes(index)
												? 'translate-y-0 opacity-100'
												: 'translate-y-4 opacity-0'
										}`}
									>
										{expandedVisibleCards.includes(index) && (
											<RecommendationCard topic={topic} index={index} mode='recommend' />
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
					) : hasRecommend ? (
						/* ================= RECOMMEND ================= */
						<div className='space-y-4 p-6'>
							{loadingRecommend || isFetching ? (
								/* loading giữ nguyên */
								<div className='flex flex-col items-center justify-center gap-4 py-16'>
									<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
								</div>
							) : (
								<>
									{(personalizedTopics as RecommendTopic[]).map((topic, index) => (
										<div
											key={topic._id ?? index}
											className={`transition-all duration-500 ease-out ${
												visibleCards.includes(index)
													? 'translate-x-0 opacity-100'
													: 'translate-x-8 opacity-0'
											}`}
										>
											{visibleCards.includes(index) && (
												<RecommendationCard topic={topic} index={index} mode='recommend' />
											)}
										</div>
									))}

									{visibleCards.length === personalizedTopics.length && (
										<Button variant='outline' className='mt-4 w-full gap-2' onClick={handleExpand}>
											<span>Xem tất cả gợi ý</span>
											<ArrowRight className='h-4 w-4' />
										</Button>
									)}
								</>
							)}
						</div>
					) : (
						/* ================= FALLBACK ================= */
						<div className='space-y-6 p-6'>
							<FallbackState />

							{(fallbackTopics as FallbackTopic[]).map((topic, index) => (
								<RecommendationCard
									key={topic._id ?? index}
									topic={topic}
									index={index}
									mode='fallback' // ✅ có badge + rank
								/>
							))}

							{!hasProfile && (
								<p className='border-t border-border pt-4 text-center text-xs text-muted-foreground'>
									Cập nhật hồ sơ để nhận gợi ý được cá nhân hóa
								</p>
							)}
						</div>
					)}
				</div>
			</div>
		</>
	)
}
