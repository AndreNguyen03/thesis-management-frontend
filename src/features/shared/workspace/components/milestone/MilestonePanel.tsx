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
	GraduationCap,
	PencilOff,
	Goal
} from 'lucide-react'
import { StatusTag } from '../StatusTag'
import { ProgressBar, StatusBadge } from './ProcessBar'
import {
	creatorType,
	milestoneTypeMap,
	type MilestoneStatus,
	type PayloadCreateMilestone,
	type PayloadUpdateMilestone,
	type ResponseMilestone
} from '@/models/milestone.model'
import { StudentMilestoneDrawer } from './StudentMilestoneDrawer'
import { LecturerMilestoneDrawer } from './LecturerMilestoneDrawer'
import { useAppSelector } from '@/store'
import { ROLES, topicStatusLabels } from '@/models'
import CreateMilestone from './modal/CreateMilestone'
import { useCreateMilestoneMutation, useUpdateMilestoneMutation } from '@/services/milestoneApi'
import { toast } from 'sonner'
import { formatDate } from '@/utils/utils'
import { StatusOptions } from '@/models/todolist.model'
import { useGetGroupDetailQuery } from '@/services/groupApi'
import AskToGoToDefense from './modal/AskToGoToDefense'
import { useSetAwaitingEvaluationMutation } from '@/services/topicApi'
import { cn } from '@/lib/utils'
import { useNavigate, useParams } from 'react-router-dom'

interface MilestonePanelProps {
	milestones: ResponseMilestone[]
	totalProgress: number
	setMilestones: React.Dispatch<React.SetStateAction<ResponseMilestone[]>>
}

