import React, { useMemo, useState } from 'react'
import {
	ChevronRight,
	Download,
	Send,
	XCircle,
	LayoutDashboard,
	Calendar,
	CheckSquare,
	Edit,
	UserCircle,
	Plus,
	BarChart3,
	GraduationCap
} from 'lucide-react'
import { StatusTag } from '../StatusTag'
import { ProgressBar, StatusBadge } from './ProcessBar'
import type {
	MilestoneStatus,
	PayloadCreateMilestone,
	PayloadUpdateMilestone,
	ResponseMilestone
} from '@/models/milestone.model'
import { StudentMilestoneDrawer } from './StudentMilestoneDrawer'
import { LecturerMilestoneDrawer } from './LecturerMilestoneDrawer'
import { useAppSelector } from '@/store'
import { ROLES } from '@/models'
import CreateMilestone from './modal/CreateMilestone'
import { useCreateMilestoneMutation, useUpdateMilestoneMutation } from '@/services/milestoneApi'
import { toast } from 'sonner'
import { formatDate } from '@/utils/utils'
import { StatusOptions } from '@/models/todolist.model'

interface MilestonePanelProps {
	milestones: ResponseMilestone[]
	totalProgress: number
	setMilestones: React.Dispatch<React.SetStateAction<ResponseMilestone[]>>
}

