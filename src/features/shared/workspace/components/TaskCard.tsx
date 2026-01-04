import { useEffect, useState } from 'react'
import { StatusOptions, type RequestUpdate, type Task } from '@/models/todolist.model'
import { StatusTag } from './StatusTag'
import { ProgressBar } from './ProgressBar'
import { Button } from '@/components/ui'
import Column from './Column'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import {
	useMoveInColumnMutation,
	useMoveToNewColumnMutation,
	useUpdateTaskStatusMutation
} from '@/services/todolistApi'
import { toast } from 'sonner'
import { useAppSelector } from '@/store'
import { Calendar, Loader2 } from 'lucide-react'
import { formatDate } from '@/utils/utils'
import type { ResponseMilestone } from '@/models/milestone.model'
import { EditMilestoneModal } from './modal/EditMilestoneModal'

interface TaskCardProps {
	task: Task
	setTasks?: React.Dispatch<React.SetStateAction<Task[]>>
	onUpdateTask?: (taskId: string, update: RequestUpdate) => void
	isUpdating?: boolean
	onDeleteTask?: (taskId: string) => void
	onUpdateMilestone?: (taskId: string, milestoneId: string | undefined) => void
	milestones?: ResponseMilestone[]
}

const TaskCard = ({
	task,
	onUpdateTask,
	setTasks,
	onDeleteTask,
	onUpdateMilestone,
	isUpdating,
	milestones
}: TaskCardProps) => {
	const [editingValue, setEditingValue] = useState<RequestUpdate>({
		title: task.title,
		description: task.description
	})
	const [isEditingInfo, setIsEditingInfo] = useState(false)
	const [isEditMilestoneModalOpen, setIsEditMilestoneModalOpen] = useState(false)
	const [moveInColumn] = useMoveInColumnMutation()
	const [moveToNewColumn] = useMoveToNewColumnMutation()
	//gọi endpoint cập nhật trạng thái task
	const [updateTaskStatus] = useUpdateTaskStatusMutation()
	const group = useAppSelector((state) => state.group)
	// CORE: Handle drag end - works for BOTH within column AND between columns
	const handleDragEnd = async (event: DragEndEvent) => {
		const { active, over } = event
		if (!over || !setTasks) return

		const activeId = active.id as string
		const overId = over.id as string

		const sourceColumn = task.columns.find((col) => col.items.some((item) => item._id === activeId))

		const destColumn = task.columns.find(
			(col) => col._id === overId || col.items.some((item) => item._id === overId)
		)

		if (!sourceColumn || !destColumn) return

		const activeItem = sourceColumn.items.find((item) => item._id === activeId)
		if (!activeItem) return

		if (sourceColumn._id === destColumn._id) {
			const oldIndex = sourceColumn.items.findIndex((item) => item._id === activeId)
			const newIndex = sourceColumn.items.findIndex((item) => item._id === overId)

			if (oldIndex === -1 || newIndex === -1 || oldIndex === newIndex) return
			setTasks((prev) =>
				prev.map((t) => {
					if (t._id !== task._id) return t
					return {
						...t,
						columns: t.columns.map((col) => {
							if (col._id !== sourceColumn._id) return col
							return {
								...col,
								items: arrayMove(col.items, oldIndex, newIndex)
							}
						})
					}
				})
			)

			// Sync with backend
			try {
				await moveInColumn({ taskId: task._id, columnId: sourceColumn._id, oldPos: oldIndex, newPos: newIndex })
			} catch (error) {
				toast.error('Cập nhật vị trí thất bại', { richColors: true })
			}
		} else {
			const activeItem = sourceColumn.items.find((item) => item._id === activeId)
			if (!activeItem) return

			// Tính toán vị trí mới
			const overItemIndex = destColumn.items.findIndex((item) => item._id === overId)

			// Nếu thả vào item thì lấy index item đó, nếu thả vào cột rỗng thì cho xuống cuối
			let newIndex: number
			if (overItemIndex >= 0) {
				newIndex = overItemIndex
			} else {
				newIndex = destColumn.items.length // Thêm vào cuối
			}

			// Optimistic Update
			setTasks((prev) =>
				prev.map((t) => {
					if (t._id !== task._id) return t
					return {
						...t,
						columns: t.columns.map((col) => {
							// Xóa ở cột cũ
							if (col._id === sourceColumn._id) {
								return { ...col, items: col.items.filter((i) => i._id !== activeId) }
							}
							// Thêm vào cột mới
							if (col._id === destColumn._id) {
								const newItems = [...col.items]
								// Logic splice: chèn vào vị trí newIndex
								newItems.splice(newIndex, 0, activeItem)
								return { ...col, items: newItems }
							}
							return col
						})
					}
				})
			)
			try {
				await moveToNewColumn({
					taskId: task._id,
					newColumnId: destColumn._id,
					oldColumnId: sourceColumn._id,
					newPos: newIndex,
					subTaskId: activeId
				})
			} catch (error) {
				toast.error('Di chuyển nhiệm vụ thất bại', { richColors: true })
			}
		}
	}

	//gọi endpoint cập nhật coumns trong task

	const handleStartEdit = () => {
		setIsEditingInfo(true)
	}

	const handleSaveEdit = () => {
		if (!editingValue) return

		// Call parent update function if provided
		if (onUpdateTask && task._id) {
			onUpdateTask(task._id, editingValue)
		}
		setIsEditingInfo(false)
	}

	const handleCancelEdit = () => {
		setEditingValue({ title: task.title, description: task.description })
		setIsEditingInfo(false)
		setEditingValue({ title: task.title, description: task.description })
	}

	const calculateTaskProgress = (task: Task) => {
		let totalItems = 0
		let completedItems = 0

		task.columns.forEach((column) => {
			totalItems += column.items.length
			if (column.title === 'Done') {
				completedItems += column.items.length
			}
		})

		if (totalItems === 0) return 0
		return Math.round((completedItems / totalItems) * 100)
	}
	const progress = calculateTaskProgress(task)
	let taskStatus: 'Done' | 'In Progress' | 'Todo' = 'Todo'
	if (progress === 100) taskStatus = StatusOptions.DONE
	else if (progress > 0) taskStatus = StatusOptions.IN_PROGRESS
	useEffect(() => {
		if (progress === 100) taskStatus = StatusOptions.DONE
		else if (progress > 0) taskStatus = StatusOptions.IN_PROGRESS
		else taskStatus = StatusOptions.TODO
		if (task.status !== taskStatus)
			updateTaskStatus({ taskId: task._id, groupId: group.activeGroup?._id || '', status: taskStatus })
	}, [progress])
	const totalItems = task.columns.reduce((sum, col) => sum + col.items.length, 0)
	const doneItems = task.columns.find((col) => col.title === 'Done')?.items.length || 0

	// const isEditingTitle = editingField === 'title'
	// const isEditingDesc = editingField === 'description'

	return (
		<div key={task._id + task.title} className='rounded-xl border border-border bg-card p-4'>
			<div className='group/task mb-3 flex items-start justify-between'>
				<div className='flex-1'>
					{isEditingInfo ? (
						<div className='flex items-center gap-2'>
							<input
								type='text'
								value={editingValue?.title}
								onChange={(e) => setEditingValue({ ...editingValue, title: e.target.value })}
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleSaveEdit()
									if (e.key === 'Escape') handleCancelEdit()
								}}
								autoFocus
								className='flex-1 rounded border border-primary bg-secondary px-2 py-1 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
							/>
						</div>
					) : (
						<h5
							onClick={() => handleStartEdit()}
							className='cursor-pointer font-medium text-foreground hover:text-primary'
						>
							{task.title}
						</h5>
					)}

					{isEditingInfo ? (
						<div className='mt-1 flex items-center gap-2'>
							<input
								type='text'
								value={editingValue?.description}
								onChange={(e) => setEditingValue({ ...editingValue, description: e.target.value })}
								onKeyDown={(e) => {
									if (e.key === 'Enter') handleSaveEdit()
									if (e.key === 'Escape') handleCancelEdit()
								}}
								className='flex-1 rounded border border-primary bg-secondary px-2 py-1 text-xs text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
							/>
						</div>
					) : (
						<>
							{task.description ? (
								<p
									className='mt-1 cursor-pointer text-xs text-muted-foreground hover:text-primary'
									onClick={() => handleStartEdit()}
								>
									{task.description}
								</p>
							) : (
								<p
									className='mt-1 cursor-pointer text-xs italic text-muted-foreground/50 hover:text-primary'
									onClick={() => handleStartEdit()}
								>
									Thêm mô tả...
								</p>
							)}
							{/* Milestone Info */}
							{task.milestone ? (
								<div
									className='mt-2 flex cursor-pointer items-center gap-2 rounded-md bg-primary/5 px-2 py-1 text-xs transition-colors hover:bg-primary/10'
									onClick={() => milestones && setIsEditMilestoneModalOpen(true)}
									title='Click để thay đổi milestone'
								>
									<Calendar className='h-3 w-3 text-primary' />
									<span className='font-medium text-primary'>{task.milestone.title}</span>
									<span className='text-muted-foreground'>•</span>
									<span className='text-muted-foreground'>
										{new Date(task.milestone.dueDate).toLocaleString('vi-VN')}
									</span>
								</div>
							) : (
								milestones && (
									<button
										onClick={() => setIsEditMilestoneModalOpen(true)}
										className='mt-2 flex items-center gap-2 rounded-md border border-dashed border-primary/30 px-2 py-1 text-xs text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary'
									>
										<Calendar className='h-3 w-3' />
										<span>Liên kết milestone</span>
									</button>
								)
							)}
						</>
					)}
				</div>
				<div className='ml-2 flex flex-col gap-2'>
					<div className='flex gap-1'>
						{!isEditingInfo && (
							<Button
								variant='delete'
								className='hidden h-fit px-2 py-1 text-xs group-hover/task:block'
								onClick={() => onDeleteTask?.(task._id)}
							>
								Xóa
							</Button>
						)}
						<StatusTag status={taskStatus} type='subtask' />
					</div>
					{/* Task Header */}
					{isEditingInfo && (
						<div className='flex gap-2'>
							<button
								onClick={handleSaveEdit}
								className='rounded bg-primary px-2 py-1 text-xs text-primary-foreground hover:bg-primary/90'
							>
								{isUpdating ? (
									<Loader2 className='mr-2 inline-block h-3 w-3 animate-spin text-primary-foreground' />
								) : null}
								Lưu
							</button>
							<button
								onClick={handleCancelEdit}
								className='rounded bg-secondary px-2 py-1 text-xs text-foreground hover:bg-muted'
							>
								Hủy
							</button>
						</div>
					)}
				</div>
			</div>
			<ProgressBar progress={progress} status={progress === 100 ? 'Đã Hoàn thành' : 'Đang Tiến hành'} size='sm' />
			<p className='mt-2 text-xs text-muted-foreground'>
				{progress}% ({doneItems}/{totalItems} items)
			</p>
			{/* Items Kanban */}
			<div className='mt-3 grid grid-cols-3 gap-2'>
				{/* CORE: Single DndContext wrapping ALL columns - enables cross-column drag */}
				<DndContext onDragEnd={handleDragEnd}>
					{/* CORE: SortableContext with ALL item IDs from ALL columns - this allows any item to be dragged anywhere */}
					<SortableContext
						items={task.columns.flatMap((col) => col.items.map((item) => item._id))}
						strategy={verticalListSortingStrategy}
					>
						{task.columns.map((column) => {
							return <Column key={column._id} taskId={task._id} column={column} setTasks={setTasks} />
						})}
					</SortableContext>
				</DndContext>
			</div>

			{/* Edit Milestone Modal */}
			{milestones && (
				<EditMilestoneModal
					isOpen={isEditMilestoneModalOpen}
					onClose={() => setIsEditMilestoneModalOpen(false)}
					currentMilestoneId={task.milestone?._id}
					milestones={milestones}
					onSave={(milestoneId) => {
						onUpdateMilestone?.(task._id, milestoneId)
					}}
					taskTitle={task.title}
				/>
			)}
		</div>
	)
}

export default TaskCard
