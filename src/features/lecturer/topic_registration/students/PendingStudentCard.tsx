import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, XCircle, Lock } from 'lucide-react'
import type { StudentRegistration, TopicApproval } from '@/models'
import { formatDate } from '@/utils/utils'

interface Props {
	student: StudentRegistration
	topic: TopicApproval
	isReadOnly: boolean
	onReject: (student: StudentRegistration) => void
	onApprove: (registrationId: string) => void
}

export function PendingStudentCard({ student, topic, isReadOnly, onReject, onApprove }: Props) {
	const skills = student.studentSkills ?? []

	return (
		<Card className='border-amber-200 bg-amber-50 p-0'>
			<CardContent className='flex flex-col justify-between gap-4 p-4 md:flex-row'>
				<div className='flex flex-1 gap-4'>
					<div className='space-y-2'>
						<div className='font-bold'>{student.studentName || 'Không rõ sinh viên'}</div>

						{student.studentNote && (
							<p className='text-xs italic text-muted-foreground'>"{student.studentNote}"</p>
						)}

						{skills.length > 0 && (
							<div className='flex flex-wrap gap-1'>
								{skills.map((skill, idx) => (
									<Badge
										key={`${skill}-${idx}`}
										variant='outline'
										className='border-amber-300 text-[10px] text-amber-700'
									>
										{skill}
									</Badge>
								))}
							</div>
						)}

						{student.createdAt && (
							<p className='text-[11px] text-muted-foreground'>
								Đăng ký lúc {formatDate(student.createdAt)}
							</p>
						)}
					</div>
				</div>

				{!isReadOnly && (
					<div className='flex gap-2 self-end'>
						<Button
							size='sm'
							className='bg-emerald-600 text-white hover:bg-emerald-700'
							disabled={(topic.approvedStudents?.length ?? 0) >= (topic.maxStudents ?? Infinity)}
							onClick={() => onApprove(student._id)}
						>
							<CheckCircle2 className='mr-1 h-4 w-4' />
							Duyệt
						</Button>

						<Button
							size='sm'
							variant='outline'
							className='text-destructive'
							onClick={() => onReject(student)}
						>
							<XCircle className='mr-1 h-4 w-4' />
							Từ chối
						</Button>
					</div>
				)}

				{isReadOnly && (
					<div className='flex items-center gap-1 text-xs text-muted-foreground'>
						<Lock className='h-3 w-3' /> Chỉ xem
					</div>
				)}
			</CardContent>
		</Card>
	)
}
