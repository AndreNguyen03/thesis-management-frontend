import { useState, useRef } from 'react'
import type { FileInfo, TaskComment } from '@/models/task-detail.model'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/textarea'
import {
	useAddSubtaskCommentMutation,
	useAddSubtaskCommentWithFilesMutation,
	useDeleteSubtaskCommentMutation,
	useUpdateSubtaskCommentMutation,
	useUpdateSubtaskCommentWithFilesMutation
} from '@/services/todolistApi'
import { vi as viLocale } from 'date-fns/locale'

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

interface SubtaskCommentsProps {
	taskId: string
	columnId: string
	subtaskId: string
	comments?: TaskComment[]
}

export const SubtaskComments = ({ taskId, columnId, subtaskId, comments }: SubtaskCommentsProps) => {
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

	const [addComment, { isLoading: isAdding }] = useAddSubtaskCommentMutation()
	const [addCommentWithFiles, { isLoading: isAddingWithFiles }] = useAddSubtaskCommentWithFilesMutation()
	const [updateComment, { isLoading: isUpdating }] = useUpdateSubtaskCommentMutation()
	const [updateCommentWithFiles, { isLoading: isUpdatingWithFiles }] = useUpdateSubtaskCommentWithFilesMutation()
	const [deleteComment, { isLoading: isDeleting }] = useDeleteSubtaskCommentMutation()

	const currentUser = useAppSelector((state) => state.auth.user)
	const currentUserId = getUserIdFromAppUser(currentUser)
	const { toast } = useToast()

	const handleAddComment = async () => {
		if (!newComment.trim() && selectedFiles.length === 0) return

		try {
			if (selectedFiles.length > 0) {
				const formData = new FormData()
				formData.append('content', newComment)
				selectedFiles.forEach((file) => {
					formData.append('files', file)
				})

				await addCommentWithFiles({
					taskId,
					columnId,
					subtaskId,
					formData
				}).unwrap()
			} else {
				await addComment({
					taskId,
					columnId,
					subtaskId,
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
			if (editingFiles.length > 0 || existingFiles !== undefined) {
				const formData = new FormData()
				formData.append('content', editContent)
				formData.append('existingFiles', JSON.stringify(existingFiles))
				editingFiles.forEach((file) => {
					formData.append('files', file)
				})

				await updateCommentWithFiles({
					taskId,
					columnId,
					subtaskId,
					commentId,
					formData
				}).unwrap()
			} else {
				await updateComment({
					taskId,
					columnId,
					subtaskId,
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
				columnId,
				subtaskId,
				commentId: deleteCommentId
			}).unwrap()

			toast({
				title: 'Success',
				description: 'Comment deleted successfully'
			})
			setDeleteCommentId(null)
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
			const maxSize = 50 * 1024 * 1024
			const validFiles = files.filter((file) => file.size <= maxSize)

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

	return (
		<div className='space-y-4'>
			{/* Comment List */}
			<ScrollArea className='h-[300px]'>
				<div className='space-y-4 pr-4'>
					{!comments || comments.length === 0 ? (
						<p className='py-8 text-center text-sm italic text-muted-foreground'>Chưa có bình luận nào</p>
					) : (
						comments.map((comment) => (
							<div key={comment._id} className='space-y-2'>
								<div className='flex items-start gap-3'>
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

									<div className='flex-1 space-y-1'>
										<div className='group flex'>
											<div className='flex items-center gap-2'>
												<span className='text-sm font-medium'>
													{comment.user?.fullName || 'Unknown User'}
												</span>
												<span className='text-xs text-muted-foreground'>
													{formatDistanceToNow(new Date(comment.created_at), {
														addSuffix: true,
														locale: viLocale
													})}
												</span>
												{comment.editedAt && (
													<span className='text-xs italic text-muted-foreground'>
														(đã chỉnh sửa)
													</span>
												)}
											</div>
											{/* Actions (only for comment owner) */}
											{comment.user?._id === currentUserId && (
												<div className='flex gap-2 mx-1 opacity-0 transition-opacity group-hover:opacity-100'>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => startEdit(comment)}
														className='h-7 text-xs hover:bg-gray-50'
													>
														<Edit2 className='mr-1 h-3 w-3' />
														Sửa
													</Button>
													<Button
														variant='ghost'
														size='sm'
														onClick={() => setDeleteCommentId(comment._id)}
														className='h-7 text-xs text-destructive hover:bg-gray-50'
													>
														<Trash2 className='mr-1 h-3 w-3' />
														Xóa
													</Button>
												</div>
											)}
										</div>
										{editingCommentId === comment._id ? (
											<div className='space-y-2'>
												<Textarea
													value={editContent}
													onChange={(e) => setEditContent(e.target.value)}
													className='min-h-[80px]'
												/>

												{/* Existing Files */}
												{existingFiles.length > 0 && (
													<div className='space-y-1'>
														<p className='text-xs text-muted-foreground'>Tệp tin hiện có</p>
														{existingFiles.map((file, index) => (
															<div
																key={index}
																className='flex items-center gap-2 rounded-md border bg-muted/30 p-2 text-sm'
															>
																{getFileIconFromUrl(file.name)}
																<span className='flex-1 truncate'>{file.name}</span>
																<span className='text-xs text-muted-foreground'>
																	{formatFileSize(file.size)}
																</span>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-6 w-6'
																	onClick={() => removeExistingFile(index)}
																>
																	<XIcon className='h-3 w-3' />
																</Button>
															</div>
														))}
													</div>
												)}

												{/* New Files */}
												{editingFiles.length > 0 && (
													<div className='space-y-1'>
														<p className='text-xs text-muted-foreground'>New files:</p>
														{editingFiles.map((file, index) => (
															<div
																key={index}
																className='flex items-center gap-2 rounded-md border bg-green-50 p-2 text-sm'
															>
																{getFileIcon(file)}
																<span className='flex-1 truncate'>{file.name}</span>
																<span className='text-xs text-muted-foreground'>
																	{formatFileSize(file.size)}
																</span>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-6 w-6'
																	onClick={() => removeEditingFile(index)}
																>
																	<XIcon className='h-3 w-3' />
																</Button>
															</div>
														))}
													</div>
												)}

												<div className='flex gap-2'>
													<input
														ref={editFileInputRef}
														type='file'
														multiple
														className='hidden'
														onChange={handleEditFileInput}
													/>
													<Button
														variant='outline'
														size='sm'
														onClick={() => editFileInputRef.current?.click()}
													>
														<Paperclip className='mr-1 h-3 w-3' />
														Đính kèm
													</Button>
													<Button
														onClick={() => handleUpdateComment(comment._id)}
														disabled={isUpdating || isUpdatingWithFiles}
														size='sm'
													>
														<Check className='mr-1 h-3 w-3' />
														Lưu
													</Button>
													<Button
														variant='outline'
														onClick={cancelEdit}
														disabled={isUpdating || isUpdatingWithFiles}
														size='sm'
													>
														<X className='mr-1 h-3 w-3' />
														Hủy
													</Button>
												</div>
											</div>
										) : (
											<div className='space-y-2'>
												<div className='rounded-md bg-muted/30 p-3 text-sm'>
													{comment.content}
												</div>

												{/* File Attachments */}
												{comment.files && comment.files.length > 0 && (
													<div className='space-y-1'>
														{comment.files.map((file, index) => (
															<div
																key={index}
																className='flex items-center gap-2 rounded-md border bg-white p-2 text-sm'
															>
																{getFileIconFromUrl(file.name)}
																<span className='flex-1 truncate'>{file.name}</span>
																<span className='text-xs text-muted-foreground'>
																	{formatFileSize(file.size)}
																</span>
																<Button
																	variant='ghost'
																	size='icon'
																	className='h-6 w-6'
																	onClick={() =>
																		handleDownloadFile(file.url, file.name)
																	}
																>
																	<Download className='h-3 w-3' />
																</Button>
															</div>
														))}
													</div>
												)}
											</div>
										)}
									</div>
								</div>
								<Separator />
							</div>
						))
					)}
				</div>
			</ScrollArea>

			{/* Add Comment Form */}
			<div className='space-y-3'>
				<div
					className={cn(
						'rounded-md border-2 border-dashed p-4 transition-colors',
						isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
					)}
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
				>
					<Textarea
						value={newComment}
						onChange={(e) => setNewComment(e.target.value)}
						placeholder='Thêm bình luận...'
						className='min-h-[80px]'
					/>

					{/* File Preview */}
					{selectedFiles.length > 0 && (
						<div className='mt-3 space-y-2'>
							{selectedFiles.map((file, index) => (
								<div
									key={index}
									className='flex items-center gap-2 rounded-md border bg-muted/30 p-2 text-sm'
								>
									{getFileIcon(file)}
									<span className='flex-1 truncate'>{file.name}</span>
									<span className='text-xs text-muted-foreground'>{formatFileSize(file.size)}</span>
									<Button
										variant='ghost'
										size='icon'
										className='h-6 w-6'
										onClick={() => removeFile(index)}
									>
										<XIcon className='h-3 w-3' />
									</Button>
								</div>
							))}
						</div>
					)}

					<div className='mt-3 flex gap-2'>
						<input ref={fileInputRef} type='file' multiple className='hidden' onChange={handleFileInput} />
						<Button variant='outline' size='sm' onClick={() => fileInputRef.current?.click()}>
							<Upload className='mr-2 h-4 w-4' />
							Đính kèm file
						</Button>
						<Button
							onClick={handleAddComment}
							disabled={isAdding || isAddingWithFiles || !newComment.trim()}
							size='sm'
						>
							Bình luận
						</Button>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<AlertDialog open={!!deleteCommentId} onOpenChange={() => setDeleteCommentId(null)}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận xóa</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn có chắc chắn muốn xóa bình luận này? Hành động này không thể hoàn tác.
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handleDeleteComment} disabled={isDeleting}>
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
