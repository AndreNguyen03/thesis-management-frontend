import { Badge, Button, Input } from '@/components/ui'
import { useNavigate, useParams } from 'react-router-dom'

import { Calendar, ChevronLeft, Clock, Download, Edit2, Eye, FileText, Loader2, Save, User, X } from 'lucide-react'
import {
	useGetTopicByIdQuery,
	useLecturerDeleteFileMutation,
	useLecturerUploadFilesMutation,
	useSaveTopicMutation,
	useUnsaveTopicMutation
} from '../../../../services/topicApi'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { UploadFileTypes, type GetUploadedFileDto } from '@/models/file.model'
import { formatFileSize } from '@/utils/format-file-size'
import { PhaseBadge } from '@/components/topic/phase-badege'
import { StatusBadge } from '@/components/topic/status-badege'
import { Label } from '@/components/ui/label'
import { TopicTypeTransfer, type ITopicDetail, type TopicType } from '@/models/topic.model'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { toast } from '@/hooks/use-toast'
import { useCreateRegistrationMutation, useDeleteRegistrationMutation } from '@/services/registrationApi'
import { getErrorMessage } from '@/utils/catch-error'
import { useAppSelector } from '@/store'
import ManageUploadFileModal from './components/ManageUploadFileModal'
import { downloadFileWithURL } from '@/lib/utils'
import FieldsContainer from './components/FieldsContainer'
import type { GetFieldNameReponseDto } from '@/models'

