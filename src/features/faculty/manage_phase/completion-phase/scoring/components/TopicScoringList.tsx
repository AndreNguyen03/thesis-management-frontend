'use client'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Clock } from 'lucide-react'
import type { TopicsInDefenseMilestone } from '@/models'

interface TopicScoringListProps {
	topics: TopicsInDefenseMilestone[]
	selectedTopic: string | null
	onSelectTopic: (topicId: string) => void
	isScoringSubmitted: (topicId: string) => boolean
	isLoading: boolean
}

export function TopicScoringList({
	topics,
	selectedTopic,
	onSelectTopic,
	isScoringSubmitted,
	isLoading
}: TopicScoringListProps) {
    console.log("tdopics", topics);
	return (
		<div className='flex w-1/3 flex-col gap-4'>
			<div>
				<h2 className='text-lg font-semibold'>Danh sách đề tài</h2>
				<p className='text-sm text-muted-foreground'>Chọn đề tài để nhập điểm chấm</p>
			</div>

			<div className='flex flex-1 flex-col gap-2 overflow-y-auto'>
				{isLoading ? (
					<div className='flex items-center justify-center py-8'>
						<p className='text-sm text-muted-foreground'>Đang tải...</p>
					</div>
				) : topics.length === 0 ? (
					<div className='flex items-center justify-center py-8'>
						<p className='text-sm text-muted-foreground'>Không có đề tài nào</p>
					</div>
				) : (
					topics.map((topic) => (
						<Button
							key={topic._id}
							variant={selectedTopic === topic._id ? 'default' : 'outline'}
							className='h-auto w-full justify-start p-4'
							onClick={() => onSelectTopic(topic._id)}
						>
							<div className='flex w-full items-start justify-between gap-2 text-left'>
								<div className='flex-1'>
									<p className='font-medium'>{topic.titleVN}</p>
									<p className='text-xs text-muted-foreground'>{topic.titleEng}</p>
									<div className='mt-2 flex flex-wrap gap-1'>
										{topic.students?.map((student, idx) => (
											<Badge key={idx} variant='secondary' className='text-xs'>
												{student.fullName}
											</Badge>
										))}
									</div>
								</div>
								<div>
									{isScoringSubmitted(topic._id) ? (
										<CheckCircle className='h-5 w-5 text-green-500' />
									) : (
										<Clock className='h-5 w-5 text-yellow-500' />
									)}
								</div>
							</div>
						</Button>
					))
				)}
			</div>
		</div>
	)
}
