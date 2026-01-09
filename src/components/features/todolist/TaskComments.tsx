import { useState, useRef } from 'react'
import type { TaskComment, FileInfo, TaskDetail } from '@/models/task-detail.model'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import {
	useAddCommentMutation,
	useAddCommentWithFilesMutation,
	useDeleteCommentMutation,
	useUpdateCommentMutation,
	useUpdateCommentWithFilesMutation
} from '@/services/todolistApi'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import {
	Edit2,
	Trash2,
	Check,
	X,
	Upload,
	Paperclip,
	File,
	FileText,
	Image as ImageIcon,
	X as XIcon,
	Download
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { useAppSelector } from '@/store'
import { getUserIdFromAppUser } from '@/utils/utils'

interface TaskCommentsProps {
	taskId: string
	comments: TaskComment[]
	task: TaskDetail
}

export const TaskComments = ({ taskId, comments, task }: TaskCommentsProps) => {
	const [newComment, setNewComment] = useState('')
	const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
	const [editContent, setEditContent] = useState('')
	const [editingFiles, setEditingFiles] = useState<File[]>([])
	const [existingFiles, setExistingFiles] = useState<FileInfo[]>([])
	const [deleteCommentId, setDeleteCommentId] = useState<string | null>(null)
	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [isDragging, setIsDragging] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)
	const editFileInputRef = useRef<HTMLInputElement>(null)

	const [addComment, { isLoading: isAdding }] = useAddCommentMutation()
	const [addCommentWithFiles, { isLoading: isAddingWithFiles }] = useAddCommentWithFilesMutation()
	const [updateComment, { isLoading: isUpdating }] = useUpdateCommentMutation()
	const [updateCommentWithFiles, { isLoading: isUpdatingWithFiles }] = useUpdateCommentWithFilesMutation()
	const [deleteComment, { isLoading: isDeleting }] = useDeleteCommentMutation()

	const currentUser = useAppSelector((state) => state.auth.user)
	const currentUserId = getUserIdFromAppUser(currentUser)
	const { toast } = useToast()

	const handleAddComment = async () => {
		if (!newComment.trim() && selectedFiles.length === 0) return

		try {
			if (selectedFiles.length > 0) {
				// Gửi với files qua FormData
				const formData = new FormData()
				formData.append('content', newComment)
				selectedFiles.forEach((file) => {
					formData.append('files', file)
				})

				await addCommentWithFiles({
					taskId,
					formData
				}).unwrap()
			} else {
				// Chỉ gửi text comment
				await addComment({
					taskId,
					payload: { content: newComment }
				}).unwrap()
			}

			setNewComment('')
			setSelectedFiles([])
			toast({
				title: 'Success',
				description: 'Comment added successfully'
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to add comment',
				variant: 'destructive'
			})
		}
	}

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(true)
	}

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
	}

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault()
		setIsDragging(false)
		const files = Array.from(e.dataTransfer.files)
		handleFiles(files)
	}

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files)
			handleFiles(files)
		}
	}

	const handleFiles = (files: File[]) => {
		const maxSize = 50 * 1024 * 1024 // 50MB
		const validFiles = files.filter((file) => file.size <= maxSize)

		if (validFiles.length < files.length) {
			toast({
				title: 'Warning',
				description: 'Some files were too large (max 50MB)',
				variant: 'destructive'
			})
		}

		setSelectedFiles((prev) => [...prev, ...validFiles])
	}

	const removeFile = (index: number) => {
		setSelectedFiles((prev) => prev.filter((_, i) => i !== index))
	}

	const getFileIcon = (file: File) => {
		if (file.type.startsWith('image/')) {
			return <ImageIcon className='h-4 w-4 text-green-500' />
		} else if (file.type.includes('pdf')) {
			return <FileText className='h-4 w-4 text-red-500' />
		} else {
			return <File className='h-4 w-4 text-blue-500' />
		}
	}

	const getFileIconFromUrl = (fileName: string) => {
		const ext = fileName.toLowerCase()
		if (ext.includes('.jpg') || ext.includes('.jpeg') || ext.includes('.png') || ext.includes('.gif')) {
			return <ImageIcon className='h-4 w-4 text-green-500' />
		} else if (ext.includes('.pdf')) {
			return <FileText className='h-4 w-4 text-red-500' />
		} else if (ext.includes('.doc') || ext.includes('.docx')) {
			return <FileText className='h-4 w-4 text-blue-500' />
		} else {
			return <File className='h-4 w-4 text-gray-500' />
		}
	}

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
	}

	const handleDownloadFile = (fileUrl: string, fileName: string) => {
		const baseUrl = import.meta.env.VITE_MINIO_DOWNLOAD_URL_BASE
		const downloadUrl = `${baseUrl}/${fileUrl}`
		const link = document.createElement('a')
		link.href = downloadUrl
		link.download = fileName
		link.target = '_blank'
		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	const handleUpdateComment = async (commentId: string) => {
		if (!editContent.trim()) return

		try {
			// Find the original comment to compare files
			const originalComment = task.comments.find((c) => c._id === commentId)
			const hasFileChanges =
				editingFiles.length > 0 || existingFiles.length !== (originalComment?.files?.length || 0)

			if (hasFileChanges) {
				// Use FormData for file updates
				const formData = new FormData()
				formData.append('content', editContent)

				// Add existing files that weren't removed
				existingFiles.forEach((file) => {
					formData.append('existingFiles', JSON.stringify(file))
				})

				// Add new files
				editingFiles.forEach((file) => {
					formData.append('files', file)
				})

				await updateCommentWithFiles({
					taskId,
					commentId,
					formData
				}).unwrap()
			} else {
				// No file changes, use regular update
				await updateComment({
					taskId,
					commentId,
					payload: { content: editContent }
				}).unwrap()
			}

			setEditingCommentId(null)
			setEditContent('')
			setEditingFiles([])
			setExistingFiles([])
			toast({
				title: 'Success',
				description: 'Comment updated successfully'
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update comment',
				variant: 'destructive'
			})
		}
	}

	const handleDeleteComment = async () => {
		if (!deleteCommentId) return

		try {
			await deleteComment({
				taskId,
				commentId: deleteCommentId
			}).unwrap()

			setDeleteCommentId(null)
			toast({
				title: 'Success',
				description: 'Comment deleted successfully'
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to delete comment',
				variant: 'destructive'
			})
		}
	}

	const startEdit = (comment: TaskComment) => {
		setEditingCommentId(comment._id)
		setEditContent(comment.content)
		setExistingFiles(comment.files || [])
		setEditingFiles([])
	}

	const cancelEdit = () => {
		setEditingCommentId(null)
		setEditContent('')
		setEditingFiles([])
		setExistingFiles([])
	}

	const handleEditFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files)
			const validFiles = files.filter((file) => file.size <= 50 * 1024 * 1024)
			if (validFiles.length < files.length) {
				toast({
					title: 'Warning',
					description: 'Some files were too large (max 50MB)',
					variant: 'destructive'
				})
			}
			setEditingFiles((prev) => [...prev, ...validFiles])
		}
	}

	const removeEditingFile = (index: number) => {
		setEditingFiles((prev) => prev.filter((_, i) => i !== index))
	}

	const removeExistingFile = (index: number) => {
		setExistingFiles((prev) => prev.filter((_, i) => i !== index))
	}
