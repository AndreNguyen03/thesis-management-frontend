import { Clock, FileText, Plus, Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SubmissionHistoryList } from './submisstion-history'
import type { PayloadUpdateMilestone, ResponseMilestone, TaskDto } from '@/models/milestone.model'
import { cn, fromDatetimeLocal, toDatetimeLocal } from '@/lib/utils'
import RichTextEditor from '@/components/common/RichTextEditor'
import { TaskInMilestones } from './tab/TaskInMiletones'

export const LecturerMilestoneDrawer = ({
	milestone,
	onClose,
	onUpdate
}: {
	milestone: ResponseMilestone
	onClose: () => void
	onUpdate: (id: string, updates: PayloadUpdateMilestone) => void
}) => {
	const [activeTab, setActiveTab] = useState<'settings' | 'grading' | 'tasks'>('settings')
	const [updateInfo, setUpdateInfo] = useState<PayloadUpdateMilestone>({
		title: milestone.title,
		dueDate: toDatetimeLocal(milestone.dueDate),
		description: milestone.description
	})
	const isChanging = useMemo(() => {
		return (
			updateInfo.title !== milestone.title ||
			updateInfo.description !== milestone.description ||
			updateInfo.dueDate !== toDatetimeLocal(milestone.dueDate)
		)
	}, [updateInfo, milestone])
	const handleSaveSettings = () => {
		// Khi lưu, convert về UTC ISO string nếu cần gửi lên server
		const payload: PayloadUpdateMilestone = {
			...updateInfo,
			dueDate: fromDatetimeLocal(updateInfo.dueDate)
		}
		onUpdate(milestone._id, payload)
	}

	const hasSubmission = !!milestone.submission

	return (
		<div className='fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl'>
			<div className='flex h-16 shrink-0 items-center justify-between border-b bg-orange-50 px-6'>
				<div>
					<span className='text-xs font-bold uppercase text-orange-600'> Giảng viên</span>
					<h2 className='text-lg font-bold text-slate-800'>Quản lý Milestone</h2>
				</div>
				<button onClick={onClose}>
					<X className='h-5 w-5 text-slate-400 hover:text-slate-600' />
				</button>
			</div>

			{/* Tabs */}
			<div className='flex shrink-0 border-b border-slate-200'>
				<button
					onClick={() => setActiveTab('settings')}
					className={`flex-1 py-3 text-sm font-medium ${activeTab === 'settings' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
				>
					Thông tin
				</button>
				<button
					onClick={() => setActiveTab('tasks')}
					className={`relative flex-1 py-3 text-sm font-medium ${activeTab === 'tasks' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
				>
					Đầu việc
				</button>
				<button
					onClick={() => setActiveTab('grading')}
					className={`relative flex-1 py-3 text-sm font-medium ${activeTab === 'grading' ? 'border-b-2 border-orange-600 text-orange-600' : 'text-slate-500 hover:bg-slate-50'}`}
				>
					Chấm điểm & Duyệt
					<span className='absolute right-4 top-2 h-2 w-2 rounded-full bg-red-500'></span>
				</button>
			</div>

			<div className='flex-1 overflow-y-auto p-6'>
				{activeTab === 'settings' ? (
					<div className='space-y-6'>
						<div>
							<label className='mb-1 block text-sm font-medium text-slate-700'>Tiêu đề Milestone</label>
							<input
								type='text'
								value={updateInfo.title}
								onChange={(e) => setUpdateInfo({ ...updateInfo, title: e.target.value })}
								required
								className='mt-1 w-full rounded-lg border px-3 py-2'
								placeholder='Nhập tiêu đề...'
							/>
						</div>
						<div>
							<label className='mb-1 block text-sm font-medium text-slate-700'>Mô tả</label>
							<div className='w-full'>
								<RichTextEditor
									value={updateInfo.description}
									onChange={(data) => setUpdateInfo({ ...updateInfo, description: data })}
									placeholder='Nhập mô tả chi tiết về đề tài...'
								/>
							</div>
						</div>
						<div>
							<label className='mb-1 block text-sm font-medium text-slate-700'>Hạn chót</label>
							<div className='relative'>
								<input
									type='datetime-local'
									value={updateInfo.dueDate}
									min={toDatetimeLocal(new Date().toISOString())}
									onChange={(e) => setUpdateInfo({ ...updateInfo, dueDate: e.target.value })}
									required
									className='mt-1 w-full rounded-lg border px-3 py-2'
								/>
							</div>
						</div>
						<button
							onClick={handleSaveSettings}
							disabled={!isChanging}
							className={cn(
								'flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white hover:bg-orange-700',
								!isChanging && 'cursor-not-allowed opacity-50'
							)}
						>
							<Save className='h-4 w-4' /> Lưu Cài đặt
						</button>
					</div>
				) : activeTab === 'tasks' ? (
					<TaskInMilestones milestoneId={milestone._id} tasks={milestone.tasks} />
				) : (
					<div className='space-y-6'>
						{!hasSubmission ? (
							<div className='rounded-xl border border-slate-200 bg-slate-50 p-8 text-center'>
								<Clock className='mx-auto mb-3 h-10 w-10 text-slate-300' />
								<p className='text-slate-500'>Sinh viên chưa nộp bài cho giai đoạn này.</p>
							</div>
						) : (
							<>
								<div className='rounded-xl border border-blue-100 bg-blue-50 p-4'>
									<h4 className='mb-2 text-xs font-bold uppercase text-blue-600'>Bài nộp mới nhất</h4>
									<div className='flex items-center gap-3 rounded-lg border border-blue-100 bg-white p-3'>
										<FileText className='h-8 w-8 text-blue-500' />
										<div className='flex-1'>
											<p className='text-sm font-medium text-slate-900'>
												{milestone.submission?.files[0].name}
											</p>
											<p className='text-xs text-slate-500'>
												{milestone.submission?.date} • {milestone.submission?.files[0].size}
											</p>
										</div>
										<button className='text-xs font-bold text-blue-600 hover:underline'>
											Tải xuống
										</button>
									</div>

									{/* Show History for Lecturer too */}
									<SubmissionHistoryList history={milestone.submissionHistory} />
								</div>
							</>
						)}
					</div>
				)}
			</div>
		</div>
	)
}