export const TopicDetailContainer = () => {
	const { id } = useParams<{ id: string }>()
	const navigate = useNavigate()
	const [isEditing, setIsEditing] = useState(false)
	// Quản lý dialog quản lý file tìa liệu
	const [openFileModal, setOpenFileModal] = useState(false)
	// Call the query hook unconditionally but skip fetching when no id is present
	const { data: topic, isLoading, refetch } = useGetTopicByIdQuery({ id: id! }, { skip: !id })
	const [editedTopic, setEditedTopic] = useState<ITopicDetail>(topic as ITopicDetail)

	const user = useAppSelector((state) => state.auth.user)
	//Actions for registration adn saving
	const [createRegistration, { isLoading: isLoadingRegister }] = useCreateRegistrationMutation()
	const [deleteRegistration, { isLoading: isLoadingUnregister }] = useDeleteRegistrationMutation()
	const [unsaveTopic, { isLoading: isLoadingUnSave, isSuccess: isSuccessUnSave }] = useUnsaveTopicMutation()
	const [saveTopic, { isLoading: isLoadingSave, isSuccess: isSuccessSave }] = useSaveTopicMutation()
	const baseUrl = import.meta.env.VITE_MINIO_DOWNLOAD_URL_BASE

	// If no id was provided, render an error after hooks have been called
	if (!id) {
		return <div>Invalid topic id</div>
	}

	if (isLoading) {
		return <div>Loading...</div>
	}
	if (topic == null) {
		return <div>Topic not found</div>
	}

	const renderRelatedFile = (files: GetUploadedFileDto[]) => {
		return (
			<div className='grid grid-cols-1'>
				{/* Nút tải lên file */}
				{topic.files.map((file) => {
					switch (file.fileType) {
						case UploadFileTypes.DOCUMENT:
							return (
								<div key={file._id} className='flex items-center gap-3 py-1'>
									<a
										href={`${baseUrl}/${file.fileUrl}`}
										className='flex items-center gap-2 text-blue-600 hover:underline'
										title='Xem tài liệu'
										onClick={(e) => {
											e.preventDefault()
											const link = document.createElement('a')
											link.href = `${baseUrl}/${file.fileUrl}`
											link.download = file.fileNameBase
											document.body.appendChild(link)
											link.click()
											document.body.removeChild(link)
										}}
									>
										<FileText className='h-4 w-4' />
										<span>{file.fileNameBase}</span>
									</a>
									<div
										className='rounded-sm p-1 hover:cursor-pointer hover:bg-gray-200'
										onClick={() => {
											downloadFileWithURL(`${baseUrl}/${file.fileUrl}`, file.fileNameBase)
										}}
									>
										<Download className='h-4 w-4' />
									</div>
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
			</div>
		)
	}
	const renderActionbButtons = () => {
		return (
			<div className='flex flex-col gap-1 sm:flex-row'>
				{/* Render nút bấm cho sinh viên */}
				{user && (
					<>
						{user.role === 'student' && (
							<Button
								disabled={isLoadingRegister || isLoadingUnregister}
								variant='destructive'
								className='w-fit'
								onClick={() => {
									toggleRegistration()
								}}
							>
								{isLoadingRegister || isLoadingUnregister ? <Loader2 /> : null}
								{topic.isRegistered ? 'Hủy đăng ký' : 'Đăng ký đề tài'}
							</Button>
						)}
						<Button
							disabled={isLoadingSave || isLoadingUnSave}
							variant={topic.isSaved ? 'yellow' : 'gray'}
							onClick={toggleSaveTopic}
						>
							{isLoadingSave || isLoadingUnSave ? <Loader2 /> : null}
							{topic.isSaved ? 'Bỏ lưu' : 'Lưu đề tài'}
						</Button>
					</>
				)}
			</div>
		)
	}

	const handleEdit = () => {
		setIsEditing(true)
		setEditedTopic(topic)
	}

	const handleCancel = () => {
		setIsEditing(false)
		setEditedTopic(topic)
	}

	const handleSave = () => {
		// setTopic(editedTopic)
		// setIsEditing(false)
		// toast.success('Đã lưu thay đổi thành công')
	}

	const handleInputChange = (field: keyof ITopicDetail, value: any) => {
		setEditedTopic((prev) => ({ ...prev, [field]: value }))
	}
	const currentTopic = isEditing ? editedTopic : topic

	const toggleRegistration = async () => {
		if (topic.isRegistered) {
			try {
				await deleteRegistration({ topicId: topic._id }).unwrap()
				toast({
					title: 'Thành công',
					description: 'Hủy đăng ký đề tài thành công'
				})
				refetch()
			} catch (error) {
				console.error('Error during cancel registration toggle:', error)

				toast({
					title: 'Lỗi',
					description: getErrorMessage(error),
					variant: 'destructive'
				})
			}
		} else {
			try {
				await createRegistration({ topicId: topic._id }).unwrap()
				toast({
					title: 'Thành công',
					description: 'Đăng ký đề tài thành công'
				})
				refetch()
			} catch (error) {
				console.error('Error during registration toggle:', error)
				toast({
					title: 'Lỗi',
					description: getErrorMessage(error),
					variant: 'destructive'
				})
			}
		}
		refetch()
	}
	const toggleSaveTopic = async () => {
		try {
			if (topic.isSaved) {
				await unsaveTopic({ topicId: topic._id }).unwrap()
				toast({ title: 'Thành công', description: 'Bỏ lưu đề tài thành công' })
			} else {
				await saveTopic({ topicId: topic._id }).unwrap()
				toast({ title: 'Thành công', description: 'Lưu đề tài thành công' })
			}
			refetch() // cập nhật lại dữ liệu
		} catch (error) {
			toast({ title: 'Lỗi', description: getErrorMessage(error), variant: 'destructive' })
		}
	}
	// Hàm xử lý khi field thay đổi
	const handleFieldsChange = (newFields: GetFieldNameReponseDto[]) => {
		setEditedTopic((prev) => ({
			...prev,
			fields: newFields // Cập nhật trực tiếp vào object editedTopic
		}))
	}
	return (
		<Dialog open={true}>
			<DialogContent hideClose={true} className='h-screen rounded-xl bg-[#F2F4FF] p-8 sm:min-w-full'>
				<div className='flex flex-col gap-4'>
					<div className='px-4'>
						<Button variant='back' className='w-fit border border-gray-300' onClick={() => navigate(-1)}>
							<ChevronLeft className='size-6' />
							<p>Quay lại</p>
						</Button>
					</div>
					{/* Nội dung */}
					<div className='grid space-x-5 px-4 md:grid-cols-6'>
						{/* Nọi dung bên trái */}
						<div
							style={{ maxHeight: 'calc(100vh - 110px)' }}
							className='col-span-4 grid max-h-screen min-h-[500px] gap-4 overflow-y-auto pr-5 sm:col-span-4'
						>
							{/* các tag */}
							<div className='flex flex-wrap space-x-1'>
								<Badge variant='gray' className='h-fit text-sm'>
									<p>{TopicTypeTransfer[currentTopic.type as TopicType].name}</p>
								</Badge>
								{user && user.role === 'student' && (
									<Badge variant='destructive' className='h-fit text-sm'>
										<p>{currentTopic.isRegistered ? 'Đã đăng ký' : 'Chưa đăng ký'}</p>
									</Badge>
								)}
							</div>
							{/* Tiêu đề */}
							{isEditing ? (
								<div className='space-y-4'>
									<div>
										<Label>Tên đề tài (Tiếng Việt)</Label>
										<Input
											value={currentTopic.titleVN}
											onChange={(e) => handleInputChange('titleVN', e.target.value)}
											className='h-auto py-3 text-2xl font-bold'
										/>
									</div>
									<div>
										<Label>Tên đề tài (Tiếng Anh)</Label>
										<Input
											value={currentTopic.titleEng}
											onChange={(e) => handleInputChange('titleEng', e.target.value)}
											className='h-auto py-2 text-lg'
										/>
									</div>
								</div>
							) : (
								<div>
									{/* Tiêu đề */}
									<DialogTitle className='mb-2 text-3xl font-bold text-primary'>
										{currentTopic.titleVN}
									</DialogTitle>
									<DialogTitle className='mb-2 text-xl font-semibold text-primary'>
										{currentTopic.titleEng}
									</DialogTitle>
									{/* Thời gian tạo và cập nhật */}
									<div className='flex items-center gap-4 text-sm text-muted-foreground'>
										<div className='flex items-center gap-1'>
											<Calendar className='h-4 w-4' />
											<span>Tạo: {new Date(topic.createdAt || '').toLocaleString('vi-VN')}</span>
										</div>
										<div className='flex items-center gap-1'>
											<Clock className='h-4 w-4' />
											<span>
												Cập nhật: {new Date(topic.updatedAt || '').toLocaleString('vi-VN')}
											</span>
										</div>
									</div>
								</div>
							)}

							<div className='flex gap-4'>
								{topic.isEditable && (
									<div className='flex gap-2'>
										{!isEditing ? (
											<Button onClick={handleEdit} variant='default'>
												<Edit2 className='mr-2 h-4 w-4' />
												Chỉnh sửa
											</Button>
										) : (
											<>
												<Button onClick={handleSave} variant='default'>
													<Save className='mr-2 h-4 w-4' />
													Lưu
												</Button>
												<Button onClick={handleCancel} variant='outline'>
													<X className='mr-2 h-4 w-4' />
													Hủy
												</Button>
											</>
										)}
									</div>
								)}
							</div>
							<div className='rounded-md border border-gray-300 bg-white px-8 py-6'>
								<h4 className='mb-2 text-lg font-semibold text-gray-800'>Mô tả chi tiết</h4>
								{isEditing ? (
									<Textarea
										value={currentTopic.description}
										onChange={(e) => handleInputChange('description', e.target.value)}
										className='min-h-[150px]'
									/>
								) : (
									<p className='rounded-lg bg-gray-50 text-lg text-gray-700'>{topic.description}</p>
								)}
							</div>
							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
								<div className='rounded-md border border-gray-300 bg-white px-8 py-6'>
									<FieldsContainer
										selectedFields={isEditing ? editedTopic.fields : topic.fields}
										isEditing={isEditing}
										onSelectionChange={handleFieldsChange}
									/>
								</div>
								<div className='rounded-md border border-gray-300 bg-white px-8 py-6'>
									<h4 className='mb-2 text-lg font-semibold text-gray-800'>Yêu cầu kỹ năng</h4>
									<div className='flex flex-wrap gap-2'>
										{topic.requirements.map((req) => (
											<Badge key={req._id} variant='secondary' className={'text-md px-3 py-1'}>
												{req.name}
											</Badge>
										))}
									</div>
								</div>
							</div>
							<div className='flex flex-col space-y-2 rounded-md border border-gray-300 bg-white p-8'>
								<div>
									<span className='text-lg font-medium'>Tài liệu tham khảo</span>
									{currentTopic.isEditable && (
										<Button variant='link' size='sm' onClick={() => setOpenFileModal(true)}>
											Quản lý tài liệu
										</Button>
									)}
								</div>

								{topic.files.length > 0 ? (
									renderRelatedFile(topic.files)
								) : (
									<span> Chưa có tài liệu tham khảo nào được tải lên</span>
								)}
							</div>
							<div className='gap-4 space-y-4 rounded-md border border-gray-300 bg-white p-8'>
								<span className='text-lg font-medium'>Lịch sử thay đổi trạng thái</span>
								<div className='space-y-4'>
									{topic.phaseHistories.map((history, idx) => {
										if (idx > 0)
											return (
												<div key={history._id}>
													<div className='flex items-start gap-3'>
														<div className='mt-1'>
															<div className='h-2 w-2 rounded-full bg-primary' />
														</div>
														<div className='flex-1'>
															<div className='mb-1 flex items-center gap-2'>
																<PhaseBadge phase={history.phaseName} />
																<StatusBadge status={history.status} />
																{idx > 0 &&
																	history.actor._id ===
																		topic.phaseHistories[idx - 1].actor._id &&
																	Math.abs(
																		new Date(history.createdAt).getTime() -
																			new Date(
																				topic.phaseHistories[idx - 1].createdAt
																			).getTime()
																	) < 6000 && (
																		<span className='ml-2 text-xs text-primary'>
																			Đã tạo và nộp cùng lúc
																		</span>
																	)}
															</div>
															<div className='flex items-center gap-1'>
																<div className='flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
																	{history.actor.avatarUrl ? (
																		<img
																			src={history.actor.avatarUrl}
																			alt={history.actor.fullName}
																			className='h-4 w-4 rounded-full object-cover'
																		/>
																	) : (
																		<User className='h-4 w-4 text-primary' />
																	)}
																</div>
																<p className='text-sm text-muted-foreground'>
																	{history.actor.fullName} •{' '}
																	{new Date(history.createdAt || '').toLocaleString(
																		'vi-VN'
																	)}
																</p>
															</div>

															{history.notes && (
																<p className='mt-1 text-sm text-foreground'>
																	{history.notes}
																</p>
															)}
														</div>
													</div>
													{idx < topic.phaseHistories.length - 1 && (
														<div className='my-2 ml-1 h-6 w-0.5 bg-border' />
													)}
												</div>
											)
									})}
								</div>
							</div>
						</div>
						{/* Nội dung bên phải */}
						<div
							className='col-span-2 flex flex-col gap-4 overflow-y-auto'
							style={{ maxHeight: 'calc(100vh - 110px)' }}
						>
							{/* Actions buttton */}
							{renderActionbButtons()}
							<div className='h-fit space-y-4 rounded-md border border-gray-300 bg-white p-8'>
								<h4 className='mb-2 text-lg font-semibold text-gray-800'>Thông tin cơ bản</h4>
								<div>
									<Label className='text-muted-foreground'>Loại đề tài</Label>
									{isEditing && topic.isEditable ? (
										<select
											value={topic.type}
											onChange={(e) => handleInputChange('type', e.target.value as TopicType)}
											className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2'
										>
											<option value='Khóa luận tốt nghiệp'>Khóa luận tốt nghiệp</option>
											<option value='Nghiên cứu khoa học'>Nghiên cứu khoa học</option>
										</select>
									) : (
										<p className='font-medium text-foreground'>
											{TopicTypeTransfer[topic.type as TopicType].name}
										</p>
									)}
								</div>
								<Separator />
								<div>
									<Label className='text-muted-foreground'>Chuyên ngành</Label>
									<p className='font-medium text-foreground'>{topic.major.name}</p>
								</div>
								<Separator />
								<div>
									<Label className='text-muted-foreground'>Số sinh viên tối đa</Label>
									{isEditing && topic.isEditable ? (
										<Input
											type='number'
											value={topic.maxStudents}
											onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
											className='mt-1'
										/>
									) : (
										<p className='font-medium text-foreground'>{topic.maxStudents}</p>
									)}
								</div>
							</div>
							{/* Thông tin đối tượng là sinh viên tham gia */}

							<div className='h-fit gap-4 space-y-4 rounded-md border border-gray-300 bg-white p-8'>
								<div className='flex'>
									<h4 className='mb-2 text-lg font-semibold text-gray-800'>Sinh viên đăng ký</h4>
									<h4 className='mb-1 ml-2 text-lg font-semibold text-blue-600'>{`(${currentTopic.students.length}/${topic.maxStudents})`}</h4>
								</div>
								<div className='flex flex-col gap-4'>
									{currentTopic.students.length > 0 ? (
										currentTopic.students.map((student) => (
											<div key={student._id} className='flex items-start gap-3'>
												<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
													{student.avatarUrl ? (
														<img
															src={student.avatarUrl}
															alt={student.fullName}
															className='h-10 w-10 rounded-full object-cover'
														/>
													) : (
														<User className='h-5 w-5 text-primary' />
													)}
												</div>
												<div className='min-w-0 flex-1'>
													<p className='font-medium text-foreground'>{`${student.fullName}`}</p>
													<p className='truncate text-sm text-muted-foreground'>
														{student.email}
													</p>
													<p className='text-xs text-muted-foreground'>
														{student.facultyName}
													</p>
												</div>
											</div>
										))
									) : (
										<p className='text-gray-600'>Chưa có sinh viên đăng ký</p>
									)}
								</div>
							</div>
							{/* Thông tin đối tượng là giảng viên tham gia */}
							<div className='h-fit gap-4 space-y-4 rounded-md border border-gray-300 bg-white p-8'>
								<div className='flex'>
									<h4 className='mb-2 text-lg font-semibold text-gray-800'>Giảng viên phụ trách</h4>
									<h4 className='mb-1 ml-2 text-lg font-semibold text-blue-600'>{`(${currentTopic.lecturers.length})`}</h4>
								</div>
								<div className='flex flex-col gap-4'>
									{currentTopic.lecturers.map((lecturer) => (
										<div key={lecturer._id} className='flex items-start gap-3'>
											<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
												{lecturer.avatarUrl ? (
													<img
														src={lecturer.avatarUrl}
														alt={lecturer.fullName}
														className='h-10 w-10 rounded-full object-cover'
													/>
												) : (
													<User className='h-5 w-5 text-primary' />
												)}
											</div>
											<div className='min-w-0 flex-1'>
												<p className='font-medium text-foreground'>
													{`${lecturer.title} ${lecturer.fullName}`}{' '}
													<span className='font-normal text-gray-500'>
														{lecturer.roleInTopic}
													</span>
												</p>

												<p className='truncate text-sm text-muted-foreground'>
													{lecturer.email}
												</p>
												<p className='text-xs text-muted-foreground'>{lecturer.facultyName}</p>
											</div>
										</div>
									))}
								</div>
							</div>

							{/* Điểm đánh giá */}
							{currentTopic.grade && currentTopic.grade.averageScore && (
								<div className='h-fit space-y-4 rounded-md border border-gray-300 bg-white p-8'>
									<div className='text-center'>
										<p className='text-4xl font-bold text-primary'>
											{currentTopic.grade.averageScore.toFixed(1)}
										</p>
										<p className='text-sm text-muted-foreground'>Điểm trung bình</p>
									</div>
									{currentTopic.grade.detailGrades.length > 0 && (
										<>
											<Separator />
											<div className='space-y-2'>
												{currentTopic.grade.detailGrades.map((grade, idx) => (
													<div key={grade._id} className='flex items-start justify-between'>
														<div>
															<p className='text-sm font-medium text-foreground'>
																Giảng viên {idx + 1}
															</p>
															{grade.note && (
																<p className='text-xs text-muted-foreground'>
																	{grade.note}
																</p>
															)}
														</div>
														<Badge variant='outline' className='font-bold'>
															{grade.score.toFixed(1)}
														</Badge>
													</div>
												))}
											</div>
										</>
									)}
								</div>
							)}
						</div>
					</div>
					<ManageUploadFileModal
						topicId={currentTopic._id}
						openFileModal={openFileModal}
						setOpenFileModal={setOpenFileModal}
						files={currentTopic.files}
						onRefetch={() => refetch()}
					/>
				</div>
			</DialogContent>
		</Dialog>
	)
}
