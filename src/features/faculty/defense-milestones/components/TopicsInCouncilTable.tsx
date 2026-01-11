import { useState } from 'react'
import type { TopicAssignment } from '@/models/defenseCouncil.model'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui'
import { ChevronUp, ChevronDown, Trash2, Edit, Users } from 'lucide-react'
import { CouncilMemberRoleOptions } from '@/models/milestone.model'
import EditTopicMembersDialog from './EditTopicMembersDialog'

interface TopicsInCouncilTableProps {
	topics: TopicAssignment[]
	onReorder: (topicId: string, newOrder: number) => void
	onRemove: (topicId: string) => void
	councilId: string
}

export default function TopicsInCouncilTable({ topics, onReorder, onRemove, councilId }: TopicsInCouncilTableProps) {
	const [editingTopicId, setEditingTopicId] = useState<string | null>(null)
	const [editingOrder, setEditingOrder] = useState<number | null>(null)
	const [selectedTopic, setSelectedTopic] = useState<TopicAssignment | null>(null)

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

	return (
		<>
			<div className='overflow-x-auto rounded-lg border'>
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead className='w-[80px]'>STT</TableHead>
							<TableHead className='w-[400px]'>Đề tài</TableHead>
							<TableHead className='w-[200px]'>Sinh viên</TableHead>
							<TableHead className='w-[300px]'>Bộ ba giảng viên</TableHead>
							<TableHead className='w-[120px]'>Điểm TB</TableHead>
							<TableHead className='w-[200px] text-center'>Thao tác</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{sortedTopics.map((topic, index) => (
							<TableRow key={topic.topicId}>
								{/* STT - Editable */}
								<TableCell>
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
													className='h-5 w-5 p-0'
													onClick={() => handleMoveUp(topic)}
													disabled={index === 0}
												>
													<ChevronUp className='h-4 w-4' />
												</Button>
												<Button
													variant='ghost'
													size='icon'
													className='h-5 w-5 p-0'
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
								<TableCell>
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

								{/* Council Members */}
								<TableCell>
									{topic.members && topic.members.length > 0 ? (
										<div className='space-y-2'>
											{topic.members.map((member, idx) => (
												<div key={idx} className='flex items-center gap-2'>
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
													<span className='text-sm'>
														{member.title} {member.fullName}
													</span>
												</div>
											))}
										</div>
									) : (
										<span className='text-sm text-muted-foreground'>Chưa có bộ ba</span>
									)}
								</TableCell>

								{/* Final Score */}
								<TableCell>
									{topic.finalScore !== undefined ? (
										<Badge variant='default' className='bg-green-600'>
											{topic.finalScore.toFixed(2)}
										</Badge>
									) : (
										<span className='text-sm text-muted-foreground'>Chưa chấm</span>
									)}
								</TableCell>

								{/* Actions */}
								<TableCell>
									<div className='flex justify-center gap-2'>
										<Button
											variant='ghost'
											size='icon'
											onClick={() => setSelectedTopic(topic)}
											title='Sửa bộ ba'
										>
											<Users className='h-4 w-4' />
										</Button>
										<Button
											variant='ghost'
											size='icon'
											onClick={() => onRemove(topic.topicId)}
											title='Xóa đề tài'
										>
											<Trash2 className='h-4 w-4 text-red-500' />
										</Button>
									</div>
								</TableCell>
							</TableRow>
						))}
					</TableBody>
				</Table>
			</div>

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
