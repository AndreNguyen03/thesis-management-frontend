import { Button } from '@/components/ui'
import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { toast } from '@/hooks/use-toast'
import { downloadFileWithURL, splitFileName } from '@/lib/utils'

import { UploadFileTypes, type GetUploadedFileDto, type RenameFilesBody } from '@/models/file.model'
import { useLecturerDeleteFilesMutation, useLecturerUploadFilesMutation } from '@/services/topicApi'
import { useRenameFilesMutation } from '@/services/uploadfilesApi'

import { formatFileSize } from '@/utils/format-file-size'
import { Download, FileText, FolderPen, Loader2, User, X } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { file } from 'zod'

interface ManageUploadFileModalProps {
	topicId: string
	openFileModal: boolean
	setOpenFileModal: React.Dispatch<React.SetStateAction<boolean>>
	files: GetUploadedFileDto[]
	onRefetch: () => void
	isEditing?: boolean
}
const ManageUploadFileModal = ({
	topicId,
	openFileModal,
	setOpenFileModal,
	files,
	onRefetch,
	isEditing
}: ManageUploadFileModalProps) => {
	const baseUrl = import.meta.env.VITE_MINIO_DOWNLOAD_URL_BASE

	const [selectedFiles, setSelectedFiles] = useState<File[]>([])
	const [deleteFileIds, setDeleteFileIds] = useState<string[]>([])
	const [errorMessage, setErrorMessage] = useState<string | null>(null)
	//Sửa tên file
	//trong trường hợp file này đã upload
	//Luuw state tên mới cho file đã upload
	const [renameFiles, setRenameFiles] = useState<RenameFilesBody[]>([])
	// lưu trạng thái input đang rename
	const [editingFileId, setEditingFileId] = useState<string | null>(null)
	//lưu giá trị mới
	const [editingValue, setEditingValue] = useState<string>('')

	//Tải lên nhiều file
	const [uploadFiles, { isLoading: isUploading }] = useLecturerUploadFilesMutation()
	// Xóa file
	const [deleteFiles, { isLoading: isDeleting }] = useLecturerDeleteFilesMutation()
	// Đổi tên file
	const [renameFilesMutation, { isLoading: isRenaming }] = useRenameFilesMutation()
	// Handle file section
	const [fileNames, setFileNames] = useState<string[]>([])

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		if (e.target.files) {
			const filesArr = Array.from(e.target.files)
			// Cộng dồn file đã chọn trước đó
			for (let i = 0; i < filesArr.length; i++) {
				if (
					selectedFiles.findIndex((f) => f.name === filesArr[i].name) !== -1 ||
					files.findIndex((f) => f.fileNameBase === filesArr[i].name) !== -1
				) {
					setErrorMessage(`File "${filesArr[i].name}" đã được chọn hoặc đã tồn tại.`)
					return
				}
			}
			setSelectedFiles((prev) => [...prev, ...filesArr])
			setFileNames((prev) => [...prev, ...filesArr.map((f) => f.name)])
			setErrorMessage(null)
		}
	}
	// xử lý việc lưu thay đổi (upload + delete)
	const handleSave = async () => {
		await Promise.all([
			deleteFileIds.length > 0 ? deleteFiles({ topicId: topicId, fileIds: deleteFileIds }).unwrap() : null,
			selectedFiles.length > 0 ? uploadFiles({ topicId: topicId, files: selectedFiles }).unwrap() : null,
			renameFiles.length > 0 ? renameFilesMutation(renameFiles).unwrap() : null
		])
		toast({ title: 'Thành công', description: 'Cập nhật tài liệu thành công' })
		setSelectedFiles([])
		setFileNames([])
		setDeleteFileIds([])
		onRefetch()
		setRenameFiles([])
		setErrorMessage(null)
	}
	const renderRelatedFile = (files: GetUploadedFileDto[]) => {
		return (
			<div className='grid grid-cols-1 gap-2'>
				{/* Nút tải lên file */}
				<div className='mb-4 flex flex-col gap-2'>
					<label className='font-medium'>Tải file lên</label>
					<div className='flex w-full gap-4'>
						<input
							type='file'
							multiple
							onChange={handleFileChange}
							className='rounded border px-2 py-1'
							disabled={isUploading}
						/>
					</div>
					{errorMessage && <p className='text-sm text-red-600'>{errorMessage}</p>}
				</div>

				{/* Hiển thị file đã chọn */}

				{selectedFiles.length > 0 && (
					<>
						<div className='flex items-center gap-2'>
							<span className='font-semibold'>Chuẩn bị tải lên</span>
						</div>
						<div className='mt-2 flex flex-col gap-2'>
							{selectedFiles.map((file, idx) => (
								<div key={file.name + idx} className='flex items-center gap-2'>
									<input
										type='text'
										value={fileNames[idx]}
										onChange={(e) => {
											const newName = e.target.value.trim()
											// Kiểm tra trùng tên
											const isDuplicate =
												fileNames.some((name, i) => i !== idx && name === newName) ||
												files.some((f) => f.fileNameBase === newName)

											if (isDuplicate) {
												setErrorMessage(`Tên file "${newName}" bị trùng.`)
												return
											}
											const newNames = [...fileNames]
											newNames[idx] = newName
											setFileNames(newNames)
										}}
										className='w-1/2 rounded border px-2 py-1'
									/>
									<span className='text-[13px] font-normal text-gray-400'>
										{formatFileSize(file.size)}
									</span>

									<Button
										variant='outline'
										size='sm'
										onClick={() => {
											setSelectedFiles(selectedFiles.filter((_, i) => i !== idx))
											setFileNames(fileNames.filter((_, i) => i !== idx))
										}}
									>
										<X className='h-4 w-4' />
									</Button>
								</div>
							))}
						</div>
					</>
				)}
				<span className='font-semibold'>Đã tải lên</span>
				{files.length > 0 &&
					files.map((file) => {
						if (deleteFileIds.includes(file._id)) {
							return null
						}
						const renameObj = renameFiles.find((f) => f.fileId === file._id)
						const displayName = renameObj ? renameObj.newFileName : file.fileNameBase
						const { name, ext } = splitFileName(displayName)
						switch (file.fileType) {
							case UploadFileTypes.DOCUMENT:
								return (
									<div key={file._id} className='flex items-center gap-3 py-1'>
										{editingFileId === file._id ? (
											<>
												<input
													type='text'
													autoFocus
													value={splitFileName(editingValue).name}
													onChange={(e) => setEditingValue(e.target.value)}
													onBlur={() => {
														setEditingFileId(null)
														if (
															editingValue.trim() &&
															editingValue + ext !== file.fileNameBase
														) {
															setRenameFiles((prev) => {
																const filtered = prev.filter(
																	(f) => f.fileId !== file._id
																)
																return [
																	...filtered,
																	{
																		fileId: file._id,
																		newFileName: editingValue.trim() + ext
																	}
																]
															})
														}
													}}
													className='w-1/2 rounded border px-2 py-1'
												/>
												<span className='ml-1'>{ext}</span>
											</>
										) : (
											<span
												className='cursor-pointer hover:underline'
												onDoubleClick={() => {
													setEditingFileId(file._id)
													setEditingValue(name)
												}}
											>
												{displayName}
											</span>
										)}

										<span className='text-xs text-gray-500'>{formatFileSize(file.size)}</span>
										<span className='text-xs text-gray-500'>
											- {new Date(file.created_at).toLocaleString('vi-VN')} bởi
										</span>
										<div className='flex items-center gap-1'>
											<span className='text-sm hover:underline'>{file.actor.fullName}</span>
											{file.actor.avatarUrl ? (
												<img
													src={file.actor.avatarUrl}
													alt={file.actor.fullName}
													className='ml-1 h-5 w-5 rounded-full object-cover'
												/>
											) : (
												<div className='rounded-full bg-gray-100 p-1'>
													<User className='h-3 w-3 text-primary' />
												</div>
											)}
										</div>
										<div
											className='rounded-sm p-1 hover:cursor-pointer hover:bg-gray-200'
											onClick={() => {
												downloadFileWithURL(`${baseUrl}/${file.fileUrl}`, file.fileNameBase)
											}}
										>
											<Download className='h-4 w-4' />
										</div>
										<Button
											variant='outline'
											size='sm'
											disabled={isDeleting}
											onClick={() => setDeleteFileIds([...deleteFileIds, file._id])}
										>
											Xóa
										</Button>
									</div>
								)
							case UploadFileTypes.URL:
								return (
									<div key={file._id} className='flex items-center gap-2'>
										<a
											href={file.fileUrl}
											target='_blank'
											rel='noopener noreferrer'
											className='hover:pointer m-0 flex items-center gap-2 p-0 text-green-600 hover:underline'
											title='Mở liên kết'
										>
											<FileText className='h-4 w-4' />
											<span>{file.fileNameBase || file.fileUrl}</span>
										</a>
									</div>
								)
						}
					})}
				{files.length === 0 && <span> Chưa có tài liệu tham khảo nào được tải lên</span>}
			</div>
		)
	}
	//không lưu trạng thái cũ
	useEffect(() => {
		if (!openFileModal) {
			setSelectedFiles([])
			setFileNames([])
			setDeleteFileIds([])
			setErrorMessage(null)
		}
	}, [openFileModal])
	return (
		<Dialog open={openFileModal} onOpenChange={setOpenFileModal}>
			<DialogContent className='min-h-fit min-w-fit max-w-3xl'>
				<h4 className='mb-2 text-lg font-semibold'>Quản lý tài liệu tham khảo</h4>
				{/* Gọi lại renderRelatedFile ở đây, hoặc tách logic upload/xóa file vào modal */}
				{renderRelatedFile(files)}
				<Button
					onClick={handleSave}
					disabled={
						isUploading ||
						(selectedFiles.length === 0 && deleteFileIds.length === 0 && renameFiles.length === 0)
					}
					variant='default'
					className='w-fit'
				>
					{isUploading ? <Loader2 className='mr-2 h-4 w-4 animate-spin' /> : null}
					Lưu
				</Button>
			</DialogContent>
		</Dialog>
	)
}

export default ManageUploadFileModal
