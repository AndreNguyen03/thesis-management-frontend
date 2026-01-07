import React from 'react'
import EvaluationBar from './component/EvaluationBar'
import { useCreateOrUpdateRatingMutation, useGetMyRatingQuery } from '@/services/ratingApi'

interface EvaluationProps {
	topicId?: string
	averageRating?: number
	reviewCount?: number
	distribution: Record<number, number>
}

const Evaluation: React.FC<EvaluationProps> = ({ topicId, averageRating, reviewCount = 12, distribution }) => {
	//endpoint tạo đánh giá
	const [createOrUpdateRating] = useCreateOrUpdateRatingMutation()
	const { data: userRatingData, isLoading: isLoadingMyRating } = useGetMyRatingQuery(topicId!)
	const handleRatingSubmit = async (rating: number) => {
		await createOrUpdateRating({ data: { topicId: topicId!, rating } })
	}
	return (
		<div className='space-y-6'>
			<EvaluationBar
				topicId={topicId}
				initialRating={averageRating}
				totalReviews={reviewCount}
				userRating={userRatingData?.rating}
				onRatingSubmit={handleRatingSubmit}
				distribution={distribution}
				isLoadingMyRating={isLoadingMyRating}
			/>

			{/* Danh sách các đánh giá chi tiết sẽ hiển thị ở đây */}
			<div className='rounded-lg border border-slate-200 bg-white p-6'>
				<h4 className='mb-4 font-semibold text-slate-900'>Các đánh giá gần đây</h4>
				<div className='py-10 text-center text-slate-500'>Chưa có đánh giá chi tiết nào cho đề tài này.</div>
			</div>
		</div>
	)
}

export default Evaluation
