import type { StudentRegistration, TopicApproval } from '@/models'
import { ApprovedStudentList } from '../students/ApprovedStudentList'
import { PendingStudentList } from '../students/PendingStudentList'
import { RejectedStudentList } from '../students/RejectedStudentList'
import { Card, CardContent } from '@/components/ui/card'
import { Users } from 'lucide-react'

export function TopicExpanded({
	topic,
	isReadOnly,
	onReject,
    onApprove
}: {
	topic: TopicApproval
	isReadOnly: boolean
	onReject: (student: StudentRegistration) => void
    onApprove: (registrationId: string) => void
}) {
	const hasPending = topic.pendingStudents?.length > 0
	const hasApproved = topic.approvedStudents?.length > 0
	const hasRejected = topic.rejectedStudents?.length > 0

	const hasAnyActions = hasPending || hasApproved || hasRejected

	return (
		<Card className='mt-0 border-t-0 p-0'>
			<CardContent className='p-4'>
				{hasAnyActions ? (
					<div className='grid gap-6 pl-4'>
						<PendingStudentList topic={topic} isReadOnly={isReadOnly} onReject={onReject} onApprove={onApprove}/>
						<ApprovedStudentList students={topic.approvedStudents} />
						<RejectedStudentList students={topic.rejectedStudents} />
					</div>
				) : (
					<div className='flex flex-col items-center justify-center p-8 text-center text-gray-500'>
						<Users className='mx-auto mb-4 h-12 w-12 text-gray-400' />
						<h3 className='mb-2 text-lg font-semibold text-gray-900'>Chưa có hoạt động nào</h3>
						<p className='text-sm'>Đề tài này chưa có sinh viên đăng ký, phê duyệt hoặc từ chối.</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
