import React, { useMemo, useState } from 'react'
import { ChevronRight, LayoutDashboard, Calendar, CheckSquare, Edit, Plus, PencilOff } from 'lucide-react'
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
import { ROLES, TopicStatus, topicStatusLabels } from '@/models'
import CreateMilestone from './modal/CreateMilestone'
import { useCreateMilestoneMutation, useUpdateMilestoneMutation } from '@/services/milestoneApi'
import { toast } from 'sonner'
import { formatDate } from '@/utils/utils'
import { useGetGroupDetailQuery } from '@/services/groupApi'
import AskToGoToDefense from './modal/AskToGoToDefense'
import { useSetAwaitingEvaluationMutation } from '@/services/topicApi'
import { cn } from '@/lib/utils'
import { useNavigate, useParams } from 'react-router-dom'
import { MilestonePanelSkeleton } from './skeleton/MilestonePanelSkeleton'

interface MilestonePanelProps {
	milestones: ResponseMilestone[]
	setMilestones: React.Dispatch<React.SetStateAction<ResponseMilestone[]>>
}

export const MilestonePanel = ({ milestones, setMilestones }: MilestonePanelProps) => {
	const { groupId } = useParams<{ groupId: string }>()
	const user = useAppSelector((state) => state.auth)
	const group = useAppSelector((state) => state.group)
	const [isOpenAskGotoDefense, setIsOpenAskGotoDefense] = useState(false)
	const [selectedId, setSelectedId] = useState<string | null>(null)
	const [isShowCreateModal, setIsShowCreateModal] = useState(false)
	const selectedMilestone = useMemo(() => milestones.find((m) => m._id === selectedId), [milestones, selectedId])
	//gọi endpoint cập nhật thông tin milestone
	const [updateMilestone] = useUpdateMilestoneMutation()
	const { data: groupDetail, isLoading: isLoadingGroupDetail } = useGetGroupDetailQuery(
		{ groupId: groupId ?? '' },
		{ skip: !groupId }
	)
	const navigate = useNavigate()
	//gọi endpoint chuyển trạng thía của dề tài sang chuẩn bị đánh giá
	const [setAwaitingEvaluation, { isLoading: isTransferAwaiting }] = useSetAwaitingEvaluationMutation()
	const handleUpdateMilestone = async (id: string, updates: PayloadUpdateMilestone) => {
		try {
			await updateMilestone({
				milestoneId: id,
				groupId: group.activeGroup!._id!,
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

	const handleCreateMilestone = async () => {
		try {
			const createdMilestone = await createMilestone({
				...newMilestone,
				groupId: group.activeGroup!._id!
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
			await setAwaitingEvaluation({ topicId: groupDetail!.topicId! })
			toast.success('Đề tài đang chờ chấm điểm', { richColors: true })
		} catch (error) {
			toast.error('Lỗi chuyển đề tài sang trạng thái chuẩn bị đánh giá', { richColors: true })
			console.error('Lỗi chuyển đề tài sang trạng thái chuẩn bị đánh giá:', error)
		}
	}

	if (isLoadingGroupDetail) {
		return <MilestonePanelSkeleton />
	}

	return (
		<div
			className={`min-h-screen overflow-auto font-sans transition-colors duration-300 ${user.user?.role === ROLES.STUDENT ? 'bg-slate-50' : 'bg-orange-50/30'}`}
		>
			<div className='mx-auto h-[calc(100vh-4rem)] max-w-5xl overflow-auto p-8 pb-20'>
				<div className='mb-10'>
					<div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
						{/* LEFT – Topic Info */}
						<div className='space-y-4'>
							{/* Topic Title */}
							<div className='space-y-1'>
								<div className='flex items-center gap-3'>
									<span className='text-xs font-semibold uppercase tracking-wide text-slate-400'>
										Đề tài
									</span>
									{groupDetail?.topicStatus && (
										<span
											className={cn(
												'rounded px-2 py-0.5 text-xs font-semibold text-white',
												topicStatusLabels[groupDetail.topicStatus as TopicStatus].css
											)}
										>
											{topicStatusLabels[groupDetail.topicStatus as TopicStatus].name}
										</span>
									)}

									{groupDetail?.isAbleGoToDefense && user.user?.role === ROLES.LECTURER && (
										<div className='flex items-center overflow-hidden rounded'>
											<span className='bg-green-600 px-2 py-0.5 text-xs font-semibold text-white'>
												Đủ điều kiện bảo vệ
											</span>
											<span
												className='cursor-pointer bg-yellow-200 px-2 py-0.5 text-xs font-semibold text-gray-700 hover:bg-yellow-300'
												onClick={() => setIsOpenAskGotoDefense(true)}
											>
												Xác nhận
											</span>
										</div>
									)}
								</div>

								<p
									className='cursor-pointer text-2xl font-bold leading-tight text-slate-900 hover:underline'
									onClick={() => navigate('/detail-topic/' + groupDetail?.topicId)}
								>
									{groupDetail?.topicTitleVN}
								</p>

								<p className='max-w-3xl text-sm italic text-slate-500'>{groupDetail?.topicTitleEng}</p>
							</div>
						</div>

						{/* RIGHT – Action */}
						{user.user?.role === ROLES.LECTURER && (
							<button
								onClick={() => setIsShowCreateModal(true)}
								className='mt-1 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800'
							>
								<Plus className='h-4 w-4' />
								Tạo milestone
							</button>
						)}
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
						const tasksNumber = milestone.totalTasks
						const tasksCompleted = milestone.tasksCompleted
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
										{mProgress.toFixed(2)}%
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
