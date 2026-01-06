import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/card'
import { ChevronDown, ChevronUp, Users } from 'lucide-react'
import { TopicExpanded } from './TopicExpanded'
import { ModeBadge, StatusBadge } from '../utils/Badges'
import type { StudentRegistration, TopicApproval } from '@/models'
import { Badge } from '@/components/ui'

interface Props {
	topic: TopicApproval
	expandedTopicId: string | null
	onToggleExpand: (id: string | null) => void
	isReadOnly: boolean
	onReject: (student: StudentRegistration) => void
	onApprove: (v: string) => void
}

export function TopicCard({ topic, expandedTopicId, onToggleExpand, isReadOnly, onReject, onApprove }: Props) {
	const expanded = expandedTopicId === topic._id

	const topicStatus = isReadOnly
		? 'locked'
		: topic.approvedStudents.length === topic.maxStudents
			? 'full'
			: 'receiving'

	const pendingCount = topic.pendingStudents?.length || 0
	return (
		<>
			<Card className='p-0'>
				<CardContent className='flex justify-between p-4'>
					<div>
						<div className='flex gap-4'>
							<h3 className='font-semibold'>{topic.titleVN}</h3>
							{pendingCount > 0 && (
								<Badge variant='destructive' className='text-xs'>
									Có {pendingCount} SV đăng ký
								</Badge>
							)}
						</div>
						<div className='mt-1 flex gap-3'>
							<StatusBadge status={topicStatus} />
							<ModeBadge allowApprovalManual={topic.allowManualApproval} />

							<span className='flex items-center gap-1 text-sm'>
								<Users className='h-4 w-4' />
								{topic.approvedStudents.length}/{topic.maxStudents}
							</span>
						</div>
					</div>

					<Button onClick={() => onToggleExpand(expanded ? null : topic._id)}>
						{expanded ? 'Ẩn' : 'Xem'} {expanded ? <ChevronUp /> : <ChevronDown />}
					</Button>
				</CardContent>
			</Card>

			{expanded && (
				<TopicExpanded topic={topic} isReadOnly={isReadOnly} onReject={onReject} onApprove={onApprove} />
			)}
		</>
	)
}
