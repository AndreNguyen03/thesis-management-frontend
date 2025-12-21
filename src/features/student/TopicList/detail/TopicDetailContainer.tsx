import { Badge, Button, Input } from '@/components/ui'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

import {
	Calendar,
	ChevronLeft,
	CircleOff,
	Clock,
	Download,
	Edit2,
	Eye,
	File,
	FileText,
	History,
	Layers,
	Loader2,
	Plus,
	Save,
	ShieldAlert,
	Trash,
	User,
	X
} from 'lucide-react'
import {
	useDeleteTopicsMutation,
	useGetTopicByIdQuery,
	useSaveTopicMutation,
	useSetAllowManualApprovalMutation,
	useUnsaveTopicMutation,
	useUpdateTopicMutation
} from '../../../../services/topicApi'
import { useState } from 'react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/Dialog'
import { UploadFileTypes, type GetUploadedFileDto } from '@/models/file.model'
import { formatFileSize } from '@/utils/format-file-size'
import { PhaseBadge } from '@/components/topic/phase-badege'
import { StatusBadge } from '@/components/topic/status-badege'
import { Label } from '@/components/ui/label'
import { TopicStatus, TopicTypeTransfer, type ITopicDetail, type TopicType } from '@/models/topic.model'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/hooks/use-toast'
import { useCreateRegistrationMutation, useLeaveTopicMutation } from '@/services/registrationApi'
import { getErrorMessage } from '@/utils/catch-error'
import { useAppSelector } from '@/store'
import ManageUploadFileModal from './components/ManageUploadFileModal'
import { cn, downloadFileWithURL } from '@/lib/utils'
import FieldsContainer from './components/FieldsContainer'
import {
	StudentRegistrationStatus,
	type GetFieldNameReponseDto,
	type GetRequirementNameReponseDto,
	type UpdateTopicPayload
} from '@/models'
import RequirementContainer from './components/RequirementContainer'
import { useGetMajorsBySameFacultyIdQuery } from '@/services/major'
import RichTextEditor from '@/components/common/RichTextEditor'
import DOMPurify from 'dompurify'
import { Switch } from '@/components/ui/switch'
import RegistrationDetail from './modal/TopicRegistrationDetail'
import CancelRegistrationConfirmModal from './modal/CancelRegistrationConfirmModal'
import AddLecturerModal from './modal/AddLecturerModal'
import AddStudentModal from './modal/AddStudentModal'
import DeleteTopicModal from '@/features/lecturer/manage_topic/modal/delete-topic-modal'
import { RejectionBanner } from './components/RejectionBanner'
import { PeriodPhaseName } from '@/models/period.model'

