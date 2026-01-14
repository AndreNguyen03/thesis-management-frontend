import { useState } from 'react'
import { CouncilMemberRoleOptions, type TopicAssignment } from '@/models/defenseCouncil.model'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui'
import { ChevronUp, ChevronDown, Trash2, Edit, Users, Eye } from 'lucide-react'
import EditTopicMembersDialog from './EditTopicMembersDialog'
import { useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '../../manage_phase/completion-phase/manage-defense-milestone/ConfirmDialog'

interface TopicsInCouncilTableProps {
	topics: TopicAssignment[]
	onReorder: (topicId: string, newOrder: number) => void
	onRemove: (topicId: string) => void
	councilId: string
}
type ActionType = 'delete'

export default function TopicsInCouncilTable({ topics, onReorder, onRemove, councilId }: TopicsInCouncilTableProps) {
	const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
	const [editingOrder, setEditingOrder] = useState<number | null>(null)
	const [selectedTopic, setSelectedTopic] = useState<TopicAssignment | null>(null)
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
	const navigate = useNavigate()
	// Sort topics by defenseOrder
	const sortedTopics = [...topics].sort((a, b) => a.defenseOrder - b.defenseOrder)

	const handleOrderChange = (topicId: string, currentOrder: number) => {
		setEditingTopicId(topicId)
		setEditingOrder(currentOrder)
	}

	const handleOrderSave = (topicId: string) => {
		if (editingOrder !== null && editingOrder > 0) {
			onReorder(topicId, editingOrder)
		}
		setEditingTopicId(null)
		setEditingOrder(null)
	}

	const handleMoveUp = (topic: TopicAssignment) => {
		const currentIndex = sortedTopics.findIndex((t) => t.topicId === topic.topicId)
		if (currentIndex > 0) {
			const newOrder = sortedTopics[currentIndex - 1].defenseOrder
			onReorder(topic.topicId, newOrder)
		}
	}

	const handleMoveDown = (topic: TopicAssignment) => {
		const currentIndex = sortedTopics.findIndex((t) => t.topicId === topic.topicId)
		if (currentIndex < sortedTopics.length - 1) {
			const newOrder = sortedTopics[currentIndex + 1].defenseOrder
			onReorder(topic.topicId, newOrder)
		}
	}
	const handleConfirmAction = async () => {
		if (!councilId) return
		if (confirmDialog.type === 'delete') {
			onRemove(confirmDialog.topicId!)
		}
	}

	return (
		<>
			<div className='overflow-x-auto rounded-lg border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-[80px]'>STT</TableHead>
							<TableHead className='w-[400px]'>Đề tài</TableHead>
							<TableHead className='w-[200px]'>Sinh viên</TableHead>
							<TableHead className='w-[200px]'>GVHD</TableHead>
							<TableHead className='w-[300px]'>GVPB</TableHead>
							<TableHead className='w-[300px]'>HĐ chấm</TableHead>
							<TableHead className='w-[120px]'>Điểm TB</TableHead>
							<TableHead className='w-[200px] text-center'>Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedTopics.map((topic, index) => (
							<TableRow key={topic.topicId}>
								{/* STT - Editable */}
								<TableCell style={{ minWidth: '30px', maxWidth: '10px', width: '10px' }}>
									{editingTopicId === topic.topicId ? (
										<div className='flex items-center gap-1'>
											<Input
												type='number'
												min={1}
												value={editingOrder ?? topic.defenseOrder}
												onChange={(e) => setEditingOrder(Number(e.target.value))}
												onBlur={() => handleOrderSave(topic.topicId)}
												onKeyDown={(e) => {
													if (e.key === 'Enter') handleOrderSave(topic.topicId)
													if (e.key === 'Escape') {
														setEditingTopicId(null)
														setEditingOrder(null)
													}
												}}
												className='w-16 text-center'
												autoFocus
											/>
										</div>
									) : (
										<div className='flex items-center gap-2'>
											<span
												className='cursor-pointer font-medium'
												onClick={() => handleOrderChange(topic.topicId, topic.defenseOrder)}
											>
												{topic.defenseOrder}
											</span>
											<div className='flex flex-col'>
												<Button
													variant='ghost'
													size='icon'
													className='h-5 w-5 p-0 text-blue-600 disabled:text-gray-400'
													onClick={() => handleMoveUp(topic)}
													disabled={index === 0}
												>
													<ChevronUp className='h-4 w-4' />
												</Button>
												<Button
													variant='ghost'
													size='icon'
													className='h-5 w-5 p-0 text-blue-600 disabled:text-gray-400'
													onClick={() => handleMoveDown(topic)}
													disabled={index === sortedTopics.length - 1}
												>
													<ChevronDown className='h-4 w-4' />
												</Button>
											</div>
										</div>
									)}
								</TableCell>

								{/* Topic Title */}
								<TableCell style={{ minWidth: '80px', maxWidth: '90px', width: '90px' }}>
									<div>
										<p className='font-medium'>{topic.titleVN}</p>
										{topic.titleEng && (
											<p className='text-sm text-muted-foreground'>{topic.titleEng}</p>
										)}
									</div>
								</TableCell>

								{/* Students */}
								<TableCell>
									{topic.studentNames && topic.studentNames.length > 0 ? (
										<div className='space-y-1'>
											{topic.studentNames.map((name, idx) => (
												<p key={idx} className='text-sm'>
													{name}
												</p>
											))}
										</div>
									) : (
										<span className='text-sm text-muted-foreground'>Chưa có SV</span>
									)}
								</TableCell>
								{/* GVHD */}
								<TableCell>
									{topic.lecturerNames && topic.lecturerNames.length > 0 ? (
										<div className='space-y-1'>
											{topic.lecturerNames.map((name, idx) => (
												<p key={idx} className='text-sm'>
													{name}
												</p>
											))}
										</div>
									) : (
										<span className='text-sm text-muted-foreground'>Chưa có GVHD</span>
									)}
								</TableCell>
								{/* Phản biện */}
								<TableCell>
									{topic.members && topic.members.length > 0 ? (
										<div className='space-y-2'>
											{topic.members.map(
												(member, idx) =>
													member.role === 'reviewer' && (
														<div key={idx} className='flex items-center gap-2'>
															<span className='text-sm'>
																{member.title} {member.fullName}
															</span>
														</div>
													)
											)}
										</div>
									) : (
										<span className='text-sm text-muted-foreground'>Chưa có hội đồng chấm</span>
									)}
								</TableCell>
								{/* Council Members */}
								<TableCell style={{ minWidth: '300px', maxWidth: '110px', width: '100px' }}>
									{topic.members && topic.members.length > 0 ? (
										<div className='space-y-2'>
											{topic.members.map(
												(member, idx) =>
													member.role !== 'reviewer' && (
														<div key={idx} className='flex items-center gap-2'>
															<span className='font-bold'>
																{CouncilMemberRoleOptions[
																	member.role as keyof typeof CouncilMemberRoleOptions
																]?.label || member.role}{' '}
																-
															</span>
															<span className='text-sm'>
																{member.title} {member.fullName}
															</span>
														</div>
													)
											)}
										</div>
									) : (
										<span className='text-sm text-muted-foreground'>Chưa có hội đồng chấm</span>
									)}
								</TableCell>

								{/* Final Score */}
								<TableCell style={{ minWidth: '16px', maxWidth: '16px', width: '16px' }}>
									{topic.finalScore !== undefined ? (
										<Badge variant='default' className='bg-green-600'>
											{topic.finalScore.toFixed(2)}
										</Badge>
									) : (
										<span className='text-sm text-muted-foreground'>Chưa chấm</span>
									)}
								</TableCell>

								{/* Actions */}
								<TableCell style={{ minWidth: '10px', maxWidth: '10px', width: '10px' }}>
									<div className='flex flex-col items-center justify-center gap-2'>
										<Button
											variant='ghost'
											size='icon'
											onClick={() => setSelectedTopic(topic)}
											title='Sửa hội đồng chấm'
										>
											<Users className='h-4 w-4' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											onClick={() =>
												setConfirmDialog({ open: true, type: 'delete', topicId: topic.topicId })
											}
											title='Xóa đề tài'
										>
											<Trash2 className='h-4 w-4 text-red-500' />
										</Button>
										<Button
											className='w-fit'
											variant='ghost'
											onClick={() => navigate(`/detail-topic/${topic.topicId}`)}
										>
											<Eye className='h-4 w-4' />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>
			<ConfirmDialog
				open={confirmDialog.open}
				onOpenChange={(open) => setConfirmDialog({ ...confirmDialog, open })}
				title={confirmDialog.type === 'delete' ? 'Xác nhận hủy bỏ đề tài khỏi hội đồng' : ''}
				description={
					confirmDialog.type === 'delete'
						? 'Đề tài sẽ được loại bỏ ra khỏi hội đồng bảo vệ. Bạn có chắc chắn muốn tiếp tục?'
						: ''
				}
				onConfirm={handleConfirmAction}
				isLoading={false}
				confirmText={confirmDialog.type === 'delete' ? 'Xóa đề tài' : ''}
			/>
			{/* Edit Members Dialog */}
			{selectedTopic && (
				<EditTopicMembersDialog
					open={!!selectedTopic}
					onOpenChange={(open) => !open && setSelectedTopic(null)}
					topic={selectedTopic}
					councilId={councilId}
				/>
			)}
		</>
	)
}
