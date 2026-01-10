import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { X, User, Tag, Calendar, AlertCircle, Clock, CheckSquare } from 'lucide-react'
import { vi as viLocale } from 'date-fns/locale'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { format } from 'date-fns'
import { Checkbox } from '@/components/ui/checkbox'
import type { TaskPriority } from '@/models/task-detail.model'
import { useToggleSubtaskCompleteMutation } from '@/services/todolistApi'
import { toast } from 'sonner'

import { TaskActivity } from './TaskActivity'
import { SubtaskAssignees } from './SubtaskAssignees'
import { SubtaskPrioritySelect } from './SubtaskPrioritySelect'
import { SubtaskLabels } from './SubtaskLabels'
import { SubtaskDueDate } from './SubtaskDueDate'
import { SubtaskDescription } from './SubtaskDescription'
import { SubtaskComments } from './SubtaskComments'
import type { Subtask } from '@/models/todolist.model'

interface SubtaskDetailContentProps {
	subtask: Subtask
	taskId: string
	columnId: string
	onClose: () => void
	groupId: string
}

export const SubtaskDetailContent = ({ subtask, taskId, columnId, onClose, groupId }: SubtaskDetailContentProps) => {
	const [activeTab, setActiveTab] = useState('comments')
	const [toggleComplete] = useToggleSubtaskCompleteMutation()

	const handleToggleComplete = async () => {
		try {
			await toggleComplete({
				taskId,
				columnId,
				subtaskId: subtask._id
			}).unwrap()
			toast.success('Cập nhật trạng thái subtask thành công')
		} catch (error) {
			toast.error('Không thể cập nhật trạng thái subtask')
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
				return 'bg-gray-500'
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
					<Checkbox checked={subtask.isCompleted} onCheckedChange={handleToggleComplete} />
					{/* <Badge className={`${getStatusColor(subtask.)} text-white`}>{subtask.status}</Badge> */}
					<h2 className='truncate text-xl font-semibold'>{subtask.title}</h2>
				</div>
				<Button variant='ghost' size='icon' onClick={onClose}>
					<X className='h-5 w-5' />
				</Button>
			</div>

			{/* Main Content - Two Columns */}
			<div className='flex flex-1 overflow-hidden'>
				{/* Left Column - Main Content */}
				<ScrollArea className='flex-1 bg-white p-6'>
					<div className='max-w-3xl space-y-6'>
						{/* Description Section */}
						<SubtaskDescription
							taskId={taskId}
							columnId={columnId}
							subtaskId={subtask._id}
							initialDescription={subtask.description}
						/>

						<Separator />

						{/* Activity & Comments Tabs */}
						<Tabs value={activeTab} onValueChange={setActiveTab}>
							<TabsList className='grid w-full grid-cols-2 gap-5'>
								<TabsTrigger
									value='comments'
									className='data-[state=active]:bg-blue-700 data-[state=active]:text-white'
								>
									Bình luận ({subtask.comments?.length || 0})
								</TabsTrigger>
								<TabsTrigger
									value='activity'
									className='data-[state=active]:bg-blue-700 data-[state=active]:text-white'
								>
									Hoạt động ({subtask.activities?.length || 0})
								</TabsTrigger>
							</TabsList>

							<TabsContent value='comments' className='mt-4'>
								<SubtaskComments
									taskId={taskId}
									columnId={columnId}
									subtaskId={subtask._id}
									comments={subtask.comments || []}
								/>
							</TabsContent>

							<TabsContent value='activity' className='mt-4'>
								<TaskActivity activities={subtask.activities || []} />
							</TabsContent>
						</Tabs>
					</div>
				</ScrollArea>

				{/* Right Sidebar - Details Panel */}
				<div className='w-80 overflow-y-auto border-l p-6'>
					<div className='space-y-6'>
						{/* Assignees */}
						<div>
							<div className='mb-2 flex items-center gap-2'>
								<User className='h-4 w-4 text-muted-foreground' />
								<span className='text-sm font-medium text-muted-foreground'>Phân công</span>
							</div>
							<SubtaskAssignees
								taskId={taskId}
								columnId={columnId}
								subtaskId={subtask._id}
								assignees={subtask.assignees || []}
								groupId={groupId}
							/>
						</div>

						<Separator />

						{/* Reporter */}
						{subtask.reporter && (
							<>
								<div>
									<div className='mb-2 flex items-center gap-2'>
										<User className='h-4 w-4 text-muted-foreground' />
										<span className='text-sm font-medium text-muted-foreground'>Người báo cáo</span>
									</div>
									<div className='flex items-center gap-2'>
										<img
											src={subtask.reporter.avatar}
											alt={subtask.reporter.fullname}
											className='h-8 w-8 rounded-full'
										/>
										<div className='text-sm'>
											<div className='font-medium'>{subtask.reporter.fullname}</div>
											<div className='text-xs text-muted-foreground'>
												{subtask.reporter.email}
											</div>
										</div>
									</div>
								</div>
								<Separator />
							</>
						)}

						{/* Priority */}
						<div>
							<div className='mb-2 flex items-center gap-2'>
								{getPriorityIcon(subtask.priority)}
								<span className='text-sm font-medium text-muted-foreground'>Độ ưu tiên</span>
							</div>
							<SubtaskPrioritySelect
								taskId={taskId}
								columnId={columnId}
								subtaskId={subtask._id}
								currentPriority={subtask.priority}
							/>
						</div>

						<Separator />

						{/* Labels */}
						<div>
							<div className='mb-2 flex items-center gap-2'>
								<Tag className='h-4 w-4 text-muted-foreground' />
								<span className='text-sm font-medium text-muted-foreground'>Nhãn</span>
							</div>
							<SubtaskLabels
								taskId={taskId}
								columnId={columnId}
								subtaskId={subtask._id}
								labels={subtask.labels || []}
							/>
						</div>

						<Separator />

						{/* Due Date */}
						<div>
							<div className='mb-2 flex items-center gap-2'>
								<Calendar className='h-4 w-4 text-muted-foreground' />
								<span className='text-sm font-medium text-muted-foreground'>Ngày hạn chót</span>
							</div>
							<SubtaskDueDate
								taskId={taskId}
								columnId={columnId}
								subtaskId={subtask._id}
								dueDate={subtask.dueDate}
							/>
						</div>

						<Separator />

						{/* Timestamps */}
						{subtask.created_at && (
							<div className='space-y-2 text-xs text-muted-foreground'>
								<div className='flex items-center gap-2'>
									<Clock className='h-3 w-3' />
									<span>
										Đã tạo vào lúc{' '}
										{format(new Date(subtask.created_at), 'PPp', { locale: viLocale })}
									</span>
								</div>
								{subtask.updated_at && (
									<div className='flex items-center gap-2'>
										<Clock className='h-3 w-3' />
										<span>
											Đã cập nhật vào lúc{' '}
											{format(new Date(subtask.updated_at), 'PPp', { locale: viLocale })}
										</span>
									</div>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
