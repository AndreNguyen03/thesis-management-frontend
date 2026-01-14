import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useAddMultipleTopicsToCouncilMutation } from '@/services/defenseCouncilApi'
import { toast } from 'sonner'
import type { AddTopicToCouncilPayload, CouncilMemberDto, CouncilMemberRole } from '@/models/defenseCouncil.model'


import TopicRow from './TopicRow'
import { ConfirmDialog } from '../../manage_phase/completion-phase/manage-defense-milestone/ConfirmDialog'
import { useParams } from 'react-router-dom'
import type { ResponseMiniLecturerDto, ResponseMiniStudentDto } from '@/models'
import type { GetTopicsInBatchMilestoneDto } from '@/models/milestone.model'

interface AddTopicDialogProps {
	mode?: 'add' | 'edit'
	initialTopicMembers?: TopicMembers
	open: boolean
	onOpenChange: (open: boolean) => void
	councilId?: string
	periodId: string
	chosenTopics: GetTopicsInBatchMilestoneDto[]
	onRemoveTopic: (topicId: string) => void
	onReset: () => void
	totalInCouncilNum: number
}

// Type for tracking members per topic
type TopicMembers = {
	[topicId: string]: CouncilMemberDto[]
}
type ActionType = 'add' | 'delete' | 'remove-eliminated' | 'cancel'

