import React, { useState } from 'react'
import { ChevronRight, Download, Send, XCircle, LayoutDashboard } from 'lucide-react'
import { StatusTag } from './StatusTag'
import { ProgressBar } from './ProgressBar'
import { cn } from '@/lib/utils'

interface Milestone {
	id: number
	title: string
	dueDate: string
	progress: number
	status: string
	submission?: {
		date: string
		files: { name: string; size: string }[]
		score: number | null
		feedback: string
	} | null
}

interface MilestonePanelProps {
	milestones: Milestone[]
	totalProgress: number
	updateMilestone: (id: number, progress: number, status: string, score?: number, feedback?: string) => void
}

export const MilestonePanel = ({ milestones, totalProgress, updateMilestone }: MilestonePanelProps) => {
	const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null)

	return (
		<div className='h-[calc(100vh-10rem)] overflow-y-auto bg-work p-6'>
			{/* Project Overview */}
			<div className='mb-6 rounded-xl border border-primary/20 bg-accent p-5'>
				<div className='mb-4 flex items-center gap-3'>
					<div className='rounded-lg bg-primary/10 p-2'>
						<LayoutDashboard className='h-5 w-5 text-primary' />
					</div>
					<div>
						<h3 className='font-bold text-foreground'>Tổng quan Dự án Nhóm</h3>
						<p className='text-sm text-muted-foreground'>Tiến độ chung</p>
					</div>
					<span className='ml-auto text-2xl font-bold text-primary'>{totalProgress}%</span>
				</div>
				<ProgressBar
					progress={totalProgress}
					status={totalProgress === 100 ? 'Đã Hoàn thành' : 'Đang Tiến hành'}
				/>
			</div>

			{/* Milestones List */}
			<h3 className='mb-4 text-lg font-bold text-foreground'>Các Milestone chi tiết</h3>
			<div className='space-y-3'>
				{milestones.map((milestone) => (
					<div
						key={milestone.id}
						className='milestone-card flex items-center gap-4'
						onClick={() => setSelectedMilestone(milestone)}
					>
						<div className='min-w-0 flex-1'>
							<p className='truncate font-semibold text-foreground'>{milestone.title}</p>
							<p className='mt-1 text-sm text-muted-foreground'>
								Hạn chót: <span className='font-medium'>{milestone.dueDate}</span>
							</p>
							<div className='mt-2'>
								<ProgressBar progress={milestone.progress} status={milestone.status} size='sm' />
							</div>
						</div>
						<StatusTag status={milestone.status} />
						<ChevronRight className='h-5 w-5 shrink-0 text-muted-foreground' />
					</div>
				))}
			</div>

			{/* Milestone Detail Drawer */}
			{selectedMilestone && (
				<>
					<div className='fixed inset-0 z-40 bg-foreground/20' onClick={() => setSelectedMilestone(null)} />
					<MilestoneDetail
						milestone={selectedMilestone}
						onClose={() => setSelectedMilestone(null)}
						updateMilestone={updateMilestone}
					/>
				</>
			)}
		</div>
	)
}

interface MilestoneDetailProps {
	milestone: Milestone
	onClose: () => void
	updateMilestone: (id: number, progress: number, status: string, score?: number, feedback?: string) => void
}

