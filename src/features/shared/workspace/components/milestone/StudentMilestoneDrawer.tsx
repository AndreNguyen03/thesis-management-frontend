import type { FileInfo, MilestoneStatus, PayloadUpdateMilestone, ResponseMilestone } from '@/models/milestone.model'
// Lấy base url download file từ biến môi trường
const baseDownloadUrl = import.meta.env.VITE_MINIO_DOWNLOAD_URL_BASE
import { useMemo, useState, useRef } from 'react'
import { calculateProgress, ProgressBar, StatusBadge } from './ProcessBar'
import { AlertCircle, CheckCircle2, CheckSquare, FileText, Send, UploadCloud, X, Upload } from 'lucide-react'
import { SubmissionHistoryList } from './submisstion-history'
import { useSubmitReportMutation } from '@/services/milestoneApi'
import { StatusOptions } from '@/models/todolist.model'
import { useToast } from '@/hooks/use-toast'
import Editting from '../Editting'
import { cn } from '@/lib/utils'
import { toast as sonnerToast } from 'sonner'
import DOMPurify from 'dompurify'

export const StudentMilestoneDrawer = ({
	milestone,
	onClose,
	onUpdate
}: {
	milestone: ResponseMilestone
	onClose: () => void
	onUpdate: (id: string, updates: PayloadUpdateMilestone) => void
}) => {
	const { toast } = useToast()
	const fileInputRef = useRef<HTMLInputElement>(null)
	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [isSubmitting, setIsSubmitting] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const [isEditingSubmission, setIsEditingSubmission] = useState(false)
	const [filesToKeep, setFilesToKeep] = useState<FileInfo[]>([])

	// Gọi API nộp báo cáo
	const [submitReport, { isLoading: isSubmitLoading }] = useSubmitReportMutation()

	// Kiểm tra xem có được phép nộp lại không (status = "Needs Revision")
	const isResubmit = milestone.status === 'Needs Revision'

	// Kiểm tra xem đã nộp bài chưa
	const hasSubmission = milestone.submission

	// Kiểm tra còn hạn hay không
	const isBeforeDeadline = new Date(milestone.dueDate) > new Date()

	// Kiểm tra có thể nộp lại không (đã nộp + còn hạn + chưa hoàn thành)
	const canResubmit = hasSubmission && isBeforeDeadline && milestone.status !== 'Completed'

	// Kiểm tra điều kiện cho phép nộp bài
	const canSubmit = milestone.progress >= 100 || isResubmit

	// Xử lý chọn file
	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files
		if (files && files.length > 0) {
			const newFiles = Array.from(files)
			const totalSize = [...selectedFiles, ...newFiles].reduce((acc, file) => acc + file.size, 0)

			if (totalSize > 50 * 1024 * 1024) {
				sonnerToast.error('Tổng kích thước file vượt quá 50MB. Vui lòng chọn lại.', { richColors: true })
				return
			}

			setSelectedFiles((prev) => [...newFiles, ...prev])
		}
	}

	// Xử lý drag over
	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}

	// Xử lý drag leave
	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
	}

	// Xử lý drop file
	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
		const files = Array.from(e.dataTransfer.files)
		const totalSize = [...selectedFiles, ...files].reduce((acc, file) => acc + file.size, 0)

		if (totalSize > 50 * 1024 * 1024) {
			sonnerToast.error('Tổng kích thước file vượt quá 50MB. Vui lòng chọn lại.', { richColors: true })
			return
		}

		setSelectedFiles((prev) => [...files, ...prev])
	}

	// Xóa file
	const handleRemoveFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
	}

	// Chỉnh sửa tên file
	const handleEditFilename = (index: number, newName: string) => {
		setSelectedFiles((prev) =>
			prev.map((file, i) => {
				if (i !== index) return file
				return new File([file], newName, {
					type: file.type,
					lastModified: file.lastModified
				})
			})
		)
	}

	// Xử lý nộp báo cáo
	const handleSubmit = async () => {
		if (selectedFiles.length === 0) {
			sonnerToast.error('Vui lòng chọn file để nộp', { richColors: true })
			return
		}

		try {
			setIsSubmitting(true)
			await submitReport({
				milestoneId: milestone._id,
				groupId: milestone.groupId,
				files: selectedFiles
			}).unwrap()

			sonnerToast.success(isResubmit ? 'Nộp lại báo cáo thành công' : 'Nộp báo cáo thành công', {
				richColors: true
			})

			// Reset form
			setSelectedFiles([])
			setIsEditingSubmission(false)
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		} catch (error: any) {
			sonnerToast.error(error?.data?.message || 'Không thể nộp báo cáo. Vui lòng thử lại.', { richColors: true })
		} finally {
			setIsSubmitting(false)
		}
	}

	// Bắt đầu chỉnh sửa submission
	const handleStartEditSubmission = () => {
		setIsEditingSubmission(true)
		setFilesToKeep(milestone.submission?.files || [])
		setSelectedFiles([])
	}

	// Hủy chỉnh sửa
	const handleCancelEdit = () => {
		setIsEditingSubmission(false)
		setSelectedFiles([])
		setFilesToKeep([])
	}

	// Xóa file đã nộp
	const handleRemoveSubmittedFile = (fileUrl: string) => {
		setFilesToKeep((prev) => prev.filter((f) => f.url !== fileUrl))
	}

	// Cập nhật submission (giữ file cũ + thêm file mới)
	const handleUpdateSubmission = async () => {
		// Nếu không có file mới và không xóa file nào thì không làm gì
		if (selectedFiles.length === 0 && filesToKeep.length === (milestone.submission?.files?.length || 0)) {
			sonnerToast.info('Không có thay đổi nào', { richColors: true })
			return
		}

		// Nếu xóa hết file và không thêm file mới
		if (filesToKeep.length === 0 && selectedFiles.length === 0) {
			sonnerToast.error('Phải có ít nhất 1 file trong bài nộp', { richColors: true })
			return
		}

		try {
			setIsSubmitting(true)
			// Gọi API để update submission với file mới
			// Backend sẽ nhận: filesToKeepUrls (array URL giữ lại) + files mới
			// Hoặc chỉ gửi files mới và replace toàn bộ (tùy thiết kế backend)

			await submitReport({
				milestoneId: milestone._id,
				groupId: milestone.groupId,
				files: selectedFiles
			}).unwrap()

			sonnerToast.success('Cập nhật báo cáo thành công', { richColors: true })

			// Reset form
			setSelectedFiles([])
			setIsEditingSubmission(false)
			setFilesToKeep([])
			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		} catch (error: any) {
			sonnerToast.error(error?.data?.message || 'Không thể cập nhật báo cáo. Vui lòng thử lại.', {
				richColors: true
			})
		} finally {
			setIsSubmitting(false)
		}
	}

	// Render form nộp bài
	const renderSubmitForm = () => (
		<div className='space-y-4'>
			{/* Drag & Drop Area */}
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				className={cn(
					'rounded-xl border-2 border-dashed p-6 text-center transition-all duration-200',
					isDragging
						? 'border-indigo-500 bg-indigo-50'
						: 'border-indigo-300 hover:border-indigo-400 hover:bg-indigo-50/50'
				)}
			>
				<input
					ref={fileInputRef}
					type='file'
					multiple
					accept='.pdf,.doc,.docx,.zip,.pptx,.xlsx'
					onChange={handleFileSelect}
					className='hidden'
					id='file-upload-milestone'
				/>
				<div className='flex flex-col items-center gap-3'>
					<div
						className={cn(
							'rounded-full p-3 transition-colors',
							isDragging ? 'bg-indigo-100' : 'bg-indigo-50'
						)}
					>
						<Upload
							className={cn(
								'h-6 w-6 transition-colors',
								isDragging ? 'text-indigo-600' : 'text-indigo-500'
							)}
						/>
					</div>
					<div>
						<p className='text-sm font-medium text-slate-700'>
							Kéo thả file vào đây hoặc{' '}
							<label
								htmlFor='file-upload-milestone'
								className='cursor-pointer text-indigo-600 hover:underline'
							>
								chọn file
							</label>
						</p>
						<p className='mt-1 text-xs text-slate-500'>
							Hỗ trợ: PDF, DOC, DOCX, ZIP, PPTX, XLSX (tối đa 50MB)
						</p>
					</div>
				</div>
			</div>

			{/* Hiển thị file đã chọn với Editting component */}
			{selectedFiles.length > 0 && (
				<div className='max-h-60 space-y-2 overflow-y-auto'>
					{selectedFiles.map((file, idx) => (
						<Editting
							key={idx}
							file={file}
							index={idx}
							onRemoveDraftFile={() => handleRemoveFile(idx)}
							isUploading={isSubmitting}
							onEditting={(newName) => handleEditFilename(idx, newName)}
						/>
					))}
				</div>
			)}

			{/* Nút nộp */}
			<button
				onClick={handleSubmit}
				disabled={isSubmitting || selectedFiles.length === 0}
				className='flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-3 font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400'
			>
				{isSubmitting ? (
					<>
						<div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
						Đang tải lên...
					</>
				) : (
					<>
						<Send className='h-4 w-4' /> {isResubmit ? 'Nộp lại báo cáo' : 'Nộp báo cáo'}
						{selectedFiles.length > 0 && <span className='ml-1'>({selectedFiles.length} file)</span>}
					</>
				)}
			</button>
		</div>
	)

	return (
		<div className='fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col border-l border-slate-200 bg-white shadow-2xl'>
			<div className='flex h-16 shrink-0 items-center justify-between border-b bg-slate-50 px-6'>
				<div>
					<span className='text-xs font-bold uppercase text-slate-400'>Sinh viên</span>
					<h2 className='text-lg font-bold text-slate-800'>{milestone.title}</h2>
				</div>
				<button onClick={onClose}>
					<X className='h-5 w-5 text-slate-400 hover:text-slate-600' />
				</button>
			</div>

			<div className='flex-1 overflow-y-auto p-6'>
				{/* Trạng thái milestone */}
				<div className='mb-6'>
					<StatusBadge status={milestone.status} />
					<div className='mt-3'>
						<div className='mb-2 flex items-center justify-between text-sm'>
							<span className='font-medium text-slate-600'>Tiến độ hoàn thành</span>
							<span className='font-bold text-indigo-600'>{milestone.progress}%</span>
						</div>
						<ProgressBar progress={milestone.progress} />
					</div>
				</div>

				{/* Phần nộp bài */}
				<div className='mb-6'>
					<h3 className='mb-3 flex items-center gap-2 text-sm font-bold uppercase text-slate-500'>
						<UploadCloud className='h-4 w-4' /> Nộp bài
					</h3>

					{hasSubmission ? (
						<div className='space-y-4'>
							{/* Hiển thị bài đã nộp */}
							<div className='rounded-xl border border-blue-100 bg-blue-50 p-4'>
								<div className='mb-3 flex items-center justify-between'>
									<span className='text-xs font-bold uppercase text-blue-600'>
										Bài nộp hiện tại
										{isEditingSubmission && (
											<span className='ml-2 text-orange-600'>(Đang chỉnh sửa)</span>
										)}
									</span>
									<div className='flex items-center gap-2'>
										<span className='text-xs text-slate-500'>
											{milestone.submission?.date &&
												new Date(milestone.submission.date).toLocaleString('vi-VN')}
										</span>
										{!isEditingSubmission && canResubmit && (
											<button
												onClick={handleStartEditSubmission}
												className='rounded bg-blue-600 px-2 py-1 text-xs text-white hover:bg-blue-700'
											>
												Chỉnh sửa
											</button>
										)}
									</div>
								</div>

								{isEditingSubmission ? (
									<>
										{/* Danh sách file đang giữ lại */}
										<div className='space-y-2'>
											{filesToKeep.map((file, idx) => (
												<div
													key={idx}
													className='flex items-center gap-3 rounded-lg bg-white p-2'
												>
													<FileText className='h-8 w-8 text-blue-600' />
													<div className='flex-1'>
														<p className='text-sm font-medium'>{file.name}</p>
														<p className='text-xs text-slate-500'>
															{(file.size / 1024 / 1024).toFixed(2)} MB
														</p>
													</div>
													<button
														onClick={() => handleRemoveSubmittedFile(file.url)}
														className='rounded p-1 text-red-500 hover:bg-red-50'
														title='Xóa file'
													>
														<X className='h-4 w-4' />
													</button>
												</div>
											))}
										</div>

										{/* Form thêm file mới */}
										<div className='mt-4 space-y-3'>
											<p className='text-xs font-medium text-slate-600'>Thêm file mới:</p>
											{renderSubmitForm()}

											{/* Nút hành động */}
											<div className='flex gap-2'>
												<button
													onClick={handleUpdateSubmission}
													disabled={isSubmitting}
													className='flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:bg-slate-400'
												>
													{isSubmitting ? (
														<>
															<div className='h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent' />
															Đang cập nhật...
														</>
													) : (
														<>
															<CheckCircle2 className='h-4 w-4' />
															Lưu thay đổi
															{(filesToKeep.length > 0 || selectedFiles.length > 0) && (
																<span className='text-xs'>
																	({filesToKeep.length + selectedFiles.length} file)
																</span>
															)}
														</>
													)}
												</button>
												<button
													onClick={handleCancelEdit}
													disabled={isSubmitting}
													className='rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50'
												>
													Hủy
												</button>
											</div>
										</div>
									</>
								) : (
									<div className='space-y-2'>
										{milestone?.submission &&
											milestone?.submission.files?.map((file, idx) => (
												<div key={idx} className='flex items-center gap-3'>
													<FileText className='h-10 w-10 rounded-lg bg-blue-100 p-2 text-blue-600' />
													<div className='flex-1'>
														<p className='text-sm font-medium'>{file.name}</p>
														<p className='text-xs text-slate-500'>
															{(file.size / 1024 / 1024).toFixed(2)} MB
														</p>
													</div>
													<a
														href={
															baseDownloadUrl
																? baseDownloadUrl + '/' + file.url
																: file.url
														}
														target='_blank'
														rel='noopener noreferrer'
														className='text-xs font-medium text-blue-600 hover:underline'
													>
														Xem file
													</a>
												</div>
											))}
									</div>
								)}
							</div>
							{milestone.submission && milestone.submission.lecturerDecision && (
								<>
									<div className='ml-5 flex flex-col rounded bg-blue-100 p-2 text-sm text-slate-700'>
										<div className='flex gap-2'>
											<span className='text font-medium'>
												{milestone.submission.lecturerInfo.title +
													' ' +
													milestone.submission.lecturerInfo.fullName}
											</span>
											<span className='rounded bg-slate-400 px-2 font-medium text-white'>
												{milestone.submission.lecturerDecision === 'approved'
													? 'Chấp nhận'
													: 'Yêu cầu làm lại'}
											</span>
										</div>
										<span className='text ml-5'>
											<div
												className='prose max-w-none rounded-lg bg-blue-50 px-2 py-1'
												// Sử dụng DOMPurify để đảm bảo an toàn, tránh XSS
												dangerouslySetInnerHTML={{
													__html: DOMPurify.sanitize(
														milestone.submission.lecturerFeedback || '<p>Chưa có mô tả</p>'
													)
												}}
											/>
										</span>
									</div>
								</>
							)}
							{/* Lịch sử nộp bài */}
							{milestone.submissionHistory && milestone.submissionHistory.length > 0 && (
								<SubmissionHistoryList history={milestone.submissionHistory} />
							)}

							{/* Nút nộp lại nếu cần sửa (Needs Revision) */}
							{isResubmit && (
								<div className='rounded-xl border-2 border-dashed border-orange-200 bg-orange-50 p-4'>
									<div className='mb-3 flex items-center gap-2 text-orange-700'>
										<AlertCircle className='h-5 w-5' />
										<span className='font-semibold'>Cần nộp lại báo cáo</span>
									</div>
									<p className='mb-4 text-sm text-slate-600'>
										Báo cáo của bạn cần chỉnh sửa. Vui lòng cập nhật và nộp lại.
									</p>
									{renderSubmitForm()}
								</div>
							)}

							{/* Nút nộp lại nếu còn hạn (không phải Needs Revision) */}
							{!isResubmit && !isEditingSubmission && canResubmit && (
								<div className='rounded-xl border-2 border-dashed border-green-200 bg-green-50 p-4'>
									<div className='mb-3 flex items-center gap-2 text-green-700'>
										<CheckCircle2 className='h-5 w-5' />
										<span className='font-semibold'>Nộp lại phiên bản mới</span>
									</div>
									<p className='mb-4 text-sm text-slate-600'>
										Bạn có thể cập nhật báo cáo mới trước hạn chót. Phiên bản cũ sẽ được lưu vào
										lịch sử.
									</p>
									{renderSubmitForm()}
								</div>
							)}

							{/* Thông báo hết hạn */}
							{!isBeforeDeadline && milestone.status !== 'Completed' && (
								<div className='rounded-xl border border-red-200 bg-red-50 p-4'>
									<div className='flex items-center gap-2 text-red-700'>
										<AlertCircle className='h-5 w-5' />
										<span className='font-semibold'>Đã hết hạn nộp</span>
									</div>
									<p className='mt-2 text-sm text-slate-600'>
										Thời gian nộp báo cáo đã kết thúc vào{' '}
										{new Date(milestone.dueDate).toLocaleString('vi-VN')}
									</p>
								</div>
							)}
						</div>
					) : (
						<div
							className={`rounded-xl border-2 border-dashed p-6 text-center ${
								canSubmit ? 'border-indigo-200 bg-indigo-50' : 'border-slate-200 bg-slate-50'
							}`}
						>
							{!canSubmit ? (
								<div className='flex flex-col items-center gap-3'>
									<CheckSquare className='h-12 w-12 text-slate-400' />
									<p className='text-sm font-medium text-slate-600'>
										Hoàn thành 100% checklist để nộp bài
									</p>
									<p className='text-xs text-slate-500'>Tiến độ hiện tại: {milestone.progress}%</p>
								</div>
							) : (
								renderSubmitForm()
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
