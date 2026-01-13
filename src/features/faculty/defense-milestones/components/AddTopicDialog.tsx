import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useAddMultipleTopicsToCouncilMutation } from '@/services/defenseCouncilApi'
import { toast } from 'sonner'
import type { AddTopicToCouncilPayload, CouncilMemberInfo } from '@/models/defenseCouncil.model'
import type { CouncilMemberRole, GetTopicsInBatchMilestoneDto } from '@/models/milestone.model'
import TopicRow from './TopicRow'

interface AddTopicDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	councilId: string
	periodId: string
	chosenTopics: GetTopicsInBatchMilestoneDto[]
}

// Type for tracking members per topic
type TopicMembers = {
	[topicId: string]: CouncilMemberInfo[]
}

export default function AddTopicDialog({ open, onOpenChange, councilId, chosenTopics }: AddTopicDialogProps) {
	// Track members for each topic separately
	const [topicMembers, setTopicMembers] = useState<TopicMembers>({})

	const [addMultipleTopics, { isLoading: isAdding }] = useAddMultipleTopicsToCouncilMutation()

	const handleAddMember = (topicId: string, lecturer: any, role: CouncilMemberRole) => {
		const currentMembers = topicMembers[topicId] || []

		if (currentMembers.some((m) => m.memberId === lecturer._id)) {
			toast.error('Giảng viên này đã được chọn cho đề tài này')
			return
		}

		if (currentMembers.some((m) => m.role === role)) {
			toast.error(`Đã có người làm vai trò ${role === 'reviewer' ? 'phản biện' : 'này'}`)
			return
		}

		const newMember: CouncilMemberInfo = {
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

	const handleRemoveMember = (topicId: string, memberId: string) => {
		const currentMembers = topicMembers[topicId] || []
		setTopicMembers({
			...topicMembers,
			[topicId]: currentMembers.filter((m) => m.memberId !== memberId)
		})
	}

	const handleSubmit = async () => {
		// Validate all topics have complete members
		const incompleteTopics = chosenTopics.filter((topic) => {
			const members = topicMembers[topic._id] || []
			return members.length !== 4 // Need 4 members: 1 reviewer + 3 council members
		})

		if (incompleteTopics.length > 0) {
			toast.error(`${incompleteTopics.length} đề tài chưa đủ thành viên (cần 1 phản biện + 3 hội đồng)`)
			return
		}

		// Validate each topic has correct roles
		for (const topic of chosenTopics) {
			const members = topicMembers[topic._id]
			const hasReviewer = members.some((m) => m.role === 'reviewer')
			const hasChairperson = members.some((m) => m.role === 'chairperson')
			const hasSecretary = members.some((m) => m.role === 'secretary')
			const hasMember = members.some((m) => m.role === 'member')

			if (!hasReviewer || !hasChairperson || !hasSecretary || !hasMember) {
				toast.error(`Đề tài "${topic.titleVN}" chưa đủ vai trò (1 phản biện, 1 chủ tịch, 1 thư ký, 1 ủy viên)`)
				return
			}
		}

		try {
			// Prepare batch payload
			const topics: AddTopicToCouncilPayload[] = chosenTopics.map((topic, index) => ({
				topicId: topic._id,
				titleVN: topic.titleVN,
				titleEng: topic.titleEng || '',
				studentNames: topic.students?.map((s: any) => s.fullName) || [],
				defenseOrder: index + 1,
				members: topicMembers[topic._id]
			}))

			await addMultipleTopics({ councilId, payload: { topics } }).unwrap()

			toast.success(`Đã thêm ${chosenTopics.length} đề tài vào hội đồng thành công`)
			onOpenChange(false)
			// Reset
			setTopicMembers({})
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[200vh] min-w-[180vh] max-w-4xl overflow-y-auto border border-blue-500'>
				<DialogHeader>
					<DialogTitle>Thêm đề tài vào hội đồng</DialogTitle>
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
									<th className='px-4 py-3 text-left text-sm font-semibold'>Chuyên ngành</th>
									<th className='px-4 py-3 text-left text-sm font-semibold'>Sinh viên</th>
									<th className='px-4 py-3 text-left text-sm font-semibold'>GVHD</th>
									<th className='px-4 py-3 text-left text-sm font-semibold'>Phản biện</th>
									<th className='px-4 py-3 text-left text-sm font-semibold'>Hội đồng chấm</th>
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
												onRemoveMember={(memberId) => handleRemoveMember(topic._id, memberId)}
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

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isAdding}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} disabled={isAdding || chosenTopics.length === 0}>
						{isAdding ? `Đang thêm...` : `Thêm ${chosenTopics.length} đề tài`}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