const MilestoneDetail = ({ milestone, onClose, updateMilestone }: MilestoneDetailProps) => {
	const [score, setScore] = useState(milestone.submission?.score?.toString() || '')
	const [feedback, setFeedback] = useState(milestone.submission?.feedback || '')
	const [progress, setProgress] = useState(milestone.progress.toString())

	const handleSaveEvaluation = () => {
		const finalScore = score !== '' ? parseFloat(score) : undefined
		let newStatus = milestone.status
		if (finalScore !== undefined) {
			newStatus = 'Đã Hoàn thành'
		}
		updateMilestone(milestone.id, milestone.progress, newStatus, finalScore, feedback)
		onClose()
	}

	const handleUpdateProgress = () => {
		const newProgress = parseInt(progress, 10)
		let statusToUpdate = milestone.status

		if (newProgress === 100 && statusToUpdate !== 'Đã Hoàn thành') {
			statusToUpdate = 'Đang Chờ Duyệt'
		} else if (newProgress < 100 && newProgress > 0) {
			statusToUpdate = 'Đang Tiến hành'
		}

		updateMilestone(milestone.id, newProgress, statusToUpdate)
		onClose()
	}

	return (
		<div className='fixed right-0 top-0 z-50 h-full w-full max-w-md animate-slide-in-right overflow-y-auto border-l border-border bg-card shadow-2xl'>
			<div className='p-6'>
				<div className='mb-6 flex items-start justify-between'>
					<h2 className='text-xl font-bold text-foreground'>{milestone.title}</h2>
					<button onClick={onClose} className='rounded-lg p-1 transition-colors hover:bg-secondary'>
						<XCircle className='h-6 w-6 text-muted-foreground' />
					</button>
				</div>

				{/* Info Card */}
				<div className='mb-6 space-y-3 rounded-xl bg-secondary p-4'>
					<div className='flex justify-between text-sm'>
						<span className='text-muted-foreground'>Ngày Hết hạn:</span>
						<span className='font-medium text-foreground'>{milestone.dueDate}</span>
					</div>
					<div className='flex justify-between text-sm'>
						<span className='text-muted-foreground'>Tiến độ:</span>
						<span className='font-semibold text-primary'>{milestone.progress}%</span>
					</div>
					<StatusTag status={milestone.status} />
					<ProgressBar progress={milestone.progress} status={milestone.status} />
				</div>

				{/* Submission Files */}
				{milestone.submission && (
					<div className='mb-6'>
						<h4 className='mb-3 font-semibold text-foreground'>Tài liệu đã nộp</h4>
						<p className='mb-3 text-sm text-muted-foreground'>Ngày nộp: {milestone.submission.date}</p>
						<div className='space-y-2'>
							{milestone.submission.files.map((file, index) => (
								<div
									key={index}
									className='flex items-center justify-between rounded-lg bg-secondary p-3'
								>
									<span className='truncate text-sm font-medium text-foreground'>{file.name}</span>
									<div className='flex items-center gap-2'>
										<span className='text-xs text-muted-foreground'>{file.size}</span>
										<button className='rounded-lg bg-primary/10 p-1.5 text-primary transition-colors hover:bg-primary/20'>
											<Download className='h-4 w-4' />
										</button>
									</div>
								</div>
							))}
						</div>

						{/* Evaluation Form */}
						<div className='mt-4 space-y-4'>
							<div>
								<label className='text-sm font-medium text-foreground'>Điểm số (0-10)</label>
								<input
									type='number'
									value={score}
									onChange={(e) => setScore(e.target.value)}
									min='0'
									max='10'
									placeholder='Nhập điểm'
									className='mt-1 w-full rounded-lg border border-border bg-secondary px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50'
								/>
							</div>
							<div>
								<label className='text-sm font-medium text-foreground'>Phản hồi</label>
								<textarea
									rows={3}
									value={feedback}
									onChange={(e) => setFeedback(e.target.value)}
									placeholder='Viết nhận xét...'
									className='mt-1 w-full resize-none rounded-lg border border-border bg-secondary px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-primary/50'
								/>
							</div>
							<button
								onClick={handleSaveEvaluation}
								className='flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 font-medium text-primary-foreground transition-colors hover:bg-primary/90'
							>
								<Send className='h-4 w-4' />
								Lưu Đánh giá
							</button>
						</div>
					</div>
				)}

				{/* Student Progress Update */}
				<div className='rounded-xl border border-info/20 bg-info/10 p-4'>
					<h4 className='mb-3 font-semibold text-info'>Cập nhật Tiến độ</h4>
					<div className='mb-4'>
						<label className='text-sm text-foreground'>Phần trăm hoàn thành:</label>
						<div className='mt-2 flex items-center gap-3'>
							<input
								type='range'
								min='0'
								max='100'
								step='5'
								value={progress}
								onChange={(e) => setProgress(e.target.value)}
								className='flex-1 accent-primary'
							/>
							<div className='flex min-w-[60px] items-center gap-1'>
								<input
									type='number'
									min='0'
									max='100'
									value={progress}
									onChange={(e) => setProgress(e.target.value)}
									className='w-12 rounded border border-border bg-card px-2 py-1 text-center'
								/>
								<span className='text-foreground'>%</span>
							</div>
						</div>
					</div>
					<button
						onClick={handleUpdateProgress}
						className='w-full rounded-lg bg-info px-4 py-2.5 font-medium text-info-foreground transition-colors hover:bg-info/90'
					>
						Lưu Thay đổi
					</button>
				</div>
			</div>
		</div>
	)
}
