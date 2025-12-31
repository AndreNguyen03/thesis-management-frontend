import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogFooter,
	DialogDescription
} from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { QueryReplyRegistration, StudentRegistration } from '@/models'
import { AlertTriangle } from 'lucide-react'
import { useState } from 'react'
import { useReplyRegistrationMutation } from '@/services/registrationApi'
import { RegistrationStatus } from '@/features/student/TopicList/utils/registration'
import { toast } from '@/hooks/use-toast'

interface Props {
	open: boolean
	student: StudentRegistration
	onRejectModalOpen: (val: boolean) => void
}

export function RejectStudentDialog({ open, student, onRejectModalOpen }: Props) {
	const [rejectReason, setRejectReason] = useState<string>('')
	const [rejectReasonType, setRejectReasonType] = useState('')

	const [replyRegistration] = useReplyRegistrationMutation()

	const confirmReject = async () => {
		const replyPayload: QueryReplyRegistration = {
			status: RegistrationStatus.REJECTED,
			lecturerResponse: rejectReason ? rejectReason : 'Rất tiếc, yêu cầu của bạn đã bị từ chối.',
			rejectionReasonType: rejectReasonType
		}
		await replyRegistration({ registrationId: student._id, body: replyPayload })
		onRejectModalOpen(false)
		toast({
			variant: 'default',
			title: `Từ chối sinh viên ${student.studentName} thành công!`
		})
	}

	return (
		<Dialog open={open} onOpenChange={onRejectModalOpen}>
			<DialogContent className='max-h-lg h-fit w-fit'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-red-600'>
						<AlertTriangle className='h-5 w-5' />
						Xác nhận từ chối
					</DialogTitle>
					<DialogDescription>
						Bạn đang từ chối yêu cầu của{' '}
						<span className='font-bold text-gray-900'>{student.studentName}</span>
						.
						<br />
						Lý do này sẽ được gửi thông báo đến sinh viên để đảm bảo minh bạch.
					</DialogDescription>
				</DialogHeader>

				<div className='space-y-4 py-2'>
					<div className='space-y-2'>
						<label className='text-sm font-medium'>
							Lý do chính <span className='text-red-500'>*</span>
						</label>
						<Select onValueChange={setRejectReasonType}>
							<SelectTrigger>
								<SelectValue placeholder='-- Chọn lý do --' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='full_slot'>Đã đủ số lượng thành viên</SelectItem>
								<SelectItem value='skill_mismatch'>Kỹ năng chưa phù hợp</SelectItem>
								<SelectItem value='gpa_low'>Điểm trung bình chưa đạt yêu cầu</SelectItem>
								<SelectItem value='other'>Lý do khác</SelectItem>
							</SelectContent>
						</Select>
					</div>

					<div className='space-y-2'>
						<label className='text-sm font-medium'>Ghi chú thêm</label>
						<Textarea
							placeholder='VD: Cần bổ sung kiến thức về...'
							value={rejectReason}
							onChange={(e) => setRejectReason(e.target.value)}
							className='h-20'
						/>
					</div>
				</div>

				<DialogFooter>
					<Button variant='ghost' onClick={() => onRejectModalOpen(false)}>
						Hủy bỏ
					</Button>
					<Button variant='destructive' onClick={confirmReject} disabled={!rejectReasonType}>
						Gửi thông báo từ chối
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
