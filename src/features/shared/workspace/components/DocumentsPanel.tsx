import React, { useState, useRef, useEffect } from 'react'
import {
	Upload,
	FileText,
	Image,
	File,
	Trash2,
	Download,
	Eye,
	FolderOpen,
	Plus,
	X,
	UploadIcon,
	Edit,
	Loader2
} from 'lucide-react'
import { cn, downloadFileWithURL } from '@/lib/utils'
import type { GetUploadedFileDto } from '@/models/file.model'
import {
	useDownloadTopicFilesZipMutation,
	useGetDocumentsOfTopicQuery,
	useLecturerDeleteFilesMutation,
	useLecturerUploadFilesMutation
} from '@/services/topicApi'
import { toast } from 'sonner'
import { Button } from '@/components/ui'
import { DeleteDocumentModal } from './modal/DeleteDocument'
import Editting from './Editting'
import { Checkbox } from '@/components/ui/checkbox'
import { useAppSelector } from '@/store'

export const getFileIcon = (type: GetUploadedFileDto['type']) => {
	switch (type) {
		case 'pdf':
			return <FileText className='h-5 w-5 text-destructive' />
		case 'doc':
			return <FileText className='h-5 w-5 text-info' />
		case 'image':
			return <Image className='h-5 w-5 text-success' />
		default:
			return <File className='h-5 w-5 text-muted-foreground' />
	}
}

const getFileTypeLabel = (type: GetUploadedFileDto['type']) => {
	switch (type) {
		case 'pdf':
			return 'PDF'
		case 'doc':
			return 'DOC'
		case 'image':
			return 'Hình ảnh'
		default:
			return 'Khác'
	}
}

