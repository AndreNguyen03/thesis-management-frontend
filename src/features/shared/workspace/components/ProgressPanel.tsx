import  { useState, useMemo, useEffect } from 'react'
import { Plus, CheckCircle, Clock, Zap, LayoutDashboard } from 'lucide-react'
import { ProgressBar } from './ProgressBar'
import type { CreateTaskPayload, Task } from '@/models/todolist.model'
import {
	useCreateTaskMutation,
	useDeleteTaskMutation,
	useGetStaskQuery,
	// useUpdateTaskInfoMutation
} from '@/services/todolistApi'
import { toast } from 'sonner'
import TaskCard from './TaskCard'
import { DeleteModal } from './modal/DeleteModal'
import { MilestoneStatusOptions, type ResponseMilestone } from '@/models/milestone.model'
import { formatDate } from '@/utils/utils'
import { MilestoneSelector } from './MilestoneSelector'
import { useParams } from 'react-router-dom'
import { Stat } from './milestone/component/Stat'

interface ProgressPanelProps {
	milestones: ResponseMilestone[]
	totalProgress: number
    refetchMilestones: () => void
}

export const ProgressPanel = ({ milestones, totalProgress, refetchMilestones }: ProgressPanelProps) => {
	const { groupId } = useParams()

	/* ================= DATA ================= */
	const [tasks, setTasks] = useState<Task[]>([])
	const { data: tasksData = [], isLoading } = useGetStaskQuery({ groupId: groupId ?? '' }, { skip: !groupId })

	useEffect(() => {
		setTasks(tasksData)
	}, [tasksData])
	/* ================= UI STATE ================= */

	const [openCreateModal, setOpenCreateModal] = useState(false)
	const [openDeleteModal, setOpenDeleteModal] = useState(false)
	const [deletedTask, setDeletedTask] = useState<Task | null>(null)

	const [newTask, setNewTask] = useState<CreateTaskPayload>({
		groupId: groupId ?? '',
		title: '',
		description: '',
		milestoneId: undefined
	})

	/* ================= MUTATIONS ================= */

	const [createTask] = useCreateTaskMutation()
	const [deleteTask, { isLoading: isDeleteLoading }] = useDeleteTaskMutation()
	// const [updateTaskInfo, { isLoading: isUpdatingTaskInfo }] = useUpdateTaskInfoMutation()

	/* ================= STATS ================= */

	const milestoneStats = useMemo(() => {
		const stats = { completed: 0, inProgress: 0, overdue: 0 }
		milestones.forEach((m) => {
			if (m.status === MilestoneStatusOptions.COMPLETED) stats.completed++
			if (m.status === MilestoneStatusOptions.IN_PROGRESS) stats.inProgress++
			if (m.status === MilestoneStatusOptions.OVERDUE) stats.overdue++
		})
		return stats
	}, [milestones])

	const taskStats = useMemo(() => {
		const stats = { todo: 0, inProgress: 0, done: 0, total: 0 }

		tasksData.forEach((task) => {
			task.columns.forEach((col) => {
				stats.total += col.items.length
				if (col.title === 'Todo') stats.todo += col.items.length
				if (col.title === 'In Progress') stats.inProgress += col.items.length
				if (col.title === 'Done') stats.done += col.items.length
			})
		})

		return stats
	}, [tasksData])

	const nextDueDate = useMemo(() => {
		const upcoming = milestones
			.filter((m) => m.status !== MilestoneStatusOptions.COMPLETED && m.status !== MilestoneStatusOptions.OVERDUE)
			.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())

		return upcoming[0]?.dueDate ?? '—'
	}, [milestones])

	/* ================= HANDLERS ================= */

	const handleCreateTask = async () => {
		if (!newTask.title.trim()) return

		try {
			await createTask(newTask).unwrap()
			setNewTask({
				groupId: newTask.groupId,
				title: '',
				description: '',
				milestoneId: undefined
			})
            refetchMilestones()
			setOpenCreateModal(false)
			toast.success('Đã tạo công việc', { richColors: true })
		} catch {
			toast.error('Tạo công việc thất bại', { richColors: true })
		}
	}

	const handleDeleteTask = async () => {
		if (!deletedTask || !groupId) return

		try {
			await deleteTask({
				taskId: deletedTask._id,
				groupId
			}).unwrap()

			setOpenDeleteModal(false)
			setDeletedTask(null)
                refetchMilestones()
			toast.success('Đã xoá công việc', { richColors: true })
		} catch {
			toast.error('Xóa thất bại', { richColors: true })
		}
	}

	/* ================= UI ================= */

	return (
		<div className='min-h-screen space-y-10 bg-work px-6 py-6'>
			{/* ================= OVERVIEW ================= */}
			<section className='space-y-4'>
				<h3 className='text-lg font-semibold'>Tổng quan tiến độ</h3>

				<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
    
					<div className='grid grid-cols-2 gap-4 lg:col-span-2'>
						<Stat title='Tiến độ dự án' value={`${totalProgress}%`} icon={LayoutDashboard} variant='info' />
						<Stat
							title='Milestone hoàn thành'
							value={milestoneStats.completed}
							icon={CheckCircle}
							variant='success'
						/>
						<Stat title='Công việc đang làm' value={taskStats.inProgress} icon={Zap} variant='warning' />
						<Stat title='Hạn chót sắp tới' value={formatDate(nextDueDate)} icon={Clock} variant='danger' />
					</div>
				</div>
			</section>

			{/* ================= TASK LIST ================= */}
			<section className='space-y-4 pb-24'>
				<div className='flex items-center justify-between'>
					<h4 className='text-lg font-semibold'>Danh sách công việc – {tasksData.length} công việc</h4>

					<button
						onClick={() => setOpenCreateModal(true)}
						className='flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm text-white'
					>
						<Plus className='h-4 w-4' />
						Tạo công việc
					</button>
				</div>

				{isLoading ? (
					<div className='rounded-lg border bg-card p-6 text-center text-sm'>Đang tải…</div>
				) : tasks.length ? (
					tasks.map((task) => (
						<TaskCard
							key={task._id}
							task={task}
                            setTasks={setTasks}
							onDeleteTask={() => {
								setDeletedTask(task)
								setOpenDeleteModal(true)
							}}
							milestones={milestones}
                            refetchMilestones={refetchMilestones}
						/>
					))
				) : (
					<div className='rounded-lg border bg-card p-6 text-center text-sm'>Chưa có công việc nào</div>
				)}
			</section>

			{/* ================= CREATE MODAL ================= */}
			{openCreateModal && (
				<div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40'>
					<div className='w-full max-w-md rounded-xl bg-card p-5'>
						<h4 className='mb-4 font-semibold'>Tạo công việc mới</h4>

						<MilestoneSelector
							milestones={milestones}
							selectedMilestoneId={newTask.milestoneId}
							onSelect={(milestoneId) => setNewTask((prev) => ({ ...prev, milestoneId }))}
						/>

						<input
							value={newTask.title}
							onChange={(e) => setNewTask((prev) => ({ ...prev, title: e.target.value }))}
							placeholder='Tiêu đề công việc'
							className='mt-3 w-full rounded-lg bg-secondary px-4 py-2'
						/>

						<textarea
							value={newTask.description}
							onChange={(e) => setNewTask((prev) => ({ ...prev, description: e.target.value }))}
							placeholder='Mô tả (tuỳ chọn)'
							className='mt-2 w-full rounded-lg bg-secondary px-4 py-2'
						/>

						<div className='mt-4 flex justify-end gap-2'>
							<button onClick={() => setOpenCreateModal(false)} className='rounded-lg px-4 py-2 text-sm'>
								Huỷ
							</button>
							<button
								onClick={handleCreateTask}
								disabled={!newTask.title.trim()}
								className='rounded-lg bg-primary px-4 py-2 text-sm text-white disabled:opacity-50'
							>
								Tạo
							</button>
						</div>
					</div>
				</div>
			)}

			<DeleteModal
				open={openDeleteModal}
				isLoading={isDeleteLoading}
				onOpenChange={setOpenDeleteModal}
				onConfirm={handleDeleteTask}
				title={deletedTask?.title ?? ''}
			/>
		</div>
	)
}
