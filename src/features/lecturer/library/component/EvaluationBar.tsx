import React, { useState } from 'react'
import { Loader2, Star } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EvaluationBarProps {
	topicId?: string
	initialRating?: number
	totalReviews: number
	userRating?: number // Rating hiện tại của user (nếu đã vote)
	onRatingSubmit?: (rating: number) => void
	distribution: Record<number, number>
	isLoadingMyRating?: boolean
}

const EvaluationBar: React.FC<EvaluationBarProps> = ({
	topicId,
	initialRating = 0,
	totalReviews = 1,
	userRating,
	onRatingSubmit,
	distribution,
	isLoadingMyRating
}) => {
	const [hoveredStar, setHoveredStar] = useState<number>(0)
	const [selectedRating, setSelectedRating] = useState<number>(userRating ?? 5)
	const [isSubmitting, setIsSubmitting] = useState(false)

	// Xử lý khi user click vào sao
	const handleStarClick = (rating: number) => {
		setSelectedRating(rating)
	}

	// Xử lý submit rating
	const handleSubmitRating = async () => {
		if (selectedRating === 0) return

		setIsSubmitting(true)
		// TODO: Call API để lưu rating
		if (onRatingSubmit) {
			onRatingSubmit(selectedRating)
		}
	}

	// Render một sao
	const renderStar = (index: number) => {
		const rating = index + 1
		const isFilled = rating <= (hoveredStar || selectedRating)
		const isHalfFilled = !isFilled && rating - 0.5 <= initialRating

		return (
			<button
				key={index}
				type='button'
				className='relative transition-transform duration-200 hover:scale-110 focus:outline-none'
				onMouseEnter={() => setHoveredStar(rating)}
				onMouseLeave={() => setHoveredStar(0)}
				onClick={() => handleStarClick(rating)}
			>
				<Star
					className={`h-10 w-10 transition-all duration-200 ${
						isFilled
							? 'fill-amber-400 text-amber-400'
							: isHalfFilled
								? 'fill-amber-200 text-amber-200'
								: 'fill-transparent text-slate-300 hover:text-amber-300'
					}`}
				/>
			</button>
		)
	}
	return (
		<div className='space-y-6 rounded-lg border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm'>
			{/* Header với điểm trung bình */}
			<div className='flex items-center justify-between border-b border-slate-100 pb-4'>
				<div>
					<h3 className='text-lg font-bold text-slate-900'>Đánh giá đề tài</h3>
					{!userRating && <p className='text-sm text-slate-500'>Chia sẻ đánh giá của bạn về đề tài này</p>}
				</div>
				<div className='text-right'>
					<div className='flex items-baseline gap-1'>
						<span className='text-4xl font-bold text-amber-500'>{initialRating.toFixed(1)}</span>
						<Star className='mb-1 h-5 w-5 fill-amber-400 text-amber-400' />
					</div>
					<p className='text-xs text-slate-500'>{totalReviews} đánh giá</p>
				</div>
			</div>

			{/* Phần vote của user */}
			{isLoadingMyRating ? (
				<Loader2 className='h-5 w-5 animate-spin' />
			) : (
				<div className='space-y-4'>
					<div className='text-center'>
						<p className='mb-3 text-sm font-medium text-slate-700'>
							{selectedRating > 0 ? `Bạn đã chọn ${selectedRating} sao` : 'Chọn số sao để đánh giá'}
						</p>
						<div className='flex justify-center gap-1'>
							{[0, 1, 2, 3, 4].map((index) => renderStar(index))}
						</div>
					</div>

					{/* Rating text */}
					{(hoveredStar > 0 || selectedRating > 0) && (
						<div className='text-center'>
							<p className='text-sm font-medium text-slate-600'>
								{hoveredStar > 0 ? getRatingText(hoveredStar) : getRatingText(selectedRating)}
							</p>
						</div>
					)}

					{/* Submit button */}
					{selectedRating > 0 && !userRating && (
						<div className='flex justify-center pt-2'>
							<Button
								onClick={handleSubmitRating}
								disabled={isSubmitting}
								className='bg-amber-500 hover:bg-amber-600'
							>
								{isSubmitting
									? 'Đang gửi...'
									: (userRating ?? 0 > 0)
										? 'Cập nhật đánh giá'
										: 'Gửi đánh giá'}
							</Button>
						</div>
					)}
				</div>
			)}

			{/* Thống kê phân bố rating (optional - có thể bật sau) */}
			<div className='space-y-2 border-t border-slate-100 pt-4'>
				<p className='text-xs font-semibold text-slate-600'>Phân bố đánh giá:</p>
				<>
					{Object.entries(distribution).map(([score, count]) => (
						<div key={score} className='flex items-center gap-2 text-xs'>
							<span className='w-8 text-slate-600'>{score} ⭐</span>
							<div className='h-2 flex-1 overflow-hidden rounded-full bg-slate-100'>
								<div
									className='h-full bg-amber-400 transition-all duration-300'
									style={{ width: `${totalReviews > 0 ? (count / totalReviews) * 100 : 0}%` }}
								/>
							</div>
							<span className='w-10 text-right text-slate-500'>
								{totalReviews > 0 ? ((count / totalReviews) * 100).toFixed(1) : '0.0'}%
							</span>
						</div>
					))}
				</>
			</div>
		</div>
	)
}

// Helper functions
const getRatingText = (rating: number): string => {
	switch (rating) {
		case 1:
			return '⭐ Rất không hài lòng'
		case 2:
			return '⭐⭐ Không hài lòng'
		case 3:
			return '⭐⭐⭐ Bình thường'
		case 4:
			return '⭐⭐⭐⭐ Hài lòng'
		case 5:
			return '⭐⭐⭐⭐⭐ Rất hài lòng'
		default:
			return ''
	}
}

export default EvaluationBar
