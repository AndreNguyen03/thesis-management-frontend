import React, { useState, useMemo, useEffect } from 'react'
import { Plus, CheckCircle, Clock, Zap, LayoutDashboard, ArrowRight } from 'lucide-react'
import { ProgressBar } from './ProgressBar'
import type { CreateTaskPayload, RequestUpdate, Task } from '@/models/todolist.model'
import {
	useCreateTaskMutation,
	useDeleteTaskMutation,
	useGetStaskQuery,
	useUpdateTaskInfoMutation
} from '@/services/todolistApi'
import { toast } from 'sonner'
import TaskCard from './Task'
import { DeleteModal } from './modal/DeleteModal'
import { useAppSelector } from '@/store'

interface Milestone {
	id: number
	title: string
	dueDate: string
	progress: number
	status: string
}

interface ProgressPanelProps {
	milestones: Milestone[]
	totalProgress: number
}

export const ProgressPanel = ({ milestones, totalProgress }: ProgressPanelProps) => {
	const group = useAppSelector((state) => state.group)
	// Lấy dữ liệu từ API
	const { data: tasksData, isLoading } = useGetStaskQuery(
		{ groupId: group.activeGroup?._id ?? '' },
		{ skip: !group.activeGroup?._id }
	)

	// Khởi tạo với initialTasks, sau đó merge với data từ API
	const [tasks, setTasks] = useState<Task[]>([])
	useEffect(() => {
		if (tasksData) {
			setTasks(tasksData)
		}
	}, [tasksData])
	// Sync tasks khi tasksData được fetch
	React.useEffect(() => {
		if (tasksData && tasksData.length > 0) {
			// Merge: Giữ initialTasks + thêm tasksData từ API (loại bỏ duplicate)
			setTasks(tasksData)
		}
	}, [tasksData])
	const [newTask, setNewTask] = useState<CreateTaskPayload>({
		groupId: group.activeGroup?._id || '',
		title: '',
		description: ''
	})
	const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false)

	// ID of the task to be deleted
	const [deletedTask, setDeletedTask] = useState<Task | null>(null)
	const [isDescriptionVisible, setIsDescriptionVisible] = useState(false)
	//gọi endpoint tạo task
	const [createTask] = useCreateTaskMutation()
	//gọi endpoint update task
	const [updateTaskInfo] = useUpdateTaskInfoMutation()
	//gọi endpoint xóa nhiệm vụ
	const [deleteTask, { isLoading: isDeleteLoading }] = useDeleteTaskMutation()
	// Calculate milestone stats
	const milestoneStats = useMemo(() => {
		const stats = { completed: 0, pendingReview: 0, inProgress: 0, overdue: 0, total: milestones.length }
		milestones.forEach((m) => {
			switch (m.status) {
				case 'Đã Hoàn thành':
					stats.completed++
					break
				case 'Đang Chờ Duyệt':
					stats.pendingReview++
					break
				case 'Đang Tiến hành':
					stats.inProgress++
					break
				case 'Quá Hạn':
					stats.overdue++
					break
			}
		})
		return stats
	}, [milestones])

	const taskStats = useMemo(() => {
		const stats = { todo: 0, inProgress: 0, done: 0, total: 0 }
		tasks.forEach((task) => {
			task.columns.forEach((column) => {
				const columnItems = column.items.length
				stats.total += columnItems
				switch (column.title) {
					case 'Done':
						stats.done += columnItems
						break
					case 'In Progress':
						stats.inProgress += columnItems
						break
					case 'Todo':
						stats.todo += columnItems
						break
				}
			})
		})
		return stats
	}, [tasks])

	const nextDueDate = useMemo(() => {
		const upcoming = milestones
			.filter((m) => m.status !== 'Đã Hoàn thành' && m.status !== 'Quá Hạn')
			.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
		return upcoming.length > 0 ? upcoming[0].dueDate : 'Chưa xác định'
	}, [milestones])

	const handleCreateTask = async () => {
		if (!newTask.title.trim()) return

		try {
			const res = await createTask({ ...newTask }).unwrap()
			setTasks((prevTasks) => [res, ...prevTasks])
		} catch (error) {
			console.error('Failed to create task:', error)
			toast.error('Tạo nhiệm vụ thất bại. Vui lòng thử lại.', { richColors: true })
			return
		}
		setNewTask({
			groupId: newTask.groupId,
			title: '',
			description: ''
		})
		setIsDescriptionVisible(false)
	}
	const handleChangeTitle = (input: string) => {
		setNewTask({ ...newTask, title: input })
	}
	const handleChangeDescription = (input: string) => {
		setNewTask({ ...newTask, description: input })
	}
	const handleUpdateTask = async (taskId: string, update: RequestUpdate) => {
		const oldTask = tasks.find((t) => t._id === taskId)
		if (oldTask?.title === update.title && oldTask?.description === update.description) return
		try {
			const res = await updateTaskInfo({ taskId, updates: update }).unwrap()
			setTasks((prev) => prev.map((task) => (task._id === taskId ? res : task)))
		} catch (error) {
			console.error('Failed to update task:', error)
			toast.error('Cập nhật nhiệm vụ thất bại. Vui lòng thử lại.', { richColors: true })
		}
	}

	const handleDeleteTask = async (taskId: string) => {
		try {
			const res = await deleteTask(taskId).unwrap()
			setTasks((prev) => prev.filter((task) => task._id !== res))
			setIsOpenDeleteModal(false)
			setDeletedTask(null)
		} catch (error) {
			console.error('Failed to delete task:', error)
			toast.error('Xóa nhiệm vụ thất bại. Vui lòng thử lại.', { richColors: true })
		}
	}
	const StatCard = ({
		title,
		value,
		icon: Icon,
		colorClass
	}: {
		title: string
		value: string | number
		icon: React.ElementType
		colorClass: string
	}) => (
		<div className='rounded-xl border border-border bg-card p-4 shadow-sm'>
			<div className='flex items-center gap-3'>
				<div className={`rounded-lg p-2 ${colorClass}`}>
					<Icon className='h-5 w-5' />
				</div>
				<div>
					<p className='text-xs text-muted-foreground'>{title}</p>
					<p className='text-lg font-bold text-foreground'>{value}</p>
				</div>
			</div>
		</div>
	)

	return (
		<div className='h-[calc(100vh-10rem)] space-y-6 bg-work p-6'>
			{/* Stats Grid */}
			<div className='grid grid-cols-2 gap-4'>
				<StatCard
					title='Tiến độ Dự án'
					value={`${totalProgress}%`}
					icon={LayoutDashboard}
					colorClass='bg-primary/10 text-primary'
				/>
				<StatCard
					title='Milestone Hoàn thành'
					value={milestoneStats.completed}
					icon={CheckCircle}
					colorClass='bg-success/10 text-success'
				/>
				<StatCard
					title='Công việc Đang làm'
					value={taskStats.inProgress}
					icon={Zap}
					colorClass='bg-warning/10 text-warning'
				/>
				<StatCard title='Hạn chót Sắp tới' value={nextDueDate} icon={Clock} colorClass='bg-info/10 text-info' />
			</div>

			{/* Progress Overview */}
			<div className='rounded-xl border border-border bg-card p-4'>
				<h4 className='mb-3 font-semibold text-foreground'>Tiến độ Hoàn thành</h4>
				<ProgressBar
					progress={totalProgress}
					status={totalProgress === 100 ? 'Đã Hoàn thành' : 'Đang Tiến hành'}
				/>
				<div className='mt-3 grid grid-cols-2 gap-4 text-sm'>
					<div className='space-y-1'>
						<p className='text-muted-foreground'>Milestones</p>
						<p className='text-success'>{milestoneStats.completed} hoàn thành</p>
						<p className='text-info'>{milestoneStats.pendingReview} chờ duyệt</p>
						<p className='text-destructive'>{milestoneStats.overdue} quá hạn</p>
					</div>
					<div className='space-y-1'>
						<p className='text-muted-foreground'>Subtasks</p>
						<p className='text-success'>{taskStats.done} hoàn thành</p>
						<p className='text-warning'>{taskStats.inProgress} đang làm</p>
						<p className='text-muted-foreground'>{taskStats.todo} chờ xử lý</p>
					</div>
				</div>
			</div>

			{/* Create New Task */}
			<div className='rounded-xl border border-primary/20 bg-card p-4'>
				<h4 className='mb-3 flex items-center gap-2 font-semibold text-foreground'>
					<Plus className='h-5 w-5 text-primary' />
					Tạo Công Việc Mới
				</h4>
				<div className='flex gap-2'>
					<input
						type='text'
						placeholder='Nhập tiêu đề công việc...'
						value={newTask.title}
						onChange={(e) => handleChangeTitle(e.target.value)}
						className='flex-1 rounded-lg border-0 bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
					/>
					<button
						onClick={handleCreateTask}
						disabled={!newTask.title.trim()}
						className='rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50'
					>
						Tạo
					</button>
				</div>
				<div className='mt-2 flex'>
					{isDescriptionVisible ? (
						<input
							type='text'
							placeholder='Nhập mô tả ngắn...'
							value={newTask.description}
							onChange={(e) => handleChangeDescription(e.target.value)}
							className='flex-1 rounded-lg border-0 bg-secondary px-4 py-2.5 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50'
						/>
					) : (
						newTask.title.trim() && (
							<div
								className='flex cursor-pointer items-center justify-center gap-2 px-2 hover:bg-slate-100'
								onClick={() => setIsDescriptionVisible(true)}
							>
								<ArrowRight className='h-4 w-4 text-primary' />
								<span className='text-sm text-foreground'>Thêm mô tả ngắn</span>
							</div>
						)
					)}
				</div>
			</div>

			{/* Tasks List */}
			<div className='space-y-4'>
				<h4 className='font-semibold text-foreground'>Danh sách Công việc</h4>
				{tasks.map((task) => (
					<div key={task._id}>
						<TaskCard
							key={task._id + task.title}
							task={task}
							onUpdateTask={handleUpdateTask}
							onDeleteTask={() => {
								setIsOpenDeleteModal(true)
								setDeletedTask(task)
							}}
							setTasks={setTasks}
						/>
					</div>
				))}
			</div>
			<DeleteModal
				isLoading={isDeleteLoading}
				open={isOpenDeleteModal}
				onOpenChange={setIsOpenDeleteModal}
				onConfirm={() => deletedTask && handleDeleteTask(deletedTask._id)}
				title={deletedTask ? deletedTask.title : ''}
			/>
		</div>
	)
}
