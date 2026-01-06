import {
	Avatar,
	AvatarFallback,
	AvatarImage,
	Badge,
	Button,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/Dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Textarea } from '@/components/ui/textarea'
import type { QueryReplyRegistration, RelatedStudentInTopic } from '@/models'
import { AlertTriangle, Check, Clock, MoreVertical, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { RegistrationStatus } from '../../utils/registration'
import { useReplyRegistrationMutation } from '@/services/registrationApi'
import { toast } from '@/hooks/use-toast'
import { getErrorMessage } from '@/utils/catch-error'
interface RegistrationProps {
	maxStudents: number
	students: RelatedStudentInTopic
	openModal: boolean
	setOpenModal: (open: boolean) => void
	onRefetch: () => void
}
const RegistrationDetail = ({ maxStudents, students, openModal, setOpenModal, onRefetch }: RegistrationProps) => {
	const [rejectModalOpen, setRejectModalOpen] = useState(false)
	const [selectedRequest, setSelectedRequest] = useState<any>(null)
	//hàm chấp nhận yêu cầu đăng ký của sinh viên
	const [replyRegistration, { isError: isErrorRegistration }] = useReplyRegistrationMutation()
	// State form từ chối
	const [rejectReason, setRejectReason] = useState<string>('')
	const [rejectReasonType, setRejectReasonType] = useState('')
	const isRegisterable = students.approvedStudents.length < maxStudents
	const handleApprove = async (registrationId: string) => {
		const replyPayload: QueryReplyRegistration = {
			status: RegistrationStatus.APPROVED,
			lecturerResponse: 'Chúc mừng bạn đã được duyệt vào đề tài!'
		}
		// Call API Approve
		await replyRegistration({ registrationId: registrationId, body: replyPayload })
		if (isErrorRegistration) {
			toast({
				variant: 'destructive',
				title: 'Lỗi',
				description: getErrorMessage(isErrorRegistration)
			})
		}
		onRefetch()
	}
	const confirmReject = async () => {
		const replyPayload: QueryReplyRegistration = {
			status: RegistrationStatus.REJECTED,
			lecturerResponse: rejectReason ? rejectReason : 'Rất tiếc, yêu cầu của bạn đã bị từ chối.',
			rejectionReasonType: rejectReasonType
		}
		await replyRegistration({ registrationId: selectedRequest._id, body: replyPayload })
		setRejectModalOpen(false)
		onRefetch()
	}
	const handleOpenReject = (request: any) => {
		console.log('Selected Request: ', request)
		setSelectedRequest(request)
		setRejectReasonType('')
		setRejectReason('')
		setRejectModalOpen(true)
	}

	return (
		<Dialog open={openModal} onOpenChange={setOpenModal}>
			<DialogContent className='max-w-3xl'>
				<div className='space-y-6'>
					{/* --- PHẦN 1: THÀNH VIÊN CHÍNH THỨC --- */}
					<div className='overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm'>
						<div className='flex items-center justify-between border-b border-gray-200 bg-gray-50 px-4 py-3'>
							<h3 className='font-semibold text-gray-800'>
								Thành viên chính thức ({students.approvedStudents.length}/{maxStudents})
							</h3>
							{students.approvedStudents.length >= maxStudents && (
								<Badge variant='secondary' className='bg-green-100 text-green-700 hover:bg-green-100'>
									Đã đủ
								</Badge>
							)}
						</div>

						<div className='p-2'>
							{students.approvedStudents.length > 0 ? (
								students.approvedStudents.map((student) => (
									<div
										key={student._id}
										className='group flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-gray-50'
									>
										<div className='flex items-center gap-3'>
											<Avatar className='h-9 w-9 border border-gray-200'>
												<AvatarImage src={student.student.avatarUrl} />
												<AvatarFallback>{student.student.fullName[0]}</AvatarFallback>
											</Avatar>
											<div>
												<div className='flex items-center gap-2'>
													<p className='text-sm font-medium text-gray-900'>
														{student.student.fullName}
													</p>
													{/* {student.role === 'Leader' && (
													<Badge
														variant='outline'
														className='h-4 border-blue-200 px-1 py-0 text-[10px] text-blue-600'
													>
														Trưởng nhóm
													</Badge>
												)} */}
												</div>
												<p className='text-xs text-gray-500'>{student.student.studentCode}</p>
											</div>
										</div>

										{/* Menu hành động cho thành viên (Xóa, đổi role) */}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant='ghost'
													size='icon'
													className='h-8 w-8 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100'
												>
													<MoreVertical className='h-4 w-4' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent align='end'>
												<DropdownMenuItem className='text-red-600 focus:text-red-600'>
													<Trash2 className='mr-2 h-4 w-4' /> Xóa khỏi nhóm
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</div>
								))
							) : (
								<div className='py-6 text-center text-sm italic text-gray-500'>
									Chưa có thành viên nào. Vui lòng duyệt yêu cầu bên dưới.
								</div>
							)}
						</div>
					</div>

					{/* --- PHẦN 2: YÊU CẦU ĐANG CHỜ DUYỆT (PENDING) --- */}
					<div className='overflow-hidden rounded-xl border border-yellow-200 bg-white shadow-sm'>
						{/* Header với Toggle Ẩn danh */}
						<div className='flex flex-col justify-between gap-3 border-b border-yellow-100 bg-yellow-50/50 px-4 py-3 sm:flex-row sm:items-center'>
							<div>
								<h3 className='flex items-center gap-2 font-semibold text-yellow-800'>
									<Clock className='h-4 w-4' /> Yêu cầu chờ duyệt
									<span className='rounded-full bg-yellow-200 px-2 py-0.5 text-xs text-yellow-800'>
										{students.pendingStudents.length}
									</span>
								</h3>
								<p className='mt-1 text-xs text-yellow-600/80'>
									Sắp xếp theo thứ tự đăng ký (đến trước duyệt trước)
								</p>
							</div>
						</div>

						<div className='divide-y divide-gray-100'>
							{students.pendingStudents.length > 0 ? (
								students.pendingStudents.map((req, index) => (
									<div key={req._id} className='p-4 transition-colors hover:bg-gray-50'>
										<div className='flex flex-col justify-between gap-4 sm:flex-row sm:items-start'>
											{/* Thông tin Sinh viên */}
											<div className='flex flex-1 items-start gap-3'>
												{/* Số thứ tự Queue */}
												<div
													className='mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-xs font-bold text-gray-500'
													title={`Người đăng ký thứ ${index + 1}`}
												>
													{index + 1}
												</div>

												<div className='w-full space-y-1'>
													<div className='flex flex-wrap items-center gap-2'>
														{/* Tên sinh viên (Xử lý Ẩn danh) */}
														<h4 className={`text-sm font-semibold italic`}>
															{req.student.fullName}
														</h4>

														{/* Badge gợi ý */}
														{/* {req.gpa >= 3.6 && (
														<Badge
															variant='outline'
															className='gap-1 border-green-200 bg-green-50 px-1.5 py-0 text-[10px] text-green-700'
														>
															<GraduationCap className='h-3 w-3' /> Top GPA
														</Badge>
													)} */}
														{/* {!isBlindMode && (
														<span className='text-xs text-gray-400'>| {req.mssv}</span>
													)} */}
													</div>

													{/* Thông tin năng lực (Luôn hiển thị)
													<div className='flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600'>
														<span className='rounded bg-blue-50 px-1.5 font-medium text-blue-600'>
															GPA: X
														</span>
														<span
															className='flex items-center gap-1 text-gray-400'
															title='Thời gian đăng ký'
														>
															<Clock className='h-3 w-3' />
															{new Date(req.createdAt).toLocaleString('vi-VN')}
														</span>
													</div> */}

													{/* Kỹ năng */}
													<div className='mt-1.5 flex flex-wrap gap-1'>
														{req.student.skills?.map((skill) => (
															<span
																key={skill}
																className='rounded border border-gray-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-gray-600'
															>
																{skill}
															</span>
														))}
													</div>

													{/* Ghi chú nguyện vọng */}
													{req.note && (
														<p className='mt-1 rounded border border-dashed border-gray-200 bg-gray-50 p-1.5 text-xs italic text-gray-500'>
															"{req.note}"
														</p>
													)}
												</div>
											</div>

											{/* Nút hành động */}
											<div className='flex min-w-[100px] gap-2 sm:flex-col'>
												<Button
													size='sm'
													className='h-8 w-full bg-green-600 text-xs text-white shadow-sm hover:bg-green-700'
													onClick={() => handleApprove(req._id)}
													disabled={!isRegisterable}
												>
													<Check className='mr-1.5 h-3 w-3' /> Duyệt
												</Button>
												<Button
													size='sm'
													variant='outline'
													className='h-8 w-full border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700'
													onClick={() => handleOpenReject(req)}
												>
													<X className='mr-1.5 h-3 w-3' /> Từ chối
												</Button>
											</div>
										</div>
									</div>
								))
							) : (
								<div className='py-8 text-center text-sm text-gray-400'>
									Không có yêu cầu nào đang chờ.
								</div>
							)}
						</div>
					</div>

					{/* --- MODAL TỪ CHỐI (Bắt buộc lý do) --- */}
					<Dialog open={rejectModalOpen} onOpenChange={setRejectModalOpen}>
						<DialogContent className='max-h-lg h-fit w-fit'>
							<DialogHeader>
								<DialogTitle className='flex items-center gap-2 text-red-600'>
									<AlertTriangle className='h-5 w-5' />
									Xác nhận từ chối
								</DialogTitle>
								<DialogDescription>
									Bạn đang từ chối yêu cầu của{' '}
									<span className='font-bold text-gray-900'>
										{`Ứng viên #${students.pendingStudents.indexOf(selectedRequest) + 1}`}
									</span>
									.
									<br />
									Lý do này sẽ được gửi thông báo đến sinh viên để đảm bảo minh bạch.
								</DialogDescription>
							</DialogHeader>

							<div className='space-y-4 py-2'>
								<div className='space-y-2'>
									<label className='text-sm font-medium'>
										Lý do chính <span className='text-red-500'>*</span>
									</label>
									<Select onValueChange={setRejectReasonType}>
										<SelectTrigger>
											<SelectValue placeholder='-- Chọn lý do --' />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value='full_slot'>Đã đủ số lượng thành viên</SelectItem>
											<SelectItem value='skill_mismatch'>Kỹ năng chưa phù hợp</SelectItem>
											<SelectItem value='gpa_low'>Điểm trung bình chưa đạt yêu cầu</SelectItem>
											<SelectItem value='other'>Lý do khác</SelectItem>
										</SelectContent>
									</Select>
								</div>

								<div className='space-y-2'>
									<label className='text-sm font-medium'>Ghi chú thêm</label>
									<Textarea
										placeholder='VD: Cần bổ sung kiến thức về...'
										value={rejectReason}
										onChange={(e) => setRejectReason(e.target.value)}
										className='h-20'
									/>
								</div>
							</div>

							<DialogFooter>
								<Button variant='ghost' onClick={() => setRejectModalOpen(false)}>
									Hủy bỏ
								</Button>
								<Button variant='destructive' onClick={confirmReject} disabled={!rejectReasonType}>
									Gửi thông báo từ chối
								</Button>
							</DialogFooter>
						</DialogContent>
					</Dialog>
				</div>
			</DialogContent>
		</Dialog>
	)
}

export default RegistrationDetail