export const MilestonePanel = ({ milestones, totalProgress, setMilestones }: MilestonePanelProps) => {
	const user = useAppSelector((state) => state.auth)
	const { groupId } = useParams<{ groupId: string }>()
	const [isOpenAskGotoDefense, setIsOpenAskGotoDefense] = useState(false)
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [isShowCreateModal, setIsShowCreateModal] = useState(false)
	const selectedMilestone = useMemo(() => milestones.find((m) => m._id === selectedId), [milestones, selectedId])
	//gọi endpoint cập nhật thông tin milestone
	const [updateMilestone] = useUpdateMilestoneMutation()
	const { data: groupDetail, isLoading: isLoadingGroupDetail } = useGetGroupDetailQuery(
		{ groupId: groupId! },
		{ skip: !groupId }
	)
	const navigate = useNavigate()
	//gọi endpoint chuyển trạng thía của dề tài sang chuẩn bị đánh giá
	const [setAwaitingEvaluation, { isLoading: isTransferAwaiting }] = useSetAwaitingEvaluationMutation()
	const handleUpdateMilestone = async (id: string, updates: PayloadUpdateMilestone) => {
		try {
			await updateMilestone({
				milestoneId: id,
				groupId: groupId!,
				body: updates
			})
			setMilestones((prev) => prev.map((m) => (m._id === id ? { ...m, ...updates } : m)))
			setSelectedId(null)
			toast.success('Cập nhật milestone thành công', { richColors: true })
		} catch (error) {
			console.error('Lỗi cập nhật milestone:', error)
		}
	}
	const [newMilestone, setNewMilestone] = useState<PayloadCreateMilestone>({
		type: 'submission'
	} as PayloadCreateMilestone)
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
			const createdMilestone = await createMilestone({
				...newMilestone,
				groupId: groupId!
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
	const handleGoToDefense = async () => {
		setIsOpenAskGotoDefense(false)
		try {
			await setAwaitingEvaluation({ topicId: groupDetail?.topicId! })
			toast.success('Đề tài đang chờ chấm điểm', { richColors: true })
		} catch (error) {
			toast.error('Lỗi chuyển đề tài sang trạng thái chuẩn bị đánh giá', { richColors: true })
			console.error('Lỗi chuyển đề tài sang trạng thái chuẩn bị đánh giá:', error)
		}
	}
	return (
		<div
			className={`min-h-screen overflow-auto font-sans transition-colors duration-300 ${user.user?.role === ROLES.STUDENT ? 'bg-slate-50' : 'bg-orange-50/30'}`}
		>
			{/* Top Navigation Bar with Role Switcher */}
			<div className='sticky top-0 z-10 flex items-center justify-between border-b bg-white/80 px-6 py-3 shadow-sm backdrop-blur-md'>
				{groupDetail?.isAbleGoToDefense && user.user?.role === ROLES.LECTURER && (
					<div className='flex items-center gap-2'>
						<div>
							<span className='rounded-bl rounded-ss bg-green-600 px-2 py-1 font-semibold text-white'>
								Đủ điều kiện bảo vệ
							</span>
							<span
								className='cursor-pointer rounded-ee bg-yellow-200 px-2 py-1 font-semibold text-gray-500 transition-colors duration-200 hover:bg-yellow-300 hover:text-gray-700'
								onClick={() => {
									console.log('Đóng góp ý kiến')
									setIsOpenAskGotoDefense(true)
								}}
							>
								Xác nhận
							</span>
						</div>
					</div>
				)}
				{groupDetail?.topicStatus && (
					<span
						className={cn(
							'rounded-bl rounded-ss px-2 py-1 font-semibold text-white',
							topicStatusLabels[groupDetail?.topicStatus as keyof typeof topicStatusLabels].css
						)}
					>
						{topicStatusLabels[groupDetail?.topicStatus as keyof typeof topicStatusLabels].name}
					</span>
				)}
				{/* Role Switcher */}
				{renderTab()}
			</div>

			<div className='mx-auto h-[calc(100vh-11rem)] max-w-5xl overflow-auto p-8 pb-20'>
				{/* Dashboard Header */}
				<div className='mb-8 flex flex-col justify-between gap-4 md:items-start'>
					<div>
						<h1 className='text-xl font-bold text-slate-900'>
							{user.user?.role === ROLES.STUDENT ? 'Theo dõi Tiến độ Đồ án' : 'Quản lý Tiến độ Nhóm 01'}
						</h1>
						<p className='font-semibold text-slate-500'>Đề tài: {groupDetail?.topicTitleVN}</p>
						<p className='text-slate-500'>({groupDetail?.topicTitleEng})</p>
					</div>
					<div className='flex gap-2'>
						{user.user?.role === ROLES.LECTURER && (
							<button
								onClick={() => setIsShowCreateModal(true)}
								className='flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800'
							>
								<Plus className='h-4 w-4' /> Tạo Milestone Mới
							</button>
						)}
						<button
							onClick={() => navigate('/detail-topic/' + groupDetail?.topicId)}
							className='flex items-center gap-2 rounded-lg border border-gray-500 bg-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200'
						>
							<Goal className='h-4 w-4' /> Xem chi tiết đề tài
						</button>
					</div>
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
					{milestones.length > 0 && (
						<h2 className='mb-4 flex items-center gap-2 text-lg font-bold text-slate-800'>
							<LayoutDashboard className='h-5 w-5 text-slate-500' />
							Danh sách Milestones
						</h2>
					)}

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
								className={cn(
									`group relative cursor-pointer overflow-hidden rounded-xl border-2 bg-white p-5 transition-all hover:shadow-md ${isSelected ? `border-${themeColor}-600 ring-1 ring-${themeColor}-500` : `border-slate-200 hover:border-${themeColor}-300`} `,
									milestone.creatorType === 'faculty_board' &&
										'rounded-lg border-2 border-dashed border-red-400 p-3'
								)}
							>
								<div className={cn('relative z-20 flex items-start justify-between gap-4')}>
									<div className='flex-1'>
										<div className='mb-1 flex items-center gap-3'>
											<h3
												className={`font-bold text-slate-800 group-hover:text-${themeColor}-600 transition-colors`}
											>
												{milestone.title}
											</h3>
											<StatusBadge status={milestone.status as MilestoneStatus} />

											<span className='rounded border-2 border-blue-500 bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-600'>
												{milestoneTypeMap[milestone.type].label}
											</span>
											<span
												className={cn(
													'rounded px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide',
													creatorType[milestone.creatorType].color
												)}
											>
												{creatorType[milestone.creatorType].label}
											</span>
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
											<>
												{!milestone.isAbleEdit ? (
													<PencilOff className='h-4 w-4 text-slate-500' />
												) : (
													<Edit className='h-4 w-4 text-slate-300 group-hover:text-orange-400' />
												)}
											</>
										)}
									</div>
								</div>

								<div className='relative z-20 mt-2 flex items-center gap-3'>
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

			<AskToGoToDefense
				open={isOpenAskGotoDefense}
				setShowAskToGoModal={setIsOpenAskGotoDefense}
				onGotoDefense={handleGoToDefense}
				isLoading={isTransferAwaiting}
			/>
		</div>
	)
}
