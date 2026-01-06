import type { StudentRegistration, TopicApproval } from '@/models'
import { PendingStudentCard } from './PendingStudentCard'
import { Clock } from 'lucide-react'

export function PendingStudentList({
	topic,
	isReadOnly,
	onReject,
	onApprove
}: {
	topic: TopicApproval
	isReadOnly: boolean
	onReject: (student: StudentRegistration) => void
	onApprove: (v: string) => void
}) {
	const pending = topic.pendingStudents
	if (!pending.length) return null

	return (
		<div className='space-y-3'>
			<div className='flex items-center gap-2'>
				<Clock
                 className='h-4 w-4 text-amber-500' />
				<span className='text-sm font-semibold uppercase'>Chờ duyệt</span>
			</div>
			<div className='grid gap-3'>
				{pending.map((s) => (
					<PendingStudentCard
						key={s.studentId}
						student={s}
						topic={topic}
						isReadOnly={isReadOnly}
						onReject={onReject}
						onApprove={onApprove}
					/>
				))}
			</div>
		</div>
	)
}