export const TopicDetailContainer = () => {
	const { id } = useParams<{ id: string }>()

	const navigate = useNavigate()
	// //lấy thông tin kì hiện tại
	// const currentPeriod = useAppSelector((state) => state.period.currentPeriod)
	const [isEditing, setIsEditing] = useState(false)
	// Quản lý dialog quản lý file tìa liệu
	const [openFileModal, setOpenFileModal] = useState(false)

	// Call the query hook unconditionally but skip fetching when no id is present
	const { data: topic, isLoading, refetch } = useGetTopicByIdQuery({ id: id! }, { skip: !id })
	// lấy danh sách các major cùng thuộc một khoa với đề tài
	const { data: majorsOptions } = useGetMajorsBySameFacultyIdQuery(
		{ facultyId: topic?.major.facultyId || '', queries: { page: 1, limit: 0 } },
		{ skip: !isEditing }
	)
	const [editedTopic, setEditedTopic] = useState<ITopicDetail>(topic as ITopicDetail)
	const [openDeleteConfirmModal, setOpenDeleteConfirmModal] = useState(false)
	const user = useAppSelector((state) => state.auth.user)
	//Actions for registration adn saving
	const [createRegistration, { isLoading: isLoadingRegister }] = useCreateRegistrationMutation()
	const [leaveTopic, { isLoading: isLoadingUnregister }] = useLeaveTopicMutation()
	const [unsaveTopic, { isLoading: isLoadingUnSave, isSuccess: isSuccessUnSave }] = useUnsaveTopicMutation()
	const [saveTopic, { isLoading: isLoadingSave, isSuccess: isSuccessSave }] = useSaveTopicMutation()
	const [updateTopic, { isSuccess: isSuccessUpdate, isLoading: isLoadingUpdate }] = useUpdateTopicMutation()
	const [setAllowManualApproval, { isLoading: isLoadingManualApproval }] = useSetAllowManualApprovalMutation()
	//Thực hiện việc xóa đề tài
	const [deleteTopics, { isLoading: isLoadingDelete, isSuccess: isSuccessDelete }] = useDeleteTopicsMutation()
	const baseUrl = import.meta.env.VITE_MINIO_DOWNLOAD_URL_BASE
	// modal
	const [openConfirmModal, setOpenConfirmModal] = useState(false)
	// Modal xét duyệt đề tài đăng ký
	const [modalRegisterModalOpen, setModalRegisterModalOpen] = useState(false)
	//Modal hủy đăng ký
	const [openCancelRegistrationModal, setOpenCancelRegistrationModal] = useState(false)
	// If no id was provided, render an error after hooks have been called
	//Modal thêm giảng viên
	const [openAddLecturerModal, setOpenAddLecturerModal] = useState(false)

	//Modal thêm sinh viên
	const [openAddStudentModal, setOpenAddStudentModal] = useState(false)

	if (!id) {
		return <div>Invalid topic id</div>
	}

	if (isLoading) {
		return (
			<Dialog open>
				<DialogContent className='flex min-h-[200px] flex-col items-center justify-center'>
					<div className='flex w-full flex-col items-center gap-4'>
						<div className='h-16 w-16 animate-pulse rounded-full bg-gray-200'>
							<Loader2 className='h-8 w-8 animate-spin text-gray-400' />
							Đang tải
						</div>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
	if (topic == null) {
		return <div>Topic not found</div>
	}
	if (isSuccessDelete) {
		navigate(-1)
	}

	const renderRelatedFile = (files: GetUploadedFileDto[]) => {
		return (
			<div className='ml-4 grid grid-cols-1'>
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
										target='_blank'
										rel='noopener noreferrer'
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

	const handleEdit = () => {
		setIsEditing(true)
		setEditedTopic(topic)
	}

	const handleCancel = () => {
		setIsEditing(false)
		setEditedTopic(topic)
	}

	const handleSave = async () => {
		const periodId = localStorage.getItem('currentPeriodId')
		if (!periodId) {
			toast({
				title: 'Lỗi',
				description: 'Không tìm thấy kỳ hiện tại'
			})
			return
		}
		//Tạo mới instance thay đổi
		const newPayLoadTopic: UpdateTopicPayload = {
			titleVN: editedTopic.titleVN !== topic.titleVN ? editedTopic.titleVN : undefined,
			titleEng: editedTopic.titleEng !== topic.titleEng ? editedTopic.titleEng : undefined,
			description: editedTopic.description !== topic.description ? editedTopic.description : undefined,
			majorId: editedTopic.major._id !== topic.major._id ? editedTopic.major._id : undefined,
			maxStudents: editedTopic.maxStudents !== topic.maxStudents ? editedTopic.maxStudents : undefined,
			fieldIds: editedTopic.fields.map((field) => field._id),
			requirementIds: editedTopic.requirements.map((req) => req._id),
			type: editedTopic.type !== topic.type ? editedTopic.type : undefined
		}

		try {
			await updateTopic({ topicId: topic._id, periodId: periodId, body: newPayLoadTopic }).unwrap()
			setIsEditing(false)
			toast({
				title: 'Thành công',
				description: 'Cập nhật đề tài thành công'
			})
			refetch()
		} catch (error) {
			toast({
				title: 'Lỗi',
				description: 'Cập nhật đề tài thất bại',
				variant: 'destructive'
			})
		}
	}
	const handleDeleteTopics = async () => {
		try {
			await deleteTopics({ topicIds: [topic._id] }).unwrap()
			toast({
				title: 'Thành công',
				description: 'Xóa đề tài thành công!',
				variant: 'success'
			})
			refetch()
		} catch (error) {
			toast({
				title: 'Thất bại',

				description: 'Xóa đề tài thất bại. Vui lòng thử lại sau.',
				variant: 'destructive'
			})
		}
		setOpenDeleteConfirmModal(false)
	}

	const renderActionsButtons = () => {
		return (
			<>
				{/* Render nút bấm cho sinh viên */}
				{user && (
					<div className='flex gap-2'>
						{(() => {
							switch (user.role) {
								case 'student':
									return <></>
								case 'lecturer':
									return (
										<>
											{topic.isEditable && (
												<>
													{isEditing ? (
														<>
															<Button
																variant='outline'
																onClick={handleCancel}
																disabled={isLoadingUpdate}
															>
																<X className='h-4 w-4' />
																<span className='ml-2'>Hủy</span>
															</Button>
															<Button
																variant='default'
																onClick={() => setOpenConfirmModal(true)}
																disabled={isLoadingUpdate}
															>
																{isLoadingUpdate ? (
																	<Loader2 className='h-4 w-4 animate-spin' />
																) : (
																	<Save className='h-4 w-4' />
																)}
																<span className='ml-2'>Lưu</span>
															</Button>
														</>
													) : (
														<div className='flex gap-4'>
															<Button
																variant='default'
																onClick={handleEdit}
																className={'group'}
																disabled={
																	topic.currentStatus === TopicStatus.REJECTED ||
																	topic.currentStatus === TopicStatus.APPROVED ||
																	topic.currentPhase ===
																		PeriodPhaseName.OPEN_REGISTRATION ||
																	topic.currentPhase === PeriodPhaseName.EXECUTION
																}
															>
																<Edit2 className='h-4 w-4' />
																<span
																	className={cn(
																		'ml-2',
																		'hidden transition-transform duration-1000 group-hover:block'
																	)}
																>
																	Chỉnh sửa
																</span>
															</Button>
															{currentTopic.currentStatus === TopicStatus.DRAFT && (
																<div>
																	<Button
																		title='Xóa bản nháp'
																		variant='destructive'
																		onClick={() => setOpenDeleteConfirmModal(true)}
																		className='group'
																	>
																		<Trash className='h-4 w-4' />
																		<span className='ml-2 hidden transition-transform duration-1000 group-hover:block'>
																			Xóa bản nháp
																		</span>
																	</Button>
																</div>
															)}
														</div>
													)}
												</>
											)}
										</>
									)
								default:
									return <></>
							}
						})()}

						{/* Render nút bấm chung */}
					</div>
				)}
			</>
		)
	}
	const handleInputChange = (field: keyof ITopicDetail, value: any) => {
		setEditedTopic((prev) => ({ ...prev, [field]: value }))
	}
	const currentTopic = isEditing ? editedTopic : topic

	const toggleRegistration = async () => {
		if (topic.registrationStatus === StudentRegistrationStatus.PENDING) {
			try {
				await leaveTopic({ topicId: topic._id }).unwrap()
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
			if (!topic.registrationStatus)
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

	// Hàm xử lý khi requirement thay đổi
	const handleRequirementsChange = (newRequirements: GetRequirementNameReponseDto[]) => {
		setEditedTopic((prev) => ({
			...prev,
			requirements: newRequirements // Cập nhật trực tiếp vào object editedTopic
		}))
	}
	//Hàm xử lí xét duyệt thủ công
	// Thay đổi cờ allowManualApproval
	const handleManualApprovalChange = async (checked: boolean) => {
		try {
			await setAllowManualApproval({ topicId: topic._id, allow: checked })
			refetch()
		} catch {
			toast({ title: 'Thất bại', description: 'Có lỗi xảy ra!', variant: 'destructive' })
		}
	}

	//Xử lý đóng trang thêm sinh viên mở trang xem chi tiết đăng ký
	const handleGoToApproval = () => {
		setOpenAddStudentModal(false)
		setModalRegisterModalOpen(true)
	}
	const isAbleInDraftOrSubmitPhase =
		currentTopic.currentPhase === PeriodPhaseName.EMPTY ||
		currentTopic.currentPhase === PeriodPhaseName.SUBMIT_TOPIC
	const isAbleInOpenRegistrationPhase = currentTopic.currentPhase === PeriodPhaseName.OPEN_REGISTRATION
	return (
		<Dialog open={true}>
			<DialogContent hideClose={true} className='h-screen rounded-xl bg-[#F2F4FF] p-8 sm:min-w-full'>
				<div className='flex flex-col gap-4'>
					<div className='grid grid-cols-3 px-4'>
						<Button variant='back' className='w-fit border border-gray-300' onClick={() => navigate(-1)}>
							<ChevronLeft className='size-6' />
							<p>Quay lại</p>
						</Button>

						<div className='flex items-center'>
							{/* Actions buttton */}
							{renderActionsButtons()}
						</div>
					</div>
					{/* Nội dung */}
					<div className='grid space-x-5 px-4 md:grid-cols-6'>
						{/* Nọi dung bên trái */}
						<div
							style={{ maxHeight: 'calc(100vh - 110px)' }}
							className='col-span-4 grid max-h-screen min-h-[500px] gap-4 overflow-y-auto pr-5 sm:col-span-4'
						>
							{/* các tag */}
							{!isEditing && (
								<div className='flex flex-wrap space-x-1'>
									<Badge variant='gray' className='h-fit text-sm'>
										<p>{TopicTypeTransfer[currentTopic.type as TopicType].name}</p>
									</Badge>
									{user && user.role === 'student' && (
										<Badge variant='destructive' className='h-fit text-sm'>
											<p>
												{currentTopic.registrationStatus === 'pending'
													? 'Đã đăng ký'
													: 'Chưa đăng ký'}
											</p>
										</Badge>
									)}
								</div>
							)}
							{/* Tiêu đề */}
							{isEditing ? (
								<div className='space-y-4'>
									<div>
										<Label>Tên đề tài (Tiếng Việt)</Label>
										<Input
											value={currentTopic.titleVN}
											onChange={(e) => handleInputChange('titleVN', e.target.value)}
											className='h-auto py-3 font-bold'
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
										<Button
											disabled={isLoadingSave || isLoadingUnSave}
											variant={topic.isSaved ? 'yellow' : 'gray'}
											onClick={toggleSaveTopic}
										>
											{isLoadingSave || isLoadingUnSave ? (
												<Loader2 className='h-5 w-5 animate-spin' />
											) : (
												<Layers />
											)}
											{topic.isSaved ? 'Đã lưu' : 'Lưu trữ'}
										</Button>
									</div>
								</div>
							)}

							<div className='rounded-md border border-gray-300 bg-white px-8 py-6'>
								<h4 className='mb-2 text-lg font-semibold text-gray-800'>Mô tả chi tiết</h4>
								{isEditing ? (
									// CHẾ ĐỘ CHỈNH SỬA: Dùng CKEditor
									<div className='w-full'>
										<RichTextEditor
											value={currentTopic.description}
											onChange={(data) => handleInputChange('description', data)}
											placeholder='Nhập mô tả chi tiết về đề tài...'
										/>
									</div>
								) : (
									// CHẾ ĐỘ XEM: Render HTML đã được làm sạch
									<div
										className='prose max-w-none rounded-lg bg-gray-50 p-4 text-gray-700'
										// Sử dụng DOMPurify để đảm bảo an toàn, tránh XSS
										dangerouslySetInnerHTML={{
											__html: DOMPurify.sanitize(topic.description || '<p>Chưa có mô tả</p>')
										}}
									/>
								)}
							</div>
							<div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
								<div className='space-y-3 rounded-md border border-gray-300 bg-white px-8 py-6'>
									<FieldsContainer
										selectedFields={isEditing ? editedTopic.fields : topic.fields}
										isEditing={isEditing}
										onSelectionChange={handleFieldsChange}
									/>
								</div>
								<div className='space-y-3 rounded-md border border-gray-300 bg-white px-8 py-6'>
									<RequirementContainer
										selectedRequirements={isEditing ? editedTopic.requirements : topic.requirements}
										isEditing={isEditing}
										onSelectionChange={handleRequirementsChange}
									/>
								</div>
							</div>
							<div className='relative flex flex-col space-y-2 rounded-md border border-gray-300 bg-white p-8'>
								<div>
									<span className='text-lg font-medium'>Tài liệu tham khảo</span>
									<Button variant='link' size='sm' onClick={() => setOpenFileModal(true)}>
										Quản lý tài liệu
									</Button>
								</div>
								<>
									<Label className='flex items-center gap-2 text-base font-medium text-blue-800'>
										<File className='h-4 w-4' />
										File tham khảo
									</Label>
									{topic.files.length > 0 ? (
										renderRelatedFile(topic.files)
									) : (
										<span> Chưa có tài liệu tham khảo nào được tải lên</span>
									)}
								</>

								{isEditing && (
									<div className='absolute inset-0 z-10 flex items-center justify-center bg-white/80'>
										<CircleOff />
									</div>
								)}
							</div>
							<div className='relative gap-4 space-y-4 rounded-md border border-gray-300 bg-white p-8'>
								<span className='text-lg font-medium'>Lịch sử thay đổi trạng thái</span>
								<div className='space-y-4'>
									{topic.phaseHistories && topic.phaseHistories.slice(1).length > 0 ? (
										topic.phaseHistories.map((history, idx) => {
											if (
												idx === 0 &&
												user?.role === 'lecturer' &&
												user.userId === history.actor._id
											) {
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
																					topic.phaseHistories[idx - 1]
																						.createdAt
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

																	<p className='flex gap-2 text-sm text-muted-foreground'>
																		<span className='flex gap-1'>
																			{`${history.actor.title ? history.actor.title : ''} ${history.actor.fullName}`}{' '}
																			{user?.role === 'lecturer' &&
																				topic.registrationStatus ===
																					'approved' &&
																				history.actor._id === user.userId && (
																					<Badge variant='outlineBlue'>
																						{' '}
																						Bạn
																					</Badge>
																				)}
																		</span>
																		•{' '}
																		{new Date(
																			history.createdAt || ''
																		).toLocaleString('vi-VN')}
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
											}
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
																					topic.phaseHistories[idx - 1]
																						.createdAt
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

																	<p className='flex gap-2 text-sm text-muted-foreground'>
																		<span className='flex gap-1'>
																			{`${history.actor.title ? history.actor.title : ''} ${history.actor.fullName}`}{' '}
																			{user?.role === 'lecturer' &&
																				topic.registrationStatus ===
																					'approved' &&
																				history.actor._id === user.userId && (
																					<Badge variant='outlineBlue'>
																						{' '}
																						Bạn
																					</Badge>
																				)}
																		</span>
																		•{' '}
																		{new Date(
																			history.createdAt || ''
																		).toLocaleString('vi-VN')}
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
										})
									) : (
										<div className='flex flex-col items-center justify-center text-gray-400'>
											<History className='text-gray-500' />
											<p>Chưa có lịch sử thay đổi trạng thái nào.</p>
										</div>
									)}
								</div>
								{isEditing && (
									<div className='absolute inset-0 z-10 flex items-center justify-center bg-white/60'>
										<CircleOff />
									</div>
								)}
							</div>
						</div>
						{/* Nội dung bên phải */}
						<div
							className='col-span-2 flex flex-col gap-4 overflow-y-auto'
							style={{ maxHeight: 'calc(100vh - 110px)' }}
						>
							<RejectionBanner />

							<div className='h-fit space-y-4 rounded-md border border-gray-300 bg-white p-8'>
								<h4 className='mb-2 text-lg font-semibold text-gray-800'>Thông tin cơ bản</h4>
								<div>
									<Label className='text-muted-foreground'>Loại đề tài</Label>
									{isEditing ? (
										<select
											value={editedTopic.type}
											onChange={(e) => handleInputChange('type', e.target.value as TopicType)}
											className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2'
										>
											<option value='thesis'>Khóa luận tốt nghiệp</option>
											<option value='scientific_research'>Nghiên cứu khoa học</option>
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
									{isEditing ? (
										<select
											value={editedTopic.major._id}
											onChange={(e) =>
												handleInputChange(
													'major',
													majorsOptions?.data.find((major) => major._id === e.target.value)
												)
											}
											className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2'
										>
											{majorsOptions?.data.map((major) => (
												<option key={major._id} value={major._id}>
													{major.name}
												</option>
											))}
										</select>
									) : (
										<p className='font-medium text-foreground'>{topic.major.name}</p>
									)}
								</div>
								<Separator />
								<div>
									<Label className='text-muted-foreground'>Số sinh viên tối đa</Label>
									{isEditing ? (
										<Input
											type='number'
											value={editedTopic.maxStudents}
											onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
											className='mt-1 w-fit'
										/>
									) : (
										<p className='text-[20px] font-medium text-foreground'>{topic.maxStudents}</p>
									)}
								</div>
								{/* Xét duyệt thủ công */}
								{user?.role === 'lecturer' ? (
									<div className='flex flex-col gap-4'>
										<Label className='text-muted-foreground'>Xét duyệt đăng ký</Label>

										<div className='flex items-center space-x-2'>
											<Switch
												disabled={isLoadingManualApproval}
												checked={topic.allowManualApproval}
												onCheckedChange={(checked) => {
													handleManualApprovalChange(checked)
												}}
											/>
										</div>
									</div>
								) : (
									<div className='flex w-fit flex-col gap-4'>
										<Label className='text-muted-foreground'>Xét duyệt đăng ký</Label>

										{topic.allowManualApproval ? (
											<span className='flex scale-100 transform items-center justify-between gap-1 rounded-sm border border-yellow-500 bg-yellow-50 px-2 py-1 text-[14px] font-semibold text-yellow-600 shadow-sm duration-300 hover:scale-105'>
												<ShieldAlert />
												Yêu cầu cần được phê duyệt
											</span>
										) : (
											<span className='flex scale-100 transform items-center justify-between gap-1 rounded-sm border border-green-500 bg-green-50 px-3 py-1 text-[14px] font-semibold text-green-600 shadow-sm duration-300 hover:scale-105'>
												<ShieldAlert />
												Yêu cầu không cần phê duyệt
											</span>
										)}
									</div>
								)}
							</div>
							{/* Thông tin đối tượng là sinh viên tham gia */}

							<div className='relative h-fit gap-4 space-y-4 rounded-md border border-gray-300 bg-white p-8 transition-all duration-300'>
								<div className='mb-2 flex items-center gap-4'>
									<h4 className='text-lg font-semibold text-gray-800'>Sinh viên đăng ký</h4>
									<h4 className='mb-1 ml-2 text-lg font-semibold text-blue-600'>{`(${currentTopic.students.approvedStudents.length}/${topic.maxStudents})`}</h4>
								</div>
								<div className='flex flex-col gap-4'>
									{currentTopic.students.approvedStudents.length > 0 &&
									isAbleInOpenRegistrationPhase ? (
										currentTopic.students.approvedStudents.map((student) => (
											<div key={student._id} className='flex items-start gap-3'>
												<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
													{student.student.avatarUrl ? (
														<img
															src={student.student.avatarUrl}
															alt={student.student.fullName}
															className='h-10 w-10 rounded-full object-cover'
														/>
													) : (
														<User className='h-5 w-5 text-primary' />
													)}
												</div>
												<div className='min-w-0 flex-1'>
													<p className='font-medium text-foreground'>{`${student.student.fullName}`}</p>
													<p className='truncate text-sm text-muted-foreground'>
														{student.student.email}
													</p>
													<p className='truncate text-sm text-muted-foreground'>
														{student.student.major}
													</p>
													<p className='text-xs text-muted-foreground'>
														{student.student.facultyName}
													</p>
												</div>
											</div>
										))
									) : (
										<div className='flex flex-col items-center justify-center text-center'>
											<div className='mb-3 rounded-full bg-gray-50 p-3'>
												<User className='h-6 w-6 text-gray-300' />
											</div>
											<p className='text-sm font-medium text-gray-500'>
												Chưa có thành viên chính thức
											</p>
											<p className='text-xs text-gray-400'>
												Sinh viên được duyệt sẽ hiển thị ở đây
											</p>
										</div>
									)}
									{user && user.role === 'lecturer' && isAbleInDraftOrSubmitPhase && (
										<div className='mt-2 flex items-center gap-2'>
											<div
												className='flex items-center rounded-sm px-2 py-2 hover:cursor-pointer hover:bg-blue-100'
												onClick={() => setOpenAddStudentModal(true)}
											>
												<Plus className='h-4 w-4 text-primary' />
												<span className='ml-2 text-sm text-primary'>Thêm sinh viên</span>
											</div>
										</div>
									)}
									{user &&
										(() => {
											switch (user.role) {
												case 'lecturer':
													return (
														currentTopic.students.pendingStudents.length > 0 && (
															<>
																{/* Hiển thị yêu cầu đăng ký cần được duyệt */}
																<div className='flex flex-col justify-between gap-3 border border-b border-yellow-300 bg-yellow-50/50 px-3 py-2 sm:flex-row sm:items-center'>
																	<h3 className='flex items-center gap-2 font-semibold text-yellow-800'>
																		<Clock className='h-4 w-4' /> Yêu cầu chờ duyệt
																		<span className='rounded-full bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800'>
																			{
																				currentTopic.students.pendingStudents
																					.length
																			}
																		</span>
																	</h3>
																	<h3
																		className='flex items-center gap-2 rounded-md px-2 py-1 font-semibold text-yellow-800 hover:cursor-pointer hover:bg-yellow-200'
																		onClick={() => setModalRegisterModalOpen(true)}
																	>
																		<Eye className='h-4 w-4' /> Xem chi tiết
																	</h3>
																</div>
															</>
														)
													)
												case 'student':
													return (
														isAbleInOpenRegistrationPhase &&
														currentTopic.students.pendingStudents.length > 0 &&
														currentTopic.students.pendingStudents.some(
															(student) => student.student._id === user.userId
														) && (
															<>
																{/* Hiển thị yêu cầu đăng ký cần được duyệt */}
																<div
																	className={`flex flex-col justify-between gap-3 border border-b border-yellow-300 bg-yellow-50/50 px-2 py-1 sm:flex-row sm:items-center`}
																>
																	<span className='flex items-center gap-2 text-[13px] font-normal text-yellow-800'>
																		<Clock className='h-4 w-4' /> Yêu cầu của bạn
																		đang chờ duyệt{' '}
																		{currentTopic.students.pendingStudents.length -
																			1 >
																			0 && (
																			<span>
																				{' '}
																				cùng với{' '}
																				{currentTopic.students.pendingStudents
																					.length - 1}{' '}
																				người khác
																			</span>
																		)}
																	</span>
																	<Button
																		disabled={isLoadingUnregister}
																		variant='toggle_orange'
																		className='w-fit'
																		onClick={() => {
																			setOpenCancelRegistrationModal(true)
																		}}
																	>
																		{isLoadingRegister ? <Loader2 /> : null}
																		{'Hủy đăng ký'}
																	</Button>
																</div>
															</>
														)
													)
											}
										})()}
									{isAbleInOpenRegistrationPhase &&
										user?.role === 'student' &&
										!currentTopic.registrationStatus && (
											<>
												<div className='flex flex-col justify-between gap-3 border border-b border-green-400 bg-green-50/60 px-3 py-1 sm:flex-row sm:items-center'>
													<span className='flex items-center gap-2 text-[14px] font-normal text-green-800'>
														Đề tài đang được mở đăng ký
													</span>
													<Button
														disabled={isLoadingRegister || isLoadingUnregister}
														variant='toggle_green'
														className='w-fit'
														onClick={() => {
															toggleRegistration()
														}}
													>
														{isLoadingRegister ? <Loader2 /> : null}
														{'Đăng ký đề tài'}
													</Button>
												</div>
											</>
										)}
								</div>
								{isEditing && (
									<div className='absolute inset-0 z-10 flex items-center justify-center bg-white/80'>
										<CircleOff />
									</div>
								)}
							</div>
							{/* Thông tin đối tượng là giảng viên tham gia */}
							<div className='relative h-fit gap-4 space-y-4 rounded-md border border-gray-300 bg-white p-8'>
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
												<p className='flex gap-2 font-medium text-foreground'>
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
									{isAbleInDraftOrSubmitPhase &&
										user &&
										user.role === 'lecturer' &&
										currentTopic.lecturers.length < 2 && (
											<div className='flex items-center gap-2'>
												<div
													className='flex items-center rounded-sm px-2 py-2 hover:cursor-pointer hover:bg-blue-100'
													onClick={() => setOpenAddLecturerModal(true)}
												>
													<Plus className='h-4 w-4 text-primary' />
													<span className='ml-2 text-sm text-primary'>Thêm giảng viên</span>
												</div>
											</div>
										)}
								</div>
								{isEditing && (
									<div className='absolute inset-0 z-10 flex items-center justify-center bg-white/80'>
										<CircleOff />
									</div>
								)}
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
						topicId={topic._id}
						openFileModal={openFileModal}
						setOpenFileModal={setOpenFileModal}
						files={topic.files}
						onRefetch={() => refetch()}
						isEditing={isEditing}
					/>
				</div>
				<RegistrationDetail
					maxStudents={currentTopic.maxStudents}
					students={currentTopic.students}
					openModal={modalRegisterModalOpen}
					setOpenModal={setModalRegisterModalOpen}
					onRefetch={refetch}
				/>
				<AddStudentModal
					topic={currentTopic}
					open={openAddStudentModal}
					onCancel={() => setOpenAddStudentModal(false)}
					onRefetch={refetch}
					goToApproval={handleGoToApproval}
				/>
				{/* Modal thêm giảng viên */}
				<AddLecturerModal
					open={openAddLecturerModal}
					onCancel={() => setOpenAddLecturerModal(false)}
					onRefetch={refetch}
					topic={currentTopic}
				/>
				<Dialog open={openConfirmModal} onOpenChange={setOpenConfirmModal}>
					<DialogContent>
						<DialogTitle>Xác nhận lưu thay đổi</DialogTitle>
						<p>Bạn có chắc chắn muốn lưu các thay đổi?</p>
						<div className='mt-4 flex justify-end gap-2'>
							<Button variant='outline' onClick={() => setOpenConfirmModal(false)}>
								Hủy
							</Button>
							<Button
								variant='default'
								onClick={async () => {
									setOpenConfirmModal(false)
									await handleSave()
								}}
							>
								Xác nhận
							</Button>
						</div>
					</DialogContent>
				</Dialog>
				<CancelRegistrationConfirmModal
					open={openCancelRegistrationModal}
					onCancel={() => setOpenCancelRegistrationModal(false)}
					onConfirm={async () => {
						await toggleRegistration()
						setOpenCancelRegistrationModal(false)
					}}
				/>
				<DeleteTopicModal
					open={openDeleteConfirmModal}
					onClose={() => setOpenDeleteConfirmModal(false)}
					onConfirm={() => handleDeleteTopics()}
					isLoading={isLoadingDelete}
				/>
			</DialogContent>
		</Dialog>
	)
}
