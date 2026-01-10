import type { TaskDto } from '@/models/milestone.model'
import type { RequestUpdate } from '@/models/todolist.model'
import { useDeleteTaskMutation, useUpdateTaskInfoMutation } from '@/services/todolistApi'
import { useAppSelector } from '@/store/configureStore'
import { Check, SquarePen, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { DeleteConfirmModal } from '../modal/DeleteConfirmModal'
import { TaskDetailModal } from '@/components/features/todolist/TaskDetailModal'

const TaskCardMinestone = ({ task }: { task: TaskDto }) => {
	const [isOpenConfirmDeleteModal, setIsOpenConfirmDeleteModal] = useState(false)
	const [isTaskDetailModalOpen, setIsTaskDetailModalOpen] = useState(false)
	const group = useAppSelector((state) => state.group)
	const [isEditting, setIsEditting] = useState(false)
	const [editInfo, setEditInfo] = useState<RequestUpdate>({
		title: task.title,
		description: task.description
	})
	//gọi endpoitn xóa task
	const [deleteTask, { isLoading: isLoadingDelete }] = useDeleteTaskMutation()
	const [selectedTaskId, setSelectedTaskId] = useState<string>('')
	const [updateTaskInfo, { isLoading: isUpdating }] = useUpdateTaskInfoMutation()

	const handleSave = async () => {
		try {
			await updateTaskInfo({
				taskId: task._id,
				updates: editInfo,
				groupId: group.activeGroup?._id
			})
			toast.success('Cập nhật thành công!', { richColors: true })
			setIsEditting(false)
		} catch (error) {
			toast.error('Có lỗi khi cập nhật', { richColors: true })
		}
	}
	const handleDeleteTask = async (id: string) => {
		try {
			await deleteTask({ taskId: id, groupId: group.activeGroup?._id })
			setIsOpenConfirmDeleteModal(false)
			setSelectedTaskId('')
			toast.success('Đã xóa task thành công!', { richColors: true })
		} catch (error) {
			console.error('Error creating task:', error)
			toast.error('Đã có lỗi xảy ra khi xóa task.', { richColors: true })
		}
	}
	return (
		<div
			key={task._id}
			className='group flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-orange-300'
		>
			<div className='flex items-center gap-3'>
				<div
					className={`h-2 w-2 rounded-full ${task.status === 'Done' ? 'bg-emerald-500' : task.status === 'In Progress' ? 'bg-blue-500' : 'bg-slate-300'}`}
				></div>
				<div>
					{isEditting ? (
						<div className='flex flex-col gap-1'>
							<input
								className='mb-1 rounded border px-2 py-1 text-[13px]'
								value={editInfo.title}
								onChange={(e) => setEditInfo((info) => ({ ...info, title: e.target.value }))}
								disabled={isUpdating}
							/>
							<textarea
								className='max-h-[300px] min-h-[50px] w-[300px] resize-y rounded border px-2 py-1 text-[13px]'
								value={editInfo.description || ''}
								onChange={(e) =>
									setEditInfo((info) => ({
										...info,
										description: e.target.value
									}))
								}
								disabled={isUpdating}
								placeholder='Mô tả'
							/>
						</div>
					) : (
						<div>
							<p
								className='cursor-pointer text-sm font-medium text-slate-800 hover:text-primary'
								onClick={() => setIsTaskDetailModalOpen(true)}
							>
								{task.title}
							</p>
							<p className='text-xs text-slate-400'>Trạng thái: {task.status}</p>
							<div className='mt-1 flex items-center gap-2'>
								<span className='text-xs text-slate-500'>{task.description}</span>
							</div>
						</div>
					)}
				</div>
			</div>

			{isEditting ? (
				<div className='mt-1 flex gap-2'>
					<button
						onClick={handleSave}
						disabled={isUpdating || !editInfo.title.trim()}
						className='text-xs text-slate-500 hover:text-green-600'
						title='Lưu'
					>
						<Check className='h-4 w-4' />
					</button>
					<button
						onClick={() => {
							setIsEditting(false)
							setEditInfo({
								title: task.title,
								description: task.description
							})
						}}
						className='text-xs text-gray-400 hover:text-red-500'
						title='Hủy'
					>
						<X className='h-4 w-4' />
					</button>
				</div>
			) : (
				<div className='flex gap-1'>
					<button
						onClick={() => setIsEditting(true)}
						className='p-1 text-xs text-slate-400 opacity-0 transition-opacity hover:text-blue-500 group-hover:opacity-100'
						title='Chỉnh sửa'
					>
						<SquarePen className='h-4 w-5' />
					</button>
					<button
						onClick={() => {
							setSelectedTaskId(task._id)
							setIsOpenConfirmDeleteModal(true)
						}}
						className='p-1 text-slate-400 opacity-0 transition-opacity hover:text-red-500 group-hover:opacity-100'
						title='Xóa task'
					>
						<Trash2 className='h-4 w-4' />
					</button>
				</div>
			)}
			<DeleteConfirmModal
				open={isOpenConfirmDeleteModal}
				onOpenChange={setIsOpenConfirmDeleteModal}
				onConfirm={() => handleDeleteTask(selectedTaskId)}
				isLoading={isLoadingDelete}
			/>

			{/* Jira-like Task Detail Modal */}
			<TaskDetailModal
				taskId={task._id}
				isOpen={isTaskDetailModalOpen}
				onClose={() => setIsTaskDetailModalOpen(false)}
			/>
		</div>
	)
}

export default TaskCardMinestone
