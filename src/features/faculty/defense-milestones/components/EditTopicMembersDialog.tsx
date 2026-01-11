import { useState } from 'react'
import type { TopicAssignment, CouncilMemberDto, CouncilMemberInfo } from '@/models/defenseCouncil.model'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { useUpdateTopicMembersMutation } from '@/services/defenseCouncilApi'
import { CouncilMemberRoleOptions, type CouncilMemberRole } from '@/models/milestone.model'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import LecturerSelector from './LecturerSelector'

interface EditTopicMembersDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	topic: TopicAssignment
	councilId: string
}

export default function EditTopicMembersDialog({ open, onOpenChange, topic, councilId }: EditTopicMembersDialogProps) {
	const [members, setMembers] = useState<CouncilMemberInfo[]>(topic.members || [])
	const [updateMembers, { isLoading }] = useUpdateTopicMembersMutation()

	const handleAddMember = (lecturer: any, role: CouncilMemberRole) => {
		// Check if already exists
		if (members.some((m) => m.memberId === lecturer._id)) {
			toast.error('Giảng viên này đã có trong bộ ba')
			return
		}

		// Check role conflict
		if (members.some((m) => m.role === role)) {
			toast.error(`Đã có ${CouncilMemberRoleOptions[role].label} trong bộ ba`)
			return
		}

		const newMember: CouncilMemberInfo = {
			memberId: lecturer._id,
			fullName: lecturer.fullName,
			title: lecturer.title || '',
			role: role
		}
		setMembers([...members, newMember])
	}

	const handleRemoveMember = (memberId: string) => {
		setMembers(members.filter((m) => m.memberId !== memberId))
	}

	const handleSave = async () => {
		// Validate: must have exactly 3 members (1 chairperson, 1 secretary, 1 member)
		if (members.length !== 3) {
			toast.error('Bộ ba phải có đúng 3 giảng viên')
			return
		}

		const hasChairperson = members.some((m) => m.role === 'chairperson')
		const hasSecretary = members.some((m) => m.role === 'secretary')
		const hasMember = members.some((m) => m.role === 'member')

		if (!hasChairperson || !hasSecretary || !hasMember) {
			toast.error('Bộ ba phải có 1 chủ tịch, 1 thư ký, 1 ủy viên')
			return
		}

		try {
			await updateMembers({
				councilId,
				topicId: topic.topicId,
				payload: { members }
			}).unwrap()
			toast.success('Cập nhật bộ ba thành công')
			onOpenChange(false)
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}

	const availableRoles = (['chairperson', 'secretary', 'member'] as CouncilMemberRole[]).filter(
		(role) => !members.some((m) => m.role === role)
	)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-w-3xl'>
				<DialogHeader>
					<DialogTitle>Chỉnh sửa bộ ba giảng viên</DialogTitle>
					<p className='text-sm text-muted-foreground'>{topic.titleVN}</p>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Current Members */}
					<div>
						<h3 className='mb-2 font-medium'>Thành viên hiện tại ({members.length}/3)</h3>
						{members.length > 0 ? (
							<div className='space-y-2'>
								{members.map((member) => (
									<div
										key={member.memberId}
										className='flex items-center justify-between rounded-lg border p-3'
									>
										<div className='flex items-center gap-3'>
											<Badge
												variant={
													CouncilMemberRoleOptions[
														member.role as keyof typeof CouncilMemberRoleOptions
													]?.variant || 'outline'
												}
											>
												{CouncilMemberRoleOptions[
													member.role as keyof typeof CouncilMemberRoleOptions
												]?.label || member.role}
											</Badge>
											<span>
												{member.title} {member.fullName}
											</span>
										</div>
										<Button
											variant='ghost'
											size='icon'
											onClick={() => handleRemoveMember(member.memberId)}
										>
											<X className='h-4 w-4' />
										</Button>
									</div>
								))}
							</div>
						) : (
							<p className='text-sm text-muted-foreground'>Chưa có thành viên nào</p>
						)}
					</div>

					{/* Add Member */}
					{availableRoles.length > 0 && (
						<div>
							<h3 className='mb-2 font-medium'>Thêm thành viên</h3>
							<LecturerSelector onSelect={handleAddMember} availableRoles={availableRoles} />
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isLoading}>
						Hủy
					</Button>
					<Button onClick={handleSave} disabled={isLoading}>
						{isLoading ? 'Đang lưu...' : 'Lưu'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