export const DocumentsPanel = () => {
	const group = useAppSelector((state) => state.group)
	const [selectedDraftFiles, setSelectedDraftFiles] = useState<File[]>([])
	const { data: documentsData, refetch } = useGetDocumentsOfTopicQuery(
		{ topicId: group.activeGroup?.topicId || '' },
		{ skip: !group.activeGroup?.topicId }
	)
	const [documents, setDocuments] = useState<GetUploadedFileDto[]>([])
	const [isDeleteModal, setIsOpenDeleteModal] = useState(false)
	const [deletingDocumentIds, setDeletingDocumentIds] = useState<string[]>([])
	useEffect(() => {
		if (documentsData) {
			setDocuments(documentsData)
		}
	}, [documentsData])
	//
	//const user = useAppSelector((state) => state.user)
	//base urrl
	const baseUrl = import.meta.env.VITE_MINIO_DOWNLOAD_URL_BASE
	//gọi endpoint để tải nhiều file
	const [lecturerUploadFiles, { isLoading: isUploading }] = useLecturerUploadFilesMutation()
	//gọi endpoint để xóa nhiều file
	const [lecturerDeleteFiles, { isLoading: isDeleting }] = useLecturerDeleteFilesMutation()
	//gọi endpoint edder download zip
	const [downloadZip, { isLoading: isDownloading }] = useDownloadTopicFilesZipMutation()

	const [isChoosingFiles, setIsChoosingFiles] = useState(false)
	const [isDragging, setIsDragging] = useState(false)
	const [selectedFilter, setSelectedFilter] = useState<'all' | GetUploadedFileDto['type']>('all')
	const fileInputRef = useRef<HTMLInputElement>(null)

	const filteredDocuments =
		selectedFilter === 'all' ? documents : documents?.filter((doc) => doc.type === selectedFilter)

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
		setSelectedDraftFiles((prev) => [...files, ...prev])
	}

	const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const files = Array.from(e.target.files)
			const size = files.reduce((acc, file) => acc + file.size, 0)
			if (size > 50 * 1024 * 1024) {
				toast.error('Tổng kích thước file vượt quá 50MB. Vui lòng chọn lại.', { richColors: true })
				return
			}
			setSelectedDraftFiles((prev) => [...files, ...prev])
		}
	}
	const handleUpload = async () => {
		try {
			const res = await lecturerUploadFiles({
				topicId: group.activeGroup?.topicId || '',
				files: selectedDraftFiles
			}).unwrap()
			setDocuments(res)
			toast.success('Tải lên thành công!', { richColors: true })
		} catch (error) {
			console.error('Failed to upload files:', error)
			toast.error('Tải lên thất bại. Vui lòng thử lại.', { richColors: true })
		}
		setSelectedDraftFiles([])
	}

	const formatFileSize = (bytes: number): string => {
		if (bytes === 0) return '0 Bytes'
		const k = 1024
		const sizes = ['Bytes', 'KB', 'MB', 'GB']
		const i = Math.floor(Math.log(bytes) / Math.log(k))
		return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
	}

	const handleDeleteConfirm = async () => {
		try {
			await lecturerDeleteFiles({ topicId: group.activeGroup?.topicId || '', fileIds: deletingDocumentIds }).then(
				() => {
					setDocuments((prev) => prev.filter((doc) => !deletingDocumentIds.includes(doc._id)))
					setDeletingDocumentIds([])
					setIsOpenDeleteModal(false)
				}
			)
			toast.success('Xóa thành công!', { richColors: true })
		} catch (error) {
			console.error('Failed to delete files:', error)
			toast.error('Xóa thất bại. Vui lòng thử lại.', { richColors: true })
		}
	}

	const filters = [
		{ key: 'all' as const, label: 'Tất cả', count: documents?.length ?? 0 },
		{
			key: 'pdf' as const,
			label: 'PDF',
			count: documents?.filter((d) => d.type === 'pdf').length ?? 0
		},
		{
			key: 'doc' as const,
			label: 'DOC',
			count: documents?.filter((d) => d.type === 'doc').length ?? 0
		},
		{
			key: 'image' as const,
			label: 'Hình ảnh',
			count: documents?.filter((d) => d.type === 'image').length ?? 0
		}
	]
	const handleDraftFile = (index: number) => {
		setSelectedDraftFiles((prev) => prev.filter((_, i) => i !== index))
	}
	const handleEditingDraftFile = (index: number, input: string) => {
		setSelectedDraftFiles((prev) =>
			prev.map((file, i) => {
				if (i !== index) return file
				return new (window as any).File([file], input, {
					type: file.type,
					lastModified: file.lastModified
				}) as File
			})
		)
	}
	const handleDownloadAllFiles = async () => {
		try {
			const blob = await downloadZip({ topicId: group.activeGroup?.topicId || '' }).unwrap()

			// Tạo URL và trigger download
			const url = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = url
			link.download = `Tài liệu-${Date.now()}.zip`
			document.body.appendChild(link)
			link.click()

			// Cleanup
			link.remove()
			window.URL.revokeObjectURL(url)
		} catch (error) {
			console.error('Download failed:', error)
			toast.error('Tải xuống thất bại!', { richColors: true })
		}
	}
	return (
		<div className='h-[calc(100vh-10rem)] space-y-6 overflow-y-auto bg-work p-6'>
			{/* Upload Area */}
			<div>
				<div
					onDragOver={handleDragOver}
					onDragLeave={handleDragLeave}
					onDrop={handleDrop}
					className={cn(
						'rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200',
						isDragging
							? 'border-primary bg-primary/5'
							: 'border-border hover:border-primary/50 hover:bg-accent/50'
					)}
				>
					<input
						ref={fileInputRef}
						type='file'
						multiple
						onChange={handleFileInput}
						className='hidden'
						accept='.pdf,.doc,.docx,.png,.jpg,.jpeg,.gif,.txt,.xlsx,.pptx'
					/>
					<div className='flex flex-col items-center gap-3'>
						<div
							className={cn(
								'rounded-full p-4 transition-colors',
								isDragging ? 'bg-primary/10' : 'bg-secondary'
							)}
						>
							<Upload
								className={cn(
									'h-8 w-8 transition-colors',
									isDragging ? 'text-primary' : 'text-muted-foreground'
								)}
							/>
						</div>
						<div>
							<p className='font-medium text-foreground'>
								Kéo thả file vào đây hoặc{' '}
								<button
									onClick={() => fileInputRef.current?.click()}
									className='text-primary hover:underline'
								>
									chọn file
								</button>
							</p>
							<p className='mt-1 text-sm text-muted-foreground'>
								Hỗ trợ: PDF, DOC, DOCX, PNG, JPG, XLSX, PPTX (tối đa 50MB)
							</p>
						</div>
					</div>
				</div>
				{
					<Button
						onClick={handleUpload}
						className='mt-2 h-fit bg-blue-600 px-2 py-1'
						disabled={selectedDraftFiles.length === 0 || isUploading}
					>
						<UploadIcon className='h-4 w-4' />
						Tải lên tất cả
					</Button>
				}
				<div className='mt-2 max-h-[450px] space-y-2'>
					{selectedDraftFiles.map((file, index) => (
						<Editting
							key={index}
							file={file}
							index={index}
							onRemoveDraftFile={() => handleDraftFile(index)}
							isUploading={isUploading}
							onEditting={(input: string) => handleEditingDraftFile(index, input)}
						/>
					))}
				</div>
			</div>

			{/* Filters */}
			<div className='flex flex-wrap items-center gap-2'>
				{filters.map((filter) => (
					<button
						key={filter.key}
						onClick={() => setSelectedFilter(filter.key)}
						className={cn(
							'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
							selectedFilter === filter.key
								? 'bg-primary text-primary-foreground'
								: 'bg-secondary text-muted-foreground hover:text-foreground'
						)}
					>
						{filter.label} ({filter.count})
					</button>
				))}
				<Button className='h-fit px-2 py-1' onClick={handleDownloadAllFiles} title='Tải file zip'>
					{isDownloading ? <Loader2 className='animate-spin' /> : <Download className='h-4 w-4' />}
				</Button>
			</div>

			{/* Documents List */}
			<div className='space-y-3'>
				<div className='flex items-center justify-between'>
					<h4 className='flex items-center gap-2 font-semibold text-foreground'>
						<FolderOpen className='h-5 w-5 text-primary' />
						Tài liệu tham khảo
					</h4>
					<div className='flex items-center justify-center gap-2'>
						{isChoosingFiles ? (
							<>
								<Button
									className='hover:bg-gray-550 h-fit bg-gray-500 px-2 py-1'
									onClick={() => {
										setIsChoosingFiles(false)
										setDeletingDocumentIds([])
									}}
								>
									Hủy{' '}
								</Button>
								<Button
									disabled={deletingDocumentIds.length === 0}
									className='h-fit bg-red-500 px-2 py-1 text-white'
									onClick={() => {
										setIsOpenDeleteModal(true)
									}}
								>
									Xóa{' '}
								</Button>
							</>
						) : (
							<>
								<Button className='h-fit px-2 py-1' onClick={() => setIsChoosingFiles(true)}>
									Chọn nhiều
								</Button>
							</>
						)}

						<span className='text-sm text-muted-foreground'>{filteredDocuments?.length ?? 0} tài liệu</span>
					</div>
				</div>

				{filteredDocuments?.length === 0 ? (
					<div className='rounded-xl border border-border bg-card p-8 text-center'>
						<File className='mx-auto mb-3 h-12 w-12 text-muted-foreground' />
						<p className='text-muted-foreground'>Chưa có tài liệu nào</p>
					</div>
				) : (
					<div className='grid gap-3'>
						{filteredDocuments?.map((doc) => (
							<div
								key={doc._id}
								className='group flex items-center gap-4 rounded-xl border border-border bg-card p-4 transition-shadow hover:shadow-md'
							>
								{isChoosingFiles && (
									<Checkbox
										checked={deletingDocumentIds.includes(doc._id)}
										onCheckedChange={(checked) => {
											if (checked) {
												setDeletingDocumentIds([...deletingDocumentIds, doc._id])
											} else {
												setDeletingDocumentIds(
													deletingDocumentIds.filter((id) => id !== doc._id)
												)
											}
										}}
									/>
								)}
								<div className='shrink-0 rounded-lg bg-secondary p-3'>{getFileIcon(doc.type)}</div>

								<div className='min-w-0 flex-1'>
									<p className='truncate font-medium text-foreground'>{doc.fileNameBase}</p>
									<div className='mt-1 flex items-center gap-3 text-sm text-muted-foreground'>
										<span>{formatFileSize(doc.size)}</span>
										<span>•</span>
										<span>{doc.actor.fullName}</span>
										<span>•</span>
										<span>{new Date(doc.created_at).toLocaleString('vi-VN')}</span>
									</div>
								</div>

								{!isChoosingFiles && (
									<div className='flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100'>
										<button
											className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground'
											onClick={() => {
												downloadFileWithURL(`${baseUrl}/${doc.fileUrl}`, doc.fileNameBase)
											}}
										>
											<Download className='h-4 w-4' />
										</button>
										<button
											onClick={() => {
												setIsOpenDeleteModal(true)
												setDeletingDocumentIds([doc._id])
											}}
											className='rounded-lg p-2 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
										>
											<Trash2 className='h-4 w-4' />
										</button>
									</div>
								)}
							</div>
						))}
					</div>
				)}
			</div>
			{isDeleteModal && (
				<DeleteDocumentModal
					title={`${deletingDocumentIds.length} tài liệu`}
					isLoading={isDeleting}
					open={isDeleteModal}
					onOpenChange={setIsOpenDeleteModal}
					onConfirm={handleDeleteConfirm}
				/>
			)}
		</div>
	)
}