console.log('comments', comments)
	return (
		<div className='space-y-4 p-1'>
			{/* Add Comment */}
			<div className='space-y-3'>
				<Textarea
					placeholder='Thêm một bình luận...'
					value={newComment}
					onChange={(e) => setNewComment(e.target.value)}
					className='min-h-[80px]'
				/>

				<input
					ref={fileInputRef}
					type='file'
					multiple
					onChange={handleFileInput}
					className='hidden'
					accept='.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.txt,.xlsx,.pptx'
				/>

				{/* Selected Files Preview */}
				{selectedFiles.length > 0 && (
					<div className='space-y-2'>
						<p className='text-sm font-medium'>Files đã chọn ({selectedFiles.length}):</p>
						<div className='max-h-[200px] space-y-2 overflow-y-auto'>
							{selectedFiles.map((file, index) => (
								<div
									key={index}
									className='flex items-center justify-between rounded-lg border bg-card p-2 text-sm'
								>
									<div className='flex items-center gap-2'>
										{getFileIcon(file)}
										<div className='min-w-0 flex-1'>
											<p className='truncate font-medium'>{file.name}</p>
											<p className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</p>
										</div>
									</div>
									<Button
										variant='ghost'
										size='sm'
										onClick={() => removeFile(index)}
										className='h-6 w-6 p-0'
									>
										<XIcon className='h-4 w-4' />
									</Button>
								</div>
							))}
						</div>
					</div>
				)}

				<div className='flex items-center gap-2'>
					<Button
						onClick={handleAddComment}
						disabled={isAdding || isAddingWithFiles || !newComment.trim()}
						size='sm'
					>
						{isAdding || isAddingWithFiles ? 'Đang thêm...' : 'Thêm bình luận'}
					</Button>
					<Button variant='ghost' size='sm' onClick={() => fileInputRef.current?.click()} type='button'>
						<Paperclip className='h-4 w-4' />
					</Button>
				</div>
			</div>

			<Separator />

			{/* Comments List */}
			<ScrollArea className='max-h-[500px]'>
				<div className='space-y-4'>
					{comments.length === 0 ? (
						<p className='text-sm italic text-muted-foreground'>Chưa có bình luận nào</p>
					) : (
						comments.map((comment) => (
							<div key={comment._id} className='group flex gap-3'>
								{/* Avatar */}
								<div className='flex-shrink-0'>
									{comment.user?.avatarUrl ? (
										<img
											src={comment.user.avatarUrl}
											alt={comment.user.fullName}
											className='h-8 w-8 rounded-full'
										/>
									) : (
										<div className='flex h-8 w-8 items-center justify-center rounded-full bg-primary/10'>
											<span className='text-xs font-medium'>
												{comment.user?.fullName?.charAt(0) || 'U'}
											</span>
										</div>
									)}
								</div>

								{/* Comment Content */}
								<div className='flex-1 space-y-1'>
									<div className='flex items-center gap-2'>
										<span className='text-sm font-medium'>{comment.user?.fullName}</span>
										<span className='text-xs text-muted-foreground'>
											{formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
										</span>
										{comment.editedAt && (
											<span className='text-xs italic text-muted-foreground'>(edited)</span>
										)}
									</div>

									{editingCommentId === comment._id ? (
										<div className='space-y-2'>
											<Textarea
												value={editContent}
												onChange={(e) => setEditContent(e.target.value)}
												className='min-h-[60px]'
											/>

											{/* Existing Files */}
											{existingFiles.length > 0 && (
												<div className='space-y-1'>
													<p className='text-xs font-medium text-muted-foreground'>
														Files hiện tại:
													</p>
													{existingFiles.map((file, idx) => (
														<div
															key={idx}
															className='flex items-center gap-2 rounded border bg-card p-1.5 text-xs'
														>
															{getFileIconFromUrl(file.name)}
															<span className='flex-1 truncate'>{file.name}</span>
															<Button
																variant='ghost'
																size='sm'
																onClick={() => removeExistingFile(idx)}
																className='h-5 w-5 p-0'
															>
																<XIcon className='h-3 w-3' />
															</Button>
														</div>
													))}
												</div>
											)}

											{/* New Files to Add */}
											{editingFiles.length > 0 && (
												<div className='space-y-1'>
													<p className='text-xs font-medium text-muted-foreground'>
														Files mới thêm:
													</p>
													{editingFiles.map((file, idx) => (
														<div
															key={idx}
															className='flex items-center gap-2 rounded border bg-primary/10 p-1.5 text-xs'
														>
															{getFileIcon(file)}
															<span className='flex-1 truncate'>{file.name}</span>
															<Button
																variant='ghost'
																size='sm'
																onClick={() => removeEditingFile(idx)}
																className='h-5 w-5 p-0'
															>
																<XIcon className='h-3 w-3' />
															</Button>
														</div>
													))}
												</div>
											)}

											<input
												ref={editFileInputRef}
												type='file'
												multiple
												onChange={handleEditFileInput}
												className='hidden'
												accept='.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.txt,.xlsx,.pptx'
											/>

											<div className='flex gap-2'>
												<Button
													size='sm'
													onClick={() => handleUpdateComment(comment._id)}
													disabled={isUpdating || !editContent.trim()}
												>
													<Check className='mr-1 h-3 w-3' />
													Lưu
												</Button>
												<Button
													variant='ghost'
													size='sm'
													onClick={() => editFileInputRef.current?.click()}
													type='button'
												>
													<Paperclip className='mr-1 h-3 w-3' />
													Thêm file
												</Button>
												<Button
													size='sm'
													variant='outline'
													onClick={cancelEdit}
													disabled={isUpdating}
												>
													<X className='mr-1 h-3 w-3' />
													Hủy
												</Button>
											</div>
										</div>
									) : (
										<>
											<p className='whitespace-pre-wrap text-sm'>{comment.content}</p>

											{console.log('Full comment object:', JSON.stringify(comment, null, 2))}
											{console.log('comment.files:', comment.files)}
											{console.log('Has files?', !!comment.files, 'Length:', comment.files?.length)}
											{/* Attached Files */}
											{comment.files && comment.files.length > 0 && (
												
												<div className='mt-2 space-y-1'>

													{comment.files.map((file, idx) => (
														<div
															key={idx}
															className='flex items-center gap-2 rounded border bg-accent/50 p-2 text-xs hover:bg-accent'
														>
															{getFileIconFromUrl(file.name)}
															<div className='min-w-0 flex-1'>
																<p className='truncate font-medium'>{file.name}</p>
																<p className='text-xs text-muted-foreground'>
																	{formatFileSize(file.size)}
																</p>
															</div>
															<Button
																variant='ghost'
																size='sm'
																onClick={() => handleDownloadFile(file.url, file.name)}
																className='h-6 w-6 p-0'
																title='Download'
															>
																<Download className='h-3 w-3' />
															</Button>
														</div>
													))}
												</div>
											)}

											{/* Actions (only for comment owner) */}
											{comment.user?._id === currentUserId && (
												<div className='flex gap-2 opacity-0 transition-opacity group-hover:opacity-100'>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => startEdit(comment)}
														className='h-7 text-xs'
													>
														<Edit2 className='mr-1 h-3 w-3' />
														Edit
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => setDeleteCommentId(comment._id)}
														className='h-7 text-xs text-destructive hover:text-destructive'
													>
														<Trash2 className='mr-1 h-3 w-3' />
														Delete
													</Button>
												</div>
											)}
										</>
									)}
								</div>
							</div>
						))
					)}
				</div>
			</ScrollArea>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Delete Comment</AlertDialogTitle>
						<AlertDialogDescription>
							Are you sure you want to delete this comment? This action cannot be undone.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteComment} disabled={isDeleting}>
							{isDeleting ? 'Deleting...' : 'Delete'}
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
