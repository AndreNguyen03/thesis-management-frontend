import type { Phase3Response } from '@/models/period-phase.models'
import { Button } from '@/components/ui/Button'
import { ActionCard } from './ActionCard'

export function Phase3Handler({ data, onCompletePhase }: { data: Phase3Response; onCompletePhase: () => void }) {
	console.log('Phase3Handler data:', data)
	return (
		<div className='space-y-4'>
			{/* 1. Đề tài chưa nộp */}
			{data.overdueTopics.length > 0 && (
				<ActionCard type='overdue' count={data.overdueTopics.length} items={data.overdueTopics} />
			)}

			{/* 2. Đề tài tạm dừng/delay */}
			{data.pausedOrDelayedTopics.length > 0 && (
				<ActionCard
					type='paused-delayed'
					count={data.pausedOrDelayedTopics.length}
					items={data.pausedOrDelayedTopics}
				/>
			)}

			{/* 3. Chờ GV đánh giá */}
			{data.pendingLecturerReview.length > 0 && (
				<ActionCard
					type='pending-review'
					count={data.pendingLecturerReview.length}
					items={data.pendingLecturerReview}
				/>
			)}

			{/* Nút chuyển pha - luôn hiển thị */}
			<Button className='ml-4' onClick={onCompletePhase}>
				Chuyển sang Pha Hoàn thành
			</Button>
		</div>
	)
}
