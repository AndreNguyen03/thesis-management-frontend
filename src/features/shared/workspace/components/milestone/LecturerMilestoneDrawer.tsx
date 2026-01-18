import { Clock, FileText, Loader2, Plus, Save, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { SubmissionHistoryList } from './submisstion-history'
import {
	MilestoneStatusOptions,
	type LecturerReviewDecision,
	type PayloadUpdateMilestone,
	type ResponseMilestone,
	type TaskDto
} from '@/models/milestone.model'
import { cn, fromDatetimeLocal, toDatetimeLocal } from '@/lib/utils'
import RichTextEditor from '@/components/common/RichTextEditor'
import { TaskInMilestones } from './tab/TaskInMiletones'
import { formatFileSize } from '@/utils/format-file-size'
import {
	useFacultyDownloadZipByMilestoneIdMutation,
	useReviewMilestoneByLecturerMutation
} from '@/services/milestoneApi'
import { toast } from 'sonner'
import DOMPurify from 'dompurify'
import { useParams } from 'react-router-dom'

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
	const { groupId } = useParams<{ groupId: string }>()
	//gọi endpoint review milestone
	const [reviewMilestoneByLecturer, { isLoading: isLoadingReview }] = useReviewMilestoneByLecturerMutation()
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
	const [newComment, setNewComment] = useState<{
		lecturerFeedback: string
		lecturerDesion: LecturerReviewDecision | undefined
	}>({
		lecturerFeedback: '',
		lecturerDesion: undefined
	})
	// modal hỏi xem có muốn xác nhận rằng đề tài này có thể đi bảo vệ hay không
	const [showAskToGoModal, setShowAskToGoModal] = useState(false)
	const handleReviewMilestone = async () => {
		if (!newComment.lecturerDesion) return

		try {
			const { isAbleToGotoDefense } = await reviewMilestoneByLecturer({
				milestoneId: milestone._id,
				comment: newComment.lecturerFeedback,
				decision: newComment.lecturerDesion,
				groupId: groupId!
			}).unwrap()
			if (isAbleToGotoDefense) {
				setShowAskToGoModal(true)
			}
			// Xử lý thành công (nếu cần)
			toast.success('Đã gửi nhận xét và quyết định thành công.', { richColors: true })
			onClose()
		} catch (error) {
			// Xử lý lỗi (nếu cần)
			console.error('Error reviewing milestone:', error)
			toast.error('Có lỗi xảy ra khi gửi nhận xét và quyết định.', { richColors: true })
		}
	}
	const hasSubmission = !!milestone.submission && milestone.submission.files.length > 0
	const hasComment = milestone.submission?.lecturerDecision !== undefined
	const [isCollapsed, setIsCollapsed] = useState(true)
	//gọi endpoin tải file theo milesttonesid
	const [downloadZipByMilestoneId, { isLoading: isDownloadingMilestone }] =
		useFacultyDownloadZipByMilestoneIdMutation()
	//gọi endpoint cho ra bảo vệ
	const handleDownloadZip = async (id: string, nameTopic?: string) => {
		try {
			let blob
			let nameZip
			nameZip = `${nameTopic} report.zip`
			blob = await downloadZipByMilestoneId({ milestoneId: id }).unwrap()

			if (blob) {
				const url = window.URL.createObjectURL(blob)
				const a = document.createElement('a')
				a.href = url
				a.download = nameZip
				document.body.appendChild(a)
				a.click()
				a.remove()
				window.URL.revokeObjectURL(url)
			} else {
				toast.error('Không nhận được file từ server', { richColors: true })
			}
		} catch (error) {
			console.error('Error downloading zip:', error)
			toast.error('Xảy ra lỗi khi tải xuống', { richColors: true })
		}
	}

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
					Nhận xét và duyệt
					{milestone.status === MilestoneStatusOptions.PENDING_REVIEW && (
						<span className='absolute right-4 top-2 h-2 w-2 rounded-full bg-red-500'></span>
					)}
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
								disabled={!milestone.isAbleEdit}
							/>
						</div>
						<div>
							<label className='mb-1 block text-sm font-medium text-slate-700'>Mô tả</label>
							<div className='w-full'>
								<RichTextEditor
									value={updateInfo.description}
									onChange={(data) => setUpdateInfo({ ...updateInfo, description: data })}
									placeholder='Nhập mô tả chi tiết về đề tài...'
									disabled={!milestone.isAbleEdit}
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
									disabled={!milestone.isAbleEdit}
								/>
							</div>
						</div>
						<button
							onClick={handleSaveSettings}
							disabled={!isChanging || !milestone.isAbleEdit}
							className={cn(
								'flex w-full items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-sm font-medium text-white hover:bg-orange-700',
								(!isChanging || !milestone.isAbleEdit) && 'cursor-not-allowed opacity-50'
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
								<div className='flex flex-col gap-2 rounded-xl border border-blue-100 bg-blue-50 p-4'>
									<h4 className='mb-2 text-xs font-bold uppercase text-blue-600'>Bài nộp mới nhất</h4>
									<div className='flex items-center gap-3 rounded-lg border border-blue-100 bg-white p-3'>
										<FileText className='h-8 w-8 text-blue-500' />
										<div className='flex-1'>
											<p className='text-sm font-medium text-slate-900'>
												{milestone.submission?.files[0].name}
											</p>
											<p className='text-xs text-slate-500'>
												{new Date(milestone.submission?.date!).toLocaleString('vi-VN')} •{' '}
												{formatFileSize(milestone.submission?.files[0].size!)}
											</p>
										</div>
										<button
											className='text-xs font-bold text-blue-600 hover:underline'
											disabled={isDownloadingMilestone}
											onClick={() => handleDownloadZip(milestone._id, milestone.title)}
										>
											{isDownloadingMilestone && (
												<Loader2 className='inline-block h-4 w-4 animate-spin' />
											)}
											Tải xuống
										</button>
									</div>
									{hasComment && milestone.submission && (
										<>
											<div className='ml-5 flex flex-col gap-1 rounded bg-blue-100 p-2 text-sm text-slate-700'>
												<div className='flex gap-2'>
													<span className='text font-medium'>
														{milestone.submission.lecturerInfo.title +
															' ' +
															milestone.submission.lecturerInfo.fullName}
													</span>
													<span
														className={cn(
															'rounded bg-slate-400 px-2 font-medium text-white',
															milestone.submission.lecturerDecision === 'approved'
																? 'bg-green-500'
																: 'bg-red-500'
														)}
													>
														{milestone.submission.lecturerDecision === 'approved'
															? 'Chấp nhận'
															: 'Yêu cầu làm lại'}
													</span>
													<span className='font-sm rounded text-gray-700'>
														{new Date(milestone.submission?.feedbackAt!).toLocaleString(
															'vi-VN'
														)}
													</span>
												</div>
												<span className='text ml-5'>
													<div
														className='prose max-w-none rounded-lg bg-blue-50 px-2 py-1'
														// Sử dụng DOMPurify để đảm bảo an toàn, tránh XSS
														dangerouslySetInnerHTML={{
															__html: DOMPurify.sanitize(
																milestone.submission.lecturerFeedback ||
																	'<p>Chưa có mô tả</p>'
															)
														}}
													/>
												</span>
											</div>
										</>
									)}
									{!hasComment && (
										<>
											<button
												className='mt-2 px-2 py-1 font-semibold text-blue-500 hover:bg-blue-100'
												onClick={() => setIsCollapsed(false)}
											>
												Nhận xét
											</button>
											{!isCollapsed && (
												<div className='mt-4'>
													<RichTextEditor
														value={newComment.lecturerFeedback}
														onChange={(data) =>
															setNewComment({ ...newComment, lecturerFeedback: data })
														}
														placeholder='Nhập nhận xét...'
													/>
													<div className='flex items-center gap-2'>
														<select
															value={newComment.lecturerDesion ?? ''}
															onChange={(e) =>
																setNewComment({
																	...newComment,
																	lecturerDesion:
																		e.target.value === ''
																			? undefined
																			: (e.target.value as LecturerReviewDecision)
																})
															}
															className='mt-2 w-fit rounded border px-2 py-1'
														>
															<option value='' className='bg-gray-200' disabled>
																---Chọn---
															</option>
															<option value='approved'>Duyệt</option>
															<option value='rejected'>Yêu cầu nộp lại</option>
														</select>
														<span className='font-semibold'>(Quyết định cuối cùng)</span>
													</div>
													<button
														disabled={isLoadingReview || !newComment.lecturerDesion}
														className='mt-2 rounded-sm bg-blue-500 px-2 py-1 font-semibold text-white disabled:bg-gray-400'
														onClick={() => handleReviewMilestone()}
													>
														{isLoadingReview ? (
															<Loader2 className='h-4 w-4 animate-spin' />
														) : (
															'Gửi nhận xét'
														)}
													</button>
												</div>
											)}
										</>
									)}
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
