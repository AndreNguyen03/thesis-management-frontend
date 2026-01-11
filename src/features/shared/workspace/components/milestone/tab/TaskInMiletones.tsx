import { cn } from '@/lib/utils'
import type { TaskDto } from '@/models/milestone.model'
import type { CreateTaskPayload } from '@/models/todolist.model'
import { useCreateTaskInMilestoneMutation } from '@/services/milestoneApi'
import { useAppSelector } from '@/store'
import { AlertCircle, ListTodo, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import TaskCardMinestone from '../component/TaskCardMinestone'
import { useParams } from 'react-router-dom'
interface TaskInMilestonesProps {
	milestoneId: string
	tasks?: TaskDto[]
}
export const TaskInMilestones = ({ milestoneId, tasks }: TaskInMilestonesProps) => {
	const { groupId } = useParams<{ groupId: string }>()
	const [newTask, setNewTask] = useState<CreateTaskPayload>({
		title: '',
		groupId: groupId!,
		description: '',
		milestoneId: milestoneId
	})

	//gọi endpoint tạo thêm task
	const [createTask, { isLoading: isLoadingCreate }] = useCreateTaskInMilestoneMutation()

	const handleAddTask = async () => {
		try {
			await createTask({ payload: newTask, groupId: groupId! }).unwrap()
			toast.success('Tạo task thành công!', { richColors: true })
		} catch (error) {
			console.error('Error creating task:', error)
			toast.error('Đã có lỗi xảy ra khi tạo task.', { richColors: true })
		}
		setNewTask({
			title: '',
			groupId: groupId!,
			description: '',
			milestoneId: milestoneId
		})
	}

	return (
		<div className='space-y-6'>
			<div className='rounded-lg border border-blue-100 bg-blue-50 p-4'>
				<p className='flex gap-2 text-sm text-blue-800'>
					<AlertCircle className='h-5 w-5 shrink-0' />
					Các task được tạo ở đây sẽ tự động thêm vào cột "Todo" trong bảng công việc của sinh viên.
				</p>
			</div>

			<div>
				<label className='mb-2 block text-sm font-medium text-slate-700'>Thêm Task Mới</label>
				<div className='mb-4 flex gap-2'>
					<input
						type='text'
						placeholder='Ví dụ: Thiết kế Database...'
						value={newTask.title}
						onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
						onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
						className='flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none'
					/>
					<button
						onClick={handleAddTask}
						disabled={!newTask.title.trim()}
						className={cn(
							'flex rounded-lg bg-orange-600 px-4 text-sm font-medium text-white',
							!newTask.title.trim() && 'cursor-not-allowed opacity-50'
						)}
					>
						<span className='flex items-center gap-2 py-2'>
							{isLoadingCreate && <Loader2 className='h-5 w-5 animate-spin' />}
							Thêm
						</span>
					</button>
				</div>
			</div>

			<div>
				<h3 className='mb-3 flex items-center gap-2 text-sm font-bold text-slate-700'>
					<ListTodo className='h-4 w-4' /> Danh sách Task hiện tại ({tasks?.length ?? 0})
				</h3>

				{!tasks || tasks.length === 0 ? (
					<div className='rounded-lg border-2 border-dashed border-slate-200 py-8 text-center'>
						<p className='text-sm text-slate-400'>Chưa có task nào được giao.</p>
					</div>
				) : (
					<div className='space-y-2'>
						{tasks.map((task) => {
							return <TaskCardMinestone key={task._id} task={task} />
						})}
					</div>
				)}
			</div>
		</div>
	)
}
