import { useState } from 'react'
import type { TaskDetail, TaskPriority } from '@/models/task-detail.model'
import { Button } from '@/components/ui/Button'
import { X, User, Tag, Calendar, AlertCircle, Clock, CheckSquare, Check } from 'lucide-react'
import { vi as viLocale } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { TaskDescription } from './TaskDescription'
import { TaskComments } from './TaskComments'
import { TaskActivity } from './TaskActivity'
import { TaskAssignees } from './TaskAssignees'
import { TaskPrioritySelect } from './TaskPrioritySelect'
import { TaskLabels } from './TaskLabels'
import { TaskDueDate } from './TaskDueDate'
import { Checkbox } from '@/components/ui/checkbox'
import { SubtaskDetailModal } from './SubtaskDetailModal'
import { Avatar } from '@/features/shared/workspace/components/Avatar'
import type { SubTaskUser } from '@/models/todolist.model'
import { toast } from 'sonner'
import { useUpdateTaskInfoMutation } from '@/services/todolistApi'
import { Input } from '@/components/ui/input'

interface TaskDetailContentProps {
	task: TaskDetail
	onClose: () => void
}

export const TaskDetailContent = ({ task, onClose }: TaskDetailContentProps) => {
	const [activeTab, setActiveTab] = useState('comments')
	const [isEditting, setIsEditting] = useState(false)
	const [newTitle, setNewTitle] = useState(task.title)
	//gọi endpoint chỉnh sửa tiêu đề
	const [updateTaskInfo, { isLoading: isUpdating }] = useUpdateTaskInfoMutation()
	const [selectedSubtaskId, setSelectedSubtaskId] = useState<string | null>(null)
	const [selectedColumnId, setSelectedColumnId] = useState<string>('')
	const saveNewTitle = async () => {
		try {
			await updateTaskInfo({
				taskId: task._id,
				groupId: undefined,
				updates: { title: newTitle }
			})
			toast.success('Cập nhật tiêu đề thành công', {
				richColors: true,
				description: 'Tiêu đề công việc đã được cập nhật'
			})
			setIsEditting(false)
		} catch (error) {
			toast.error('Cập nhật tiêu đề thất bại' + error, {
				richColors: true,
				description: 'Không thể cập nhật tiêu đề công việc'
			})
		}
	}
	const getStatusColor = (status: string) => {
		switch (status) {
			case 'Todo':
				return 'bg-slate-500'
			case 'In Progress':
				return 'bg-blue-500'
			case 'Done':
				return 'bg-green-500'
			default:
				return 'bg-gray-50f0'
		}
	}

	const getPriorityIcon = (priority: TaskPriority) => {
		switch (priority) {
			case 'Highest':
			case 'High':
				return <AlertCircle className='h-4 w-4 text-red-500' />
			case 'Medium':
				return <AlertCircle className='h-4 w-4 text-orange-500' />
			default:
				return <AlertCircle className='h-4 w-4 text-green-500' />
		}
	}

	return (
		<div className='flex h-[90vh] flex-col'>
			{/* Header */}
			<div className='flex items-center justify-between border-b p-6'>
				<div className='flex flex-1 items-center gap-3'>
					<Badge className={`${getStatusColor(task.status)} text-white`}>{task.status}</Badge>

					{isEditting ? (
						<div className='flex items-center gap-2'>
							<Input
								className='min-w-96'
								value={newTitle}
								onChange={(e) => setNewTitle(e.target.value)}
							/>
							<Button
								className='h-fit cursor-pointer border bg-white text-black hover:border-green-500 hover:text-green-500'
								onClick={() => saveNewTitle()}
							>
								<Check className='h-4 w-4' />
							</Button>
							<Button
								className='h-fit cursor-pointer border bg-white text-black hover:border-red-400 hover:text-red-400'
								onClick={() => {
									setIsEditting(false)
									setNewTitle(task.title)
								}}
							>
								<X className='h-4 w-4' />
							</Button>
						</div>
					) : (
						<h2
							className='cursor-pointer truncate px-2 py-1 text-xl font-semibold hover:bg-gray-100'
							onClick={() => setIsEditting(true)}
						>
							{task.title}
						</h2>
					)}
				</div>
				<Button variant='ghost' size='icon' className='hover:text-red-400' onClick={onClose}>
					<X className='!h-6 !w-6' />
				</Button>
			</div>

			{/* Main Content - Two Columns */}
			<div className='flex flex-1 overflow-hidden'>
				{/* Left Column - Main Content */}
				<ScrollArea className='flex-1 bg-white p-6'>
					<div className='max-w-3xl space-y-6'>
						{/* Description Section */}
						<TaskDescription taskId={task._id} initialDescription={task.description} />

						<Separator />
						{task.columns && task.columns.length > 0 && (
							<>
								<div>
									<div className='mb-3 flex items-center gap-2'>
										<CheckSquare className='h-5 w-5 text-muted-foreground' />
										<h3 className='text-lg font-semibold'>Subtasks</h3>
									</div>
									<div className='space-y-3'>
										{task.columns.map((column) => (
											<div key={column._id} className='rounded-lg border p-3'>
												<h4 className='mb-2 text-sm font-medium text-muted-foreground'>
													{column.title}
												</h4>
												<div className='space-y-2'>
													{column.items && column.items.length > 0 ? (
														column.items.map((subtask) => (
															<div
																key={subtask._id}
																className='flex cursor-pointer items-center gap-3 rounded-md border bg-card p-3 transition-colors hover:bg-accent'
																onClick={() => {
																	setSelectedSubtaskId(subtask._id)
																	setSelectedColumnId(column._id)
																}}
															>
																<Checkbox
																	checked={subtask.isCompleted}
																	onClick={(e) => e.stopPropagation()}
																/>
																<div className='flex-1'>
																	<p
																		className={`text-sm ${subtask.isCompleted ? 'text-muted-foreground line-through' : ''}`}
																	>
																		{subtask.title}
																	</p>
																	{subtask.dueDate && (
																		<p className='mt-1 text-xs text-muted-foreground'>
																			Hạn:{' '}
																			{format(new Date(subtask.dueDate), 'PPP', {
																				locale: viLocale
																			})}
																		</p>
																	)}
																</div>
																{subtask.assignees && subtask.assignees.length > 0 && (
																	<div className='flex -space-x-2'>
																		{subtask.assignees
																			.slice(0, 3)
																			.map((assignee: SubTaskUser) => (
																				<Avatar
																					fullName={assignee.fullName}
																					avatarUrl={assignee.avatarUrl}
																				/>
																			))}
																	</div>
																)}
															</div>
														))
													) : (
														<p className='text-sm italic text-muted-foreground'>
															Chưa có subtask nào
														</p>
													)}
												</div>
											</div>
										))}
									</div>
								</div>

								<Separator />
							</>
						)}

						{/* 
						{/* Activity & Comments Tabs */}
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className='grid w-full grid-cols-2 gap-5'>
								<TabsTrigger
									value='comments'
									className='data-[state=active]:bg-blue-700 data-[state=active]:text-white'
								>
									Bình luận ({task.comments?.length || 0})
								</TabsTrigger>
								<TabsTrigger
									value='activity'
									className='data-[state=active]:bg-blue-700 data-[state=active]:text-white'
								>
									Hoạt động ({task.activities?.length || 0})
								</TabsTrigger>
							</TabsList>

							<TabsContent value='comments' className='active[ mt-4'>
								<TaskComments taskId={task._id} comments={task.comments || []} task={task} />
							</TabsContent>

							<TabsContent value='activity' className='mt-4'>
								<TaskActivity activities={task.activities || []} />
							</TabsContent>
						</Tabs>
					</div>
				</ScrollArea>

				{/* Right Sidebar - Details Panel (giống Jira) */}
				<div className='w-80 overflow-y-auto border-l p-6'>
					<div className='space-y-6'>
						{/* Assignees */}
						<div>
							<div className='mb-2 flex items-center gap-2'>
								<User className='h-4 w-4 text-muted-foreground' />
								<span className='text-sm font-medium text-muted-foreground'>Phân công</span>
							</div>
							<TaskAssignees taskId={task._id} groupId={task.groupId} assignees={task.assignees || []} />
						</div>

						<Separator />

						{/* Reporter */}
						<div>
							<div className='mb-2 flex items-center gap-2'>
								<User className='h-4 w-4 text-muted-foreground' />
								<span className='text-sm font-medium text-muted-foreground'>Người báo cáo</span>
							</div>
							<div className='flex items-center gap-2'>
								<Avatar fullName={task.reporter?.fullName} avatarUrl={task.reporter?.avatarUrl} />
								<div className='text-sm'>
									<div className='font-medium'>{task.reporter?.fullName || 'Unknown'}</div>
									<div className='text-xs text-muted-foreground'>{task.reporter?.email}</div>
								</div>
							</div>
						</div>

						<Separator />

						{/* Priority */}
						<div>
							<div className='mb-2 flex items-center gap-2'>
								{getPriorityIcon(task.priority)}
								<span className='text-sm font-medium text-muted-foreground'>Độ ưu tiên</span>
							</div>
							<TaskPrioritySelect taskId={task._id} currentPriority={task.priority} />
						</div>

						<Separator />

						{/* Labels */}
						<div>
							<div className='mb-2 flex items-center gap-2'>
								<Tag className='h-4 w-4 text-muted-foreground' />
								<span className='text-sm font-medium text-muted-foreground'>Nhãn</span>
							</div>
							<TaskLabels taskId={task._id} labels={task.labels || []} />
						</div>

						<Separator />

						{/* Due Date */}
						<div>
							<div className='mb-2 flex items-center gap-2'>
								<Calendar className='h-4 w-4 text-muted-foreground' />
								<span className='text-sm font-medium text-muted-foreground'>Ngày hạn chót</span>
							</div>
							<TaskDueDate taskId={task._id} dueDate={task.dueDate} />
						</div>

						<Separator />

						{/* Timestamps */}
						<div className='space-y-2 text-xs text-muted-foreground'>
							<div className='flex items-center gap-2'>
								<Clock className='h-3 w-3' />
								<span>
									Đã tạo vào lúc {format(new Date(task.created_at), 'PPp', { locale: viLocale })}
								</span>
							</div>
							<div className='flex items-center gap-2'>
								<Clock className='h-3 w-3' />
								<span>
									Đã cập nhật vào lúc {format(new Date(task.updated_at), 'PPp', { locale: viLocale })}
								</span>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Subtask Detail Modal */}
			{selectedSubtaskId && (
				<SubtaskDetailModal
					subtaskId={selectedSubtaskId}
					taskId={task._id}
					columnId={selectedColumnId}
					onClose={() => {
						setSelectedSubtaskId(null)
						setSelectedColumnId('')
					}}
					groupId={task.groupId}
				/>
			)}
		</div>
	)
}
