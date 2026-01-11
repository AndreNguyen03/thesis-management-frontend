import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { useGetTopicsAwaitingEvaluationInPeriodQuery } from '@/services/topicApi'
import { useAddTopicToCouncilMutation } from '@/services/defenseCouncilApi'
import { Input } from '@/components/ui'
import { Search, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { AddTopicToCouncilPayload, CouncilMemberDto, CouncilMemberInfo } from '@/models/defenseCouncil.model'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import LecturerSelector from './LecturerSelector'
import type { CouncilMemberRole } from '@/models/milestone.model'

interface AddTopicDialogProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	councilId: string
	milestoneTemplateId: string
	periodId: string
}

export default function AddTopicDialog({
	open,
	onOpenChange,
	councilId,
	milestoneTemplateId,
	periodId
}: AddTopicDialogProps) {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedTopic, setSelectedTopic] = useState<any>(null)
	const [members, setMembers] = useState<CouncilMemberInfo[]>([])

	const [queryParams] = useState<PaginationQueryParamsDto>({
		limit: 20,
		page: 1,
		query: searchTerm,
		search_by: ['titleVN', 'titleEng']
	})

	// Query topics awaiting evaluation in the period
	const { data: topicsData, isLoading: isLoadingTopics } = useGetTopicsAwaitingEvaluationInPeriodQuery({
		periodId: periodId,
		queryParams: { ...queryParams, query: searchTerm }
	})

	const [addTopic, { isLoading: isAdding }] = useAddTopicToCouncilMutation()

	const handleAddMember = (lecturer: any, role: CouncilMemberRole) => {
		if (members.some((m) => m.memberId === lecturer._id)) {
			toast.error('Giảng viên này đã có trong bộ ba')
			return
		}

		if (members.some((m) => m.role === role)) {
			toast.error(`Đã có người làm vai trò này`)
			return
		}

		const newMember: CouncilMemberInfo = {
			memberId: lecturer._id,
			fullName: lecturer.fullName,
			title: lecturer.title || '',
			role
		}
		setMembers([...members, newMember])
	}

	const handleRemoveMember = (memberId: string) => {
		setMembers(members.filter((m) => m.memberId !== memberId))
	}

	const handleSubmit = async () => {
		if (!selectedTopic) {
			toast.error('Vui lòng chọn đề tài')
			return
		}

		if (members.length !== 3) {
			toast.error('Bộ ba phải có đúng 3 giảng viên (1 chủ tịch, 1 thư ký, 1 ủy viên)')
			return
		}

		const hasChairperson = members.some((m) => m.role === 'chairperson')
		const hasSecretary = members.some((m) => m.role === 'secretary')
		const hasMember = members.some((m) => m.role === 'member')

		if (!hasChairperson || !hasSecretary || !hasMember) {
			toast.error('Bộ ba phải có 1 chủ tịch, 1 thư ký, 1 ủy viên')
			return
		}

		const payload: AddTopicToCouncilPayload = {
			topicId: selectedTopic._id,
			titleVN: selectedTopic.titleVN,
			titleEng: selectedTopic.titleEng || '',
			studentNames: selectedTopic.students?.map((s: any) => s.fullName) || [],
			members
		}

		try {
			await addTopic({ councilId, payload }).unwrap()
			toast.success('Thêm đề tài vào hội đồng thành công')
			onOpenChange(false)
			// Reset
			setSelectedTopic(null)
			setMembers([])
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}

	const availableRoles = (['chairperson', 'secretary', 'member'] as CouncilMemberRole[]).filter(
		(role) => !members.some((m) => m.role === role)
	)

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='max-h-[90vh] max-w-4xl overflow-y-auto'>
				<DialogHeader>
					<DialogTitle>Thêm đề tài vào hội đồng</DialogTitle>
				</DialogHeader>

				<div className='space-y-4'>
					{/* Step 1: Select Topic */}
					<div>
						<h3 className='mb-2 font-medium'>1. Chọn đề tài</h3>
						<div className='relative mb-2'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
							<Input
								placeholder='Tìm kiếm đề tài...'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className='pl-9'
							/>
						</div>

						<div className='max-h-40 space-y-2 overflow-y-auto rounded-lg border p-2'>
							{isLoadingTopics ? (
								<div className='flex items-center justify-center py-4'>
									<Loader2 className='h-6 w-6 animate-spin' />
								</div>
							) : topicsData && topicsData.data.length > 0 ? (
								topicsData.data.map((topic) => (
									<div
										key={topic._id}
										className={`cursor-pointer rounded-lg border p-3 hover:bg-muted/50 ${
											selectedTopic?._id === topic._id ? 'border-primary bg-primary/10' : ''
										}`}
										onClick={() => setSelectedTopic(topic)}
									>
										<p className='font-medium'>{topic.titleVN}</p>
										<p className='text-sm text-muted-foreground'>
											{topic.students?.map((s: any) => s.fullName).join(', ')}
										</p>
									</div>
								))
							) : (
								<p className='py-4 text-center text-sm text-muted-foreground'>
									Không tìm thấy đề tài chờ đánh giá
								</p>
							)}
						</div>
					</div>

					{/* Step 2: Select Members (only if topic selected) */}
					{selectedTopic && (
						<div>
							<h3 className='mb-2 font-medium'>2. Chọn bộ ba giảng viên ({members.length}/3)</h3>

							{/* Current Members */}
							{members.length > 0 && (
								<div className='mb-3 space-y-2'>
									{members.map((member) => (
										<div
											key={member.memberId}
											className='flex items-center justify-between rounded-lg border p-2'
										>
											<span>
												{member.role === 'chairperson'
													? '🏆 Chủ tịch'
													: member.role === 'secretary'
														? '📝 Thư ký'
														: '👤 Ủy viên'}{' '}
												- {member.title} {member.fullName}
											</span>
											<Button
												variant='ghost'
												size='sm'
												onClick={() => handleRemoveMember(member.memberId)}
											>
												Xóa
											</Button>
										</div>
									))}
								</div>
							)}

							{availableRoles.length > 0 && (
								<LecturerSelector onSelect={handleAddMember} availableRoles={availableRoles} />
							)}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button variant='outline' onClick={() => onOpenChange(false)} disabled={isAdding}>
						Hủy
					</Button>
					<Button onClick={handleSubmit} disabled={isAdding || !selectedTopic || members.length !== 3}>
						{isAdding ? 'Đang thêm...' : 'Thêm đề tài'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
