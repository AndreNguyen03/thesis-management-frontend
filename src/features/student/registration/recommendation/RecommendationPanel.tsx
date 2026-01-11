/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react'
import { X, Sparkles, Loader2, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { RecommendationCard } from './RecommendationCard'
import { FallbackState } from './FallbackState'
import { useRecommendTopicInPeriodQuery } from '@/services/recommendApi'
import type { FallbackTopic, RecommendationResult, RecommendTopic } from '@/models/recommend.model'
import { ConfirmRecommendModal } from '../topics/ConfirmRecommendModal'
import { useCreateRegistrationMutation } from '@/services/registrationApi'
import { toast } from '@/hooks/use-toast'

interface RecommendationPanelProps {
	isOpen: boolean
	onClose: () => void
	periodId: string
	setActiveTab: (tab: 'list' | 'registered') => void
}

export function RecommendationPanel({ isOpen, onClose, periodId, setActiveTab }: RecommendationPanelProps) {
	const [visibleCards, setVisibleCards] = useState<number[]>([])
	const [isExpanded, setIsExpanded] = useState(false)
	// const [expandedVisibleCards, setExpandedVisibleCards] = useState<number[]>([])
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isRegistering, setIsRegistering] = useState(false)
	const [selectedTopic, setSelectedTopic] = useState<RecommendTopic | FallbackTopic | null>(null)

	const [createRegistration] = useCreateRegistrationMutation()
	const {
		data: recommendations,
		isLoading: loadingRecommend,
		isFetching,
		isError
	} = useRecommendTopicInPeriodQuery(periodId, {
		skip: !isOpen || !periodId
	})

	console.log('recommendations', recommendations)

	const recommendTopics = useMemo(() => {
		return (
			recommendations?.data
				.filter((r) => r.type === 'recommend')
				.map((r) => ({ ...r.topic, rank: r.rank, badges: r.badges, badgeSummary: r.badgeSummary })) ?? []
		)
	}, [recommendations?.data])

	const fallbackTopics = useMemo(() => {
		return (
			recommendations?.data
				.filter((r) => r.type === 'fallback')
				.map((r) => ({ ...r.topic, rank: r.rank, badges: r.badges, badgeSummary: r.badgeSummary })) ?? []
		)
	}, [recommendations?.data])

	const hasRecommend = recommendTopics?.length ?? 0 > 0

	const personalizedTopics = recommendTopics?.slice(0, 3)
	// const allRecommendedTopics = recommendTopics

	useEffect(() => {
		if (!loadingRecommend && recommendTopics.length > 0) {
			setVisibleCards([])
			recommendTopics.slice(0, 3).forEach((_, index) => {
				setTimeout(() => {
					setVisibleCards((prev) => [...prev, index])
				}, index * 300)
			})
		}
	}, [loadingRecommend, recommendTopics])

	// useEffect(() => {
	// 	if (isExpanded) {
	// 		setExpandedVisibleCards([])
	// 		allRecommendedTopics?.forEach((_, index) => {
	// 			setTimeout(() => {
	// 				setExpandedVisibleCards((prev) => [...prev, index])
	// 			}, index * 100)
	// 		})
	// 	}
	// }, [isExpanded, allRecommendedTopics])

	const handleConfirmRegisterRecommend = async () => {
		if (!selectedTopic?._id) return
		setIsRegistering(true)

		try {
			await createRegistration({ topicId: selectedTopic._id }).unwrap()
			// close confirm modal right away
			setIsConfirmOpen(false)
			// slide out panel and switch to registered after a short delay to allow modal animation
			setTimeout(() => {
				onClose()
				setActiveTab('registered')
			}, 200)
		} catch (err: any) {
			toast({
				title: 'Không thể đăng ký',
				description: err?.data?.message || 'Đăng ký thất bại',
				variant: 'destructive'
			})
		} finally {
			setIsRegistering(false)
		}
	}

	const handleRegisterRecommendClick = (topic: RecommendTopic | FallbackTopic) => {
		setSelectedTopic(topic)
		setIsConfirmOpen(true)
	}

	// const handleExpand = () => {
	// 	setIsExpanded(true)
	// }

	const handleCollapse = () => {
		setIsExpanded(false)
		// setExpandedVisibleCards([])
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
									? `${recommendTopics?.length} đề tài phù hợp với bạn`
									: hasRecommend
										? 'Dựa trên hồ sơ của bạn'
										: 'Đề tài phổ biến'}
							</p>
						</div>
						{isRegistering && (
							<div className='absolute inset-0 z-50 flex items-center justify-center bg-black/40'>
								<div className='flex items-center gap-2 rounded-md bg-card/90 px-4 py-2'>
									<Loader2 className='h-5 w-5 animate-spin text-muted-foreground' />
									<span className='text-sm text-muted-foreground'>Đang đăng ký...</span>
								</div>
							</div>
						)}
					</div>
					<Button variant='ghost' size='icon' onClick={onClose}>
						<X className='h-4 w-4' />
					</Button>
				</div>

				<div
					className={`overflow-y-auto rounded-b-xl ${isExpanded ? 'h-[calc(100%-73px)]' : 'h-[calc(100%-73px)]'}`}
				>
					{loadingRecommend || isFetching ? (
						<div className='flex flex-col items-center justify-center gap-4 py-16'>
							<Loader2 className='h-8 w-8 animate-spin text-muted-foreground' />
						</div>
					) : hasRecommend ? (
						<div className='space-y-4 p-6'>
							{personalizedTopics?.map((topic, index) => {
								const result: RecommendationResult = {
									topic,
									type: 'recommend',
									rank: topic.rank,
									badges: topic.badges,
									badgeSummary: topic.badgeSummary
								}

								return (
									<div
										key={topic._id}
										className={`transition-all duration-500 ease-out ${
											visibleCards.includes(index)
												? 'translate-x-0 opacity-100'
												: 'translate-x-8 opacity-0'
										}`}
									>
										{visibleCards.includes(index) && (
											<RecommendationCard
												onRegister={handleRegisterRecommendClick}
												result={result}
												index={index}
											/>
										)}
									</div>
								)
							})}
						</div>
					) : (
						/* ================= FALLBACK ================= */
						<div className='space-y-6 p-6'>
							<FallbackState />
							{fallbackTopics?.map((topic, index) => {
								const result: RecommendationResult = {
									topic,
									type: 'fallback',
									rank: topic.rank,
									badges: topic.badges,
									badgeSummary: topic.badgeSummary
								}

								return (
									<RecommendationCard
										onRegister={handleRegisterRecommendClick}
										key={topic._id}
										result={result}
										index={index}
									/>
								)
							})}

							{!hasRecommend && (
								<p className='border-t border-border pt-4 text-center text-xs text-muted-foreground'>
									Cập nhật hồ sơ để nhận gợi ý được cá nhân hóa
								</p>
							)}
						</div>
					)}
				</div>
			</div>

			<ConfirmRecommendModal
				isOpen={isConfirmOpen}
				topicTitle={selectedTopic?.titleVN || ''}
				topicCreateByInfo={selectedTopic?.createByInfo.fullName || ''}
				onConfirm={handleConfirmRegisterRecommend}
				onClose={() => setIsConfirmOpen(false)}
				isLoading={isRegistering}
			/>
		</>
	)
}
