import { useState } from 'react'
import type { CouncilMemberDto, TopicAssignment } from '@/models/defenseCouncil.model'
import { Button } from '@/components/ui/Button'
import { useUpdateTopicMembersMutation } from '@/services/defenseCouncilApi'
import { type CouncilMemberRoleType } from '@/models/milestone.model'
import { toast } from 'sonner'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { ConfirmDialog } from '../../manage_phase/completion-phase/manage-defense-milestone/ConfirmDialog'
import EditTopicRow from './EditTopicRow'

interface EditTopicMembersDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	topic: TopicAssignment
	councilId: string
}

type ActionType = 'save' | 'cancel'

export default function EditTopicMembersDialog({ open, onOpenChange, topic, councilId }: EditTopicMembersDialogProps) {
	const [members, setMembers] = useState<CouncilMemberDto[]>(topic.members || [])
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean
		type: ActionType | null
	}>({
		open: false,
		type: null
	})
	const [updateMembers, { isLoading }] = useUpdateTopicMembersMutation()

	const handleAddMember = (lecturer: any, role: CouncilMemberRoleType) => {
		// Kiểm tra nếu đã là phản biện thì không thể là chủ tịch hoặc thư ký
		const isReviewer = members.some((m) => m.memberId === lecturer._id && m.role === 'reviewer')
		if (isReviewer && (role === 'chairperson' || role === 'secretary')) {
			toast.error('Giảng viên phản biện không thể là chủ tịch hoặc thư ký')
			return
		}

		// Kiểm tra nếu đã là chủ tịch hoặc thư ký hoặc là ủy viên thì không thể là các vai trò đó
		const isChairpersonOrSecretaryOrMember = members.some(
			(m) =>
				m.memberId === lecturer._id &&
				(m.role === 'chairperson' || m.role === 'secretary' || m.role === 'member')
		)

		if (isChairpersonOrSecretaryOrMember && (role === 'chairperson' || role === 'secretary' || role === 'member')) {
			toast.error('Chủ tịch, thư ký hoặc ủy viên không thể là chủ tịch, thư ký hoặc ủy viên')
			return
		}

		// Kiểm tra nếu đã là chủ tịch hoặc thư ký thì không thể là phản biện
		const isChairpersonOrSecretary = members.some(
			(m) => m.memberId === lecturer._id && (m.role === 'chairperson' || m.role === 'secretary')
		)
		if (isChairpersonOrSecretary && role === 'reviewer') {
			toast.error('Chủ tịch hoặc thư ký không thể là phản biện')
			return
		}

		// Kiểm tra nếu giảng viên này đã có vai trò này rồi
		if (members.some((m) => m.memberId === lecturer._id && m.role === role)) {
			toast.error('Giảng viên này đã được chọn cho vai trò này')
			return
		}

		// Kiểm tra nếu vai trò này đã có người khác đảm nhiệm
		if (members.some((m) => m.role === role && m.memberId !== lecturer._id)) {
			const roleNames: Record<string, string> = {
				reviewer: 'phản biện',
				chairperson: 'chủ tịch',
				secretary: 'thư ký',
				member: 'ủy viên'
			}
			toast.error(`Đã có người làm vai trò ${roleNames[role] || 'này'}`)
			return
		}

		const newMember: CouncilMemberDto = {
			memberId: lecturer._id,
			fullName: lecturer.fullName,
			title: lecturer.title || '',
			role
		}

		setMembers([...members, newMember])
	}

	const handleRemoveMember = (memberId: string, role: CouncilMemberRoleType) => {
		// Chỉ xóa member có cả memberId VÀ role khớp (không xóa các role khác của cùng memberId)
		setMembers(members.filter((m) => !(m.memberId === memberId && m.role === role)))
	}

	const handleSave = async () => {
		// Validate all roles (reviewer có thể kiêm member)
		const hasReviewer = members.some((m) => m.role === 'reviewer')
		const hasChairperson = members.some((m) => m.role === 'chairperson')
		const hasSecretary = members.some((m) => m.role === 'secretary')
		const hasMember = members.some((m) => m.role === 'member')

		if (!hasReviewer || !hasChairperson || !hasSecretary || !hasMember) {
			toast.error('Cần đủ 4 vai trò: 1 phản biện, 1 chủ tịch, 1 thư ký, 1 ủy viên')
			return
		}

		try {
			await updateMembers({
				councilId,
				topicId: topic.topicId,
				payload: { members: members }
			}).unwrap()
			toast.success('Cập nhật hội đồng chấm thành công')
			onOpenChange(false)
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}

	const handleConfirmAction = async () => {
		if (confirmDialog.type === 'save') {
			await handleSave()
		} else if (confirmDialog.type === 'cancel') {
			setMembers(topic.members || [])
			onOpenChange(false)
		}
	}

	const reviewer = members.find((m) => m.role === 'reviewer') || null
	const councilMembers = members.filter((m) => m.role !== 'reviewer')

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[220vh] min-w-[200vh] max-w-4xl overflow-y-auto border border-blue-500'>
				<DialogHeader>
					<DialogTitle>Chỉnh sửa hội đồng chấm đề tài</DialogTitle>
				</DialogHeader>

				<div className='px-2'>
					<div className='overflow-x-auto rounded-lg border border-blue-500'>
						<table className='min-w-full table-auto bg-white'>
							<thead>
								<tr className='bg-gray-50 text-gray-700'>
									<th
										className='px-4 py-3 text-left text-sm font-semibold'
										style={{ minWidth: '180px', maxWidth: '220px', width: '200px' }}
									>
										Đề tài
									</th>
									<th className='px-4 py-3 text-left text-sm font-semibold'>Sinh viên</th>
									<th className='px-4 py-3 text-left text-sm font-semibold'>GVHD</th>
									<th className='px-4 py-3 text-left text-sm font-semibold'>Phản biện</th>
									<th className='px-4 py-3 text-left text-sm font-semibold'>Hội đồng chấm</th>
								</tr>
							</thead>
							<tbody>
								<EditTopicRow
									topic={topic}
									reviewer={reviewer}
									councilMembers={councilMembers}
									onAddMember={(lecturer, role) => handleAddMember(lecturer, role)}
									onRemoveMember={(memberId, role) => handleRemoveMember(memberId, role)}
								/>
							</tbody>
						</table>
					</div>
				</div>

				<ConfirmDialog
					open={confirmDialog.open}
					onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
					title={
						confirmDialog.type === 'save'
							? 'Xác nhận cập nhật hội đồng'
							: confirmDialog.type === 'cancel'
								? 'Xác nhận hủy thay đổi'
								: ''
					}
					description={
						confirmDialog.type === 'save'
							? 'Bạn có chắc chắn muốn cập nhật hội đồng chấm cho đề tài này không?'
							: confirmDialog.type === 'cancel'
								? 'Các thay đổi sẽ không được lưu. Bạn có chắc chắn muốn hủy không?'
								: ''
					}
					onConfirm={handleConfirmAction}
					isLoading={isLoading}
					confirmText={confirmDialog.type === 'save' ? 'Cập nhật' : 'Xác nhận hủy'}
				/>

				<DialogFooter>
					<Button
						variant='outline'
						onClick={() => {
							setConfirmDialog({
								open: true,
								type: 'cancel'
							})
						}}
						disabled={isLoading}
					>
						Hủy
					</Button>
					<Button
						onClick={() => {
							setConfirmDialog({
								open: true,
								type: 'save'
							})
						}}
						disabled={isLoading}
					>
						{isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
