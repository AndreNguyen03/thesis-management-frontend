import React, { useState } from 'react'
import { getSubtaskStatusProps } from './StatusTag'
import { useCreateSubtaskMutation, useDeleteSubtaskMutation } from '@/services/todolistApi'
import { toast } from 'sonner'
import { Loader2, Plus } from 'lucide-react'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui'
import type { Subtask, Task, TaskColumn } from '@/models/todolist.model'
import { useDroppable } from '@dnd-kit/core' // CORE: Make column a drop zone
import SubTaskContainer from './SubTask'
import { DeleteModal } from './modal/DeleteModal'
import { SubtaskDetailModal } from '@/components/features/todolist/SubtaskDetailModal'
import { useParams } from 'react-router-dom'
export const Column = ({
	taskId,
	column,
	setTasks,
}: {
	taskId: string
	column: TaskColumn
	setTasks?: React.Dispatch<React.SetStateAction<Task[]>>
}) => {
	const { groupId } = useParams<{ groupId: string }>()

	const { className } = getSubtaskStatusProps(column.title as 'Todo' | 'In Progress' | 'Done')
	const [isAddingItem, setIsAddingItem] = useState(false)
	const [content, setContent] = useState('')
	const [createSubtask, { isLoading: isLoadingCreateSubtask }] = useCreateSubtaskMutation()
	const [deleteSubtask, { isLoading: isLoadingDeleteSubtask }] = useDeleteSubtaskMutation()
	const [deletingSubtask, setDeletingSubtask] = useState<Subtask | null>(null)
	const [isOpenDeleteSubtaskModal, setIsOpenDeleteSubtaskModal] = useState(false)
	const [selectedSubTaskId, setSelectedSubTaskId] = useState<string | null>(null)

	const handleCancelNewItem = () => {
		setContent('')
		setIsAddingItem(false)
	}
	const handleAddNewSubTask = async () => {
		try {
			const result = await createSubtask({
				taskId: taskId,
				title: content,
				columnId: column._id,
				groupId: groupId
			}).unwrap()

			setContent('')
			setIsAddingItem(false)
			setTasks?.((prev) => {
				return prev.map((t) => {
					if (t._id == taskId) {
						const updatedColumns = t.columns.map((col) => {
							if (col._id == column._id) {
								return {
									...col,
									items: [...col.items, result] as Subtask[]
								}
							}
							return col
						})
						return { ...t, columns: updatedColumns }
					}
					return t
				})
			})
		} catch (error) {
			console.error('Failed to add subtask:', error)
			toast.error('Thêm thất bại. Vui lòng thử lại.', { richColors: true })
		}
	}

	const handleDeleteSubTask = async () => {
		try {
			await deleteSubtask({
				taskId: taskId,
				columnId: column._id,
				subtaskId: deletingSubtask!._id,
				groupId: groupId
			}).unwrap()
			setTasks?.((prev) =>
				prev.map((t) => {
					if (t._id === taskId) {
						const updatedColumns = t.columns.map((col) => {
							if (col._id === column._id) {
								return {
									...col,
									items: col.items.filter((item) => item._id !== deletingSubtask!._id)
								}
							}
							return col
						})
						return { ...t, columns: updatedColumns }
					}
					return t
				})
			)
			setIsAddingItem(false)
			setDeletingSubtask(null)
			toast.success('Xóa nhiệm vụ thành công', { richColors: true })
		} catch (error) {
			console.error('Failed to delete subtask:', error)
			toast.error('Xóa thất bại. Vui lòng thử lại.', { richColors: true })
		}
	}
	const { setNodeRef, isOver } = useDroppable({ id: column._id })
	return (
		<div ref={setNodeRef}>
			<div key={column.title} className='flex h-full min-h-[200px] flex-col rounded-lg bg-secondary p-2'>
				<p className={`mb-2 text-base font-medium ${className.replace('status-', 'text-')}`}>
					{column.title} ({column.items.length})
				</p>
				<div className='flex-1 space-y-2'>
					{column.items.map((item) => (
						<SubTaskContainer
							taskId={taskId}
							columnId={column._id}
							key={item._id}
							item={item}
							onHandleDelete={() => {
								setDeletingSubtask(item)
								setIsOpenDeleteSubtaskModal(true)

							}}
							onOpenModal={() => {
								setSelectedSubTaskId(item._id)
							}}
						/>
					))}

					{!isOver && (
						<>
							{!isAddingItem ? (
								<div
									onClick={() => setIsAddingItem((prev) => !prev)}
									className='flex cursor-pointer items-center rounded-sm bg-gray-100 px-0.5 text-[12px] hover:bg-gray-200'
								>
									<Plus className='h-4 w-4' />
									<span className='text-foreground'>Thêm nhiệm vụ</span>
								</div>
							) : (
								<div className='flex flex-col gap-1'>
									<Textarea
										value={content}
										onChange={(e) => setContent(e.target.value)}
										rows={Math.max(1, Math.ceil(content.length / 30))}
										className='min-h-[32px] resize-none bg-white'
									/>
									<div className='flex gap-1'>
										<Button
											className='h-fit p-0 px-2 py-1 text-[12px]'
											onClick={handleAddNewSubTask}
											disabled={isLoadingCreateSubtask || !content.trim()}
										>
											{isLoadingCreateSubtask ? <Loader2 className='animate-spin' /> : 'Lưu'}
										</Button>
										<Button
											onClick={handleCancelNewItem}
											className='border-1 h-fit border-black bg-white p-0 px-2 py-1 text-[12px] hover:bg-gray-200'
										>
											<span className='text-black'>Hủy</span>
										</Button>
									</div>
								</div>
							)}
						</>
					)}
				</div>
				{deletingSubtask && (
					<DeleteModal
						isLoading={isLoadingDeleteSubtask}
						title={deletingSubtask.title}
						onOpenChange={setIsOpenDeleteSubtaskModal}
						open={isOpenDeleteSubtaskModal}
						onConfirm={() => handleDeleteSubTask()}
					/>
				)}
				{selectedSubTaskId && (
					<SubtaskDetailModal
						groupId={groupId!}
						subtaskId={selectedSubTaskId}
						taskId={taskId}
						columnId={column._id}
						onClose={() => setSelectedSubTaskId(null)}
					/>
				)}
			</div>
		</div>
	)
}

export default Column