export const MilestonePanel = ({ milestones, totalProgress, setMilestones }: MilestonePanelProps) => {
	const user = useAppSelector((state) => state.auth)
	const group = useAppSelector((state) => state.group)

	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [isShowCreateModal, setIsShowCreateModal] = useState(false)
	const selectedMilestone = useMemo(() => milestones.find((m) => m._id === selectedId), [milestones, selectedId])
	//gọi endpoint cập nhật thông tin milestone
	const [updateMilestone] = useUpdateMilestoneMutation()
	const handleUpdateMilestone = async (id: string, updates: PayloadUpdateMilestone) => {
		try {
			await updateMilestone({
				milestoneId: id,
				groupId: group.activeGroup?._id!,
				body: updates
			})
			setMilestones((prev) => prev.map((m) => (m._id === id ? { ...m, ...updates } : m)))
			setSelectedId(null)
			toast.success('Cập nhật milestone thành công', { richColors: true })
		} catch (error) {
			console.error('Lỗi cập nhật milestone:', error)
		}
	}
	const [newMilestone, setNewMilestone] = useState<PayloadCreateMilestone>({} as PayloadCreateMilestone)
	//gọi endpoint tạo milestone
	const [createMilestone] = useCreateMilestoneMutation()
	const renderTab = () => {
		return (
			<div className='flex items-center gap-3 rounded-full border border-slate-200 bg-slate-100 p-1'>
				{user.user?.role === ROLES.STUDENT ? (
					<button
						className={`flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-indigo-600 shadow-sm transition-all`}
					>
						<GraduationCap className='h-4 w-4' />
						Sinh viên
					</button>
				) : (
					<button
						className={`flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-sm font-medium text-orange-600 shadow-sm transition-all`}
					>
						<UserCircle className='h-4 w-4' />
						Giảng viên
					</button>
				)}
			</div>
		)
	}
	const handleCreateMilestone = async () => {
		try {
			console.log('Gọi nút tạo mới milestone')
			const createdMilestone = await createMilestone({
				...newMilestone,
				groupId: group.activeGroup?._id!
			}).unwrap()
			setMilestones((prev) => [...prev, createdMilestone])
			toast.success('Tạo milestone thành công', { richColors: true })
			setIsShowCreateModal(false)
			setNewMilestone({} as PayloadCreateMilestone)
		} catch (error) {
			toast.error('Lỗi tạo milestone', { richColors: true })
			console.error('Lỗi tạo milestone:', error)
		}
	}
	return (
		<div
			className={`min-h-screen overflow-auto font-sans transition-colors duration-300 ${user.user?.role === ROLES.STUDENT ? 'bg-slate-50' : 'bg-orange-50/30'}`}
		>
			{/* Top Navigation Bar with Role Switcher */}
			<div className='sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 px-6 py-3 shadow-sm backdrop-blur-md'>
				<div className='flex items-center gap-2'>
					<div
						className={`rounded-lg p-2 ${user.user?.role === ROLES.STUDENT ? 'bg-indigo-100 text-indigo-700' : 'bg-orange-100 text-orange-700'}`}
					>
						<LayoutDashboard className='h-5 w-5' />
					</div>
					<span className='hidden font-bold text-slate-800 sm:inline'>Graduation Project LMS</span>
				</div>

				{/* Role Switcher */}
				{renderTab()}
			</div>

			<div className='mx-auto h-[calc(100vh-11rem)] max-w-5xl overflow-auto p-8 pb-20'>
				{/* Dashboard Header */}
				<div className='mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end'>
					<div>
						<h1 className='text-2xl font-bold text-slate-900'>
							{user.user?.role === ROLES.STUDENT ? 'Theo dõi Tiến độ Đồ án' : 'Quản lý Tiến độ Nhóm 01'}
						</h1>
						<p className='text-slate-500'>Đề tài: Hệ thống E-learning System</p>
					</div>
					{user.user?.role === ROLES.LECTURER && (
						<button
							onClick={() => setIsShowCreateModal(true)}
							className='flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800'
						>
							<Plus className='h-4 w-4' /> Tạo Milestone Mới
						</button>
					)}
				</div>

				{/* Overview Card */}
				<div
					className={`mb-8 overflow-hidden rounded-2xl p-6 text-white shadow-lg transition-colors duration-500 ${user.user?.role === ROLES.STUDENT ? 'bg-gradient-to-br from-indigo-600 to-violet-700' : 'bg-gradient-to-br from-orange-500 to-red-600'}`}
				>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-4'>
							<div className='rounded-xl bg-white/20 p-3 backdrop-blur-md'>
								<BarChart3 className='h-6 w-6 text-white' />
							</div>
							<div>
								<h3 className='text-lg font-bold'>Tổng quan dự án</h3>
								<p className='text-sm text-white/80'>
									{user.user?.role === ROLES.STUDENT
										? 'Nỗ lực của bạn'
										: 'Tiến độ hoàn thành của nhóm'}
								</p>
							</div>
						</div>
						<div className='text-right'>
							<span className='text-4xl font-bold tracking-tight'>{totalProgress}%</span>
						</div>
					</div>
					<div className='mt-6'>
						<div className='h-2 w-full overflow-hidden rounded-full bg-black/20'>
							<div
								className='h-full bg-white transition-all duration-1000 ease-out'
								style={{ width: `${totalProgress}%` }}
							/>
						</div>
					</div>
				</div>

				{/* Milestones List */}
				<div className='space-y-4'>
					<h2 className='mb-4 flex items-center gap-2 text-lg font-bold text-slate-800'>
						<LayoutDashboard className='h-5 w-5 text-slate-500' />
						Danh sách Milestones
					</h2>

					{milestones.map((milestone) => {
						const mProgress = milestone.progress
						//calculateProgress(milestone.requirements)
						const isSelected = selectedId === milestone._id
						const themeColor = user.user?.role === ROLES.STUDENT ? 'indigo' : 'orange'
						const tasksNumber = milestone.tasks?.length || 0
						const tasksCompleted =
							milestone.tasks?.filter((t) => t.status === StatusOptions.DONE && !t.isDeleted).length || 0
						return (
							<div
								key={milestone._id}
								onClick={() => setSelectedId(milestone._id)}
								className={`group relative cursor-pointer overflow-hidden rounded-xl border bg-white p-5 transition-all hover:shadow-md ${isSelected ? `border-${themeColor}-500 ring-1 ring-${themeColor}-500` : `border-slate-200 hover:border-${themeColor}-300`} `}
							>
								<div className='flex items-start justify-between gap-4'>
									<div className='flex-1'>
										<div className='mb-1 flex items-center gap-3'>
											<h3
												className={`font-bold text-slate-800 group-hover:text-${themeColor}-600 transition-colors`}
											>
												{milestone.title}
											</h3>
											<StatusBadge status={milestone.status as MilestoneStatus} />
											{milestone.type === 'STRICT' && (
												<span className='rounded border-2 border-red-500 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600'>
													Quan trọng
												</span>
											)}
										</div>
										<div className='mb-3 flex items-center gap-4 text-sm text-slate-500'>
											<span className='flex items-center gap-1.5'>
												<Calendar className='h-3.5 w-3.5' /> {formatDate(milestone.dueDate)}
											</span>
											{milestone.tasks?.length ? (
												<span className='flex items-center gap-1.5'>
													<CheckSquare className='h-3.5 w-3.5' /> {tasksCompleted}/
													{tasksNumber} đầu việc
												</span>
											) : (
												<span className='flex items-center gap-1.5'>
													<CheckSquare className='h-3.5 w-3.5' />
													{tasksNumber} đầu việc
												</span>
											)}
										</div>
									</div>
									<div className='hidden sm:block'>
										{user.user?.role === ROLES.STUDENT ? (
											<ChevronRight className='h-5 w-5 text-slate-300 group-hover:text-indigo-400' />
										) : (
											<Edit className='h-4 w-4 text-slate-300 group-hover:text-orange-400' />
										)}
									</div>
								</div>

								<div className='mt-2 flex items-center gap-3'>
									<ProgressBar progress={mProgress} className='h-1.5' />
									<span className='w-8 text-right text-xs font-bold text-slate-600'>
										{mProgress}%
									</span>
								</div>
							</div>
						)
					})}
				</div>
				{user.user?.role === ROLES.LECTURER && isShowCreateModal && (
					<CreateMilestone
						open={isShowCreateModal}
						setShowCreateModal={setIsShowCreateModal}
						onCreateMilestone={handleCreateMilestone}
						newMilestone={newMilestone}
						setNewMilestone={setNewMilestone}
					/>
				)}
			</div>

			{/* Conditional Drawer Rendering */}
			{selectedMilestone && (
				<>
					<div
						className='fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-sm transition-opacity'
						onClick={() => setSelectedId(null)}
					/>
					{user.user?.role === ROLES.STUDENT ? (
						<StudentMilestoneDrawer
							milestone={selectedMilestone}
							onClose={() => setSelectedId(null)}
							onUpdate={handleUpdateMilestone}
						/>
					) : (
						<LecturerMilestoneDrawer
							milestone={selectedMilestone}
							onClose={() => setSelectedId(null)}
							onUpdate={handleUpdateMilestone}
						/>
					)}
				</>
			)}
		</div>
	)
}