export default function AddTopicDialog({
	open,
	onOpenChange,
	chosenTopics,
	onRemoveTopic,
	councilId,
	onReset,
	totalInCouncilNum,
	mode = 'add',
	initialTopicMembers
}: AddTopicDialogProps) {
	// Track members for each topic separately
	const [topicMembers, setTopicMembers] = useState<TopicMembers>(initialTopicMembers || {})
	const {
		councilId: councilIdParam,
		periodId,
		templateId
	} = useParams<{ councilId: string; periodId: string; templateId: string }>()

	const [addMultipleTopics, { isLoading: isAdding }] = useAddMultipleTopicsToCouncilMutation()
	const [confirmDialog, setConfirmDialog] = useState<{
		open: boolean
		type: ActionType | null
		topicId?: string
		isLoading?: boolean
	}>({
		open: false,
		type: null,
		topicId: undefined
	})
	const handleAddMember = (topicId: string, lecturer: any, role: CouncilMemberRole) => {
		const currentMembers = topicMembers[topicId] || []

		// Kiểm tra nếu đã là phản biện thì không thể là chủ tịch hoặc thư ký
		const isReviewer = currentMembers.some((m) => m.memberId === lecturer._id && m.role === 'reviewer')
		if (isReviewer && (role === 'chairperson' || role === 'secretary')) {
			toast.error('Giảng viên phản biện không thể là chủ tịch hoặc thư ký')
			return
		}

		// Kiểm tra nếu đã là chủ tịch hoặc thư ký hoặc là ủy viên thì không thể là phản biện
		const isChairpersonOrSecretaryOrMember = currentMembers.some(
			(m) =>
				m.memberId === lecturer._id &&
				(m.role === 'chairperson' || m.role === 'secretary' || m.role === 'member')
		)

		if (isChairpersonOrSecretaryOrMember && (role === 'chairperson' || role == 'secretary' || role === 'member')) {
			toast.error('Chủ tịch, thư ký hoặc ủy viên không thể là chủ tịch, thư ký hoặc ủy viên')
			return
		}
		// Kiểm tra nếu đã là chủ tịch hoặc thư ký thì không thể là phản biện
		const isChairpersonOrSecretary = currentMembers.some(
			(m) => m.memberId === lecturer._id && (m.role === 'chairperson' || m.role === 'secretary')
		)
		if (isChairpersonOrSecretary && role === 'reviewer') {
			toast.error('Chủ tịch hoặc thư ký không thể là phản biện')
			return
		}

		// Kiểm tra nếu giảng viên này đã có vai trò này rồi
		if (currentMembers.some((m) => m.memberId === lecturer._id && m.role === role)) {
			toast.error('Giảng viên này đã được chọn cho vai trò này')
			return
		}

		// Kiểm tra nếu vai trò này đã có người khác đảm nhiệm
		if (currentMembers.some((m) => m.role === role && m.memberId !== lecturer._id)) {
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

		setTopicMembers({
			...topicMembers,
			[topicId]: [...currentMembers, newMember]
		})
	}

	const handleRemoveMember = (topicId: string, memberId: string, role: CouncilMemberRole) => {
		const currentMembers = topicMembers[topicId] || []
		// Chỉ xóa member có cả memberId VÀ role khớp (không xóa các role khác của cùng memberId)
		setTopicMembers({
			...topicMembers,
			[topicId]: currentMembers.filter((m) => !(m.memberId === memberId && m.role === role))
		})
	}

	const handleSubmit = async () => {
		// Validate all topics have complete roles (reviewer có thể kiêm member)
		const incompleteTopics = chosenTopics.filter((topic) => {
			const members = topicMembers[topic._id] || []
			const hasReviewer = members.some((m) => m.role === 'reviewer')
			const hasChairperson = members.some((m) => m.role === 'chairperson')
			const hasSecretary = members.some((m) => m.role === 'secretary')
			const hasMember = members.some((m) => m.role === 'member')

			return !hasReviewer || !hasChairperson || !hasSecretary || !hasMember
		})

		if (incompleteTopics.length > 0) {
			toast.error(
				`${incompleteTopics.length} đề tài chưa đủ vai trò (cần 1 phản biện, 1 chủ tịch, 1 thư ký, 1 ủy viên)`
			)
			return
		}

		try {
			// Prepare batch payload
			const topics: AddTopicToCouncilPayload[] = chosenTopics.map((topic, index) => ({
				topicId: topic._id,
				titleVN: topic.titleVN,
				titleEng: topic.titleEng || '',
				studentNames: topic.students?.map((s: ResponseMiniStudentDto) => s.fullName) || [],
				lecturerNames: topic.lecturers?.map((l: ResponseMiniLecturerDto) => `${l.title} ${l.fullName}`) || [],
				defenseOrder: totalInCouncilNum + index + 1,
				members: [
					...topicMembers[topic._id],
					...topic.lecturers.map((l) => ({
						memberId: l._id,
						fullName: l.fullName,
						title: l.title,
						role: 'supervisor' as CouncilMemberRole
					}))
				]
			}))

			await addMultipleTopics({
				councilId: councilIdParam!,
				payload: { topics, periodId: periodId! },
				milestonesTemplateId: templateId
			}).unwrap()

			toast.success(`Đã thêm ${chosenTopics.length} đề tài vào hội đồng thành công`)
			onOpenChange(false)
			// Reset
			setTopicMembers({})
			onReset()
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}
	const handleConfirmAction = async () => {
		if (!councilId) return
		if (confirmDialog.type === 'add') {
			handleSubmit()
			onReset()
			// Thêm nhiều đề tài}
		} else if (confirmDialog.type === 'delete') {
		} else if (confirmDialog.type === 'remove-eliminated') {
			onRemoveTopic(confirmDialog.topicId!)
			if (chosenTopics.length === 1) {
				onOpenChange(false)
			}
		} else if (confirmDialog.type === 'cancel') {
			onReset()
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[220vh] min-w-[200vh] max-w-4xl overflow-y-auto border border-blue-500'>
				<DialogHeader>
					<DialogTitle>{mode === 'edit' ? 'Chỉnh sửa hội đồng' : 'Thêm đề tài vào hội đồng'}</DialogTitle>
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
									<th className='px-4 py-3 text-left text-sm font-semibold'>Hành động</th>
								</tr>
							</thead>
							<tbody>
								{chosenTopics && chosenTopics.length > 0 ? (
									chosenTopics.map((topic) => {
										const members = topicMembers[topic._id] || []
										const reviewer = members.find((m) => m.role === 'reviewer') || null
										const councilMembers = members.filter((m) => m.role !== 'reviewer')

										return (
											<TopicRow
												key={topic._id}
												topic={topic}
												reviewer={reviewer}
												councilMembers={councilMembers}
												onAddMember={(lecturer, role) =>
													handleAddMember(topic._id, lecturer, role)
												}
												onRemoveMember={(memberId, role) =>
													handleRemoveMember(topic._id, memberId, role)
												}
												onRemoveTopic={() =>
													setConfirmDialog({
														open: true,
														type: 'remove-eliminated',
														topicId: topic._id
													})
												}
												supervisors={
													topic.lecturers.map((l) => ({
														memberId: l._id,
														fullName: l.fullName,
														title: l.title,
														role: 'supervisor'
													})) as CouncilMemberDto[]
												}
											/>
										)
									})
								) : (
									<tr>
										<td colSpan={6} className='px-4 py-8 text-center text-gray-500'>
											Chưa chọn đề tài nào
										</td>
									</tr>
								)}
							</tbody>
						</table>
					</div>
				</div>
				<ConfirmDialog
					open={confirmDialog.open}
					onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
					title={
						confirmDialog.type === 'remove-eliminated'
							? 'Xác nhận hủy bỏ đề tài'
							: confirmDialog.type === 'add'
								? `Xác nhận thêm ${chosenTopics.length} đề tài vào hội đồng`
								: confirmDialog.type === 'cancel'
									? `Xác nhận hủy phiên thêm ${chosenTopics.length} đề tài`
									: ''
					}
					description={
						confirmDialog.type === 'remove-eliminated'
							? 'Xác nhận loại bỏ đề tài dự kiến'
							: confirmDialog.type === 'add'
								? 'Bạn có chắc chắn muốn thêm các đề tài đã chọn vào hội đồng không?'
								: confirmDialog.type === 'cancel'
									? `Bạn có chắc chắn muốn hủy phiên thêm ${chosenTopics.length} đề tài không?`
									: ''
					}
					onConfirm={handleConfirmAction}
					isLoading={false}
					confirmText={
						confirmDialog.type === 'remove-eliminated'
							? 'Xóa'
							: confirmDialog.type === 'add'
								? `Thêm ${chosenTopics.length} đề tài`
								: confirmDialog.type === 'cancel'
									? 'Xác nhận hủy'
									: ''
					}
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
						disabled={isAdding}
					>
						Hủy
					</Button>
					<Button
						onClick={() => {
							setConfirmDialog({
								open: true,
								type: 'add',
								isLoading: isAdding
							})
						}}
					>
						{mode === 'edit' ? 'Cập nhật' : `Thêm ${chosenTopics.length} đề tài`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
