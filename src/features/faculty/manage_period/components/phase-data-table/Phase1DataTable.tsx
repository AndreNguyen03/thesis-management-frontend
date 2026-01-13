import { CustomPagination } from '@/components/PaginationBar'
import { Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/checkbox'
import { EmptyState } from '@/components/ui/EmptyState'
import { type ApiError, type GeneralTopic, type PaginatedGeneralTopics } from '@/models'
import { PeriodPhaseName, type PaginatedTopicsInPeriod, type PhaseType } from '@/models/period.model'
import {
	useFacuBoardApproveTopicMutation,
	useFacuBoardApproveTopicsMutation,
	useFacuBoardRejectTopicMutation,
	useFacuBoardRejectTopicsMutation,
	useFacuBoardRequestEditTopicMutation
} from '@/services/topicApi'
import { Check, CheckCircle, Eye, Edit, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'sonner'
import EditRequestModal from '../modals/EditRequestModal'

// Badge màu cho trạng thái
const statusMap: Record<string, { label: string; color: string }> = {
	draft: { label: 'Bản nháp', color: 'text-center bg-gray-100 text-gray-700' },
	submitted: { label: 'Đã nộp', color: 'text-center bg-yellow-100 text-yellow-700' },
	under_review: { label: 'Đang xét duyệt', color: 'text-center bg-blue-100 text-blue-700' },
	need_adjust: { label: 'Chỉnh sửa', color: 'text-center bg-purple-100 text-purple-700' },
	approved: { label: 'Đã duyệt', color: 'text-center bg-green-100 text-green-700' },
	rejected: { label: 'Bị từ chối', color: 'text-center bg-red-100 text-red-700' },
	pending_registration: { label: 'Mở đăng ký', color: 'text-center bg-purple-100 text-purple-700' },
	registered: { label: 'Đã có đăng ký', color: 'text-center bg-indigo-100 text-indigo-700' },
	full: { label: 'Đã đủ số lượng', color: 'text-center bg-gray-300 text-gray-800' },
	cancelled: { label: 'Đã hủy', color: 'text-center bg-red-300 text-red-800' },
	in_progress: { label: 'Đang thực hiện', color: 'text-center bg-blue-300 text-blue-800' },
	delayed: { label: 'Bị trì hoãn', color: 'text-center bg-yellow-300 text-yellow-800' },
	paused: { label: 'Tạm ngưng', color: 'text-center bg-gray-300 text-gray-800' },
	submitted_for_review: { label: 'Đã nộp báo cáo', color: 'text-center bg-yellow-100 text-yellow-700' },
	awaiting_evaluation: { label: 'Chờ đánh giá', color: 'text-center bg-purple-100 text-purple-700' },
	graded: { label: 'Đã chấm điểm', color: 'text-center bg-green-100 text-green-700' },
	reviewed: { label: 'Đã kiểm tra', color: 'text-center bg-blue-100 text-blue-700' },
	archived: { label: 'Đã lưu trữ', color: 'text-center bg-gray-100 text-gray-700' },
	rejected_final: { label: 'Chưa đạt', color: 'text-center bg-red-100 text-red-700' }
}
interface DataTableProps {
	paginatedTopicsInPeriod?: PaginatedTopicsInPeriod
	refetch: () => void
	phaseId: string
	phaseName: string
	isLoading?: boolean
	error?: ApiError | null
	onPageChange: (page: number) => void
}
const Phase1DataTable = ({
	paginatedTopicsInPeriod,
	refetch,
	phaseId,
	phaseName,
	isLoading,
	error,
	onPageChange
}: DataTableProps) => {
	// search input handler
	const [selectedTopics, setSelectedTopics] = useState<string[]>([])
	const navigate = useNavigate()
	const handleGoDetail = (_id: string) => {
		navigate(`/detail-topic/${_id}`)
	}

	const { id: periodId } = useParams()
	const [isChoosingMany, setIsChoosingMany] = useState(false)
	const [editModalOpen, setEditModalOpen] = useState(false)
	const [editTopic, setEditTopic] = useState<GeneralTopic | null>(null)
	const [requestEditTopic, { isLoading: isRequestingEdit }] = useFacuBoardRequestEditTopicMutation()
	const [approveTopic, { isLoading: isLoadingApprove }] = useFacuBoardApproveTopicMutation()
	const [approveTopics, { isLoading: isLoadingApproveMany }] = useFacuBoardApproveTopicsMutation()
	const [rejectTopics, { isLoading: isLoadingRejectMany }] = useFacuBoardRejectTopicsMutation()
	const [rejectTopic, { isLoading: isLoadingReject }] = useFacuBoardRejectTopicMutation()

	const handleConfirmEditRequest = async (content: string) => {
        console.log('editTopic   ', editTopic, content)
		if (!editTopic) return

		try {
			await requestEditTopic({
				topicId: editTopic!._id,
				phaseId,
				periodId: periodId!,
				comment: content
			}).unwrap()

			toast.success('Đã gửi yêu cầu chỉnh sửa', { richColors: true })

			setEditModalOpen(false)
			setEditTopic(null)
			refetch()
		} catch (err) {
			toast.error('Gửi yêu cầu chỉnh sửa thất bại', { richColors: true })
		}
	}

	const handleApprove = async (topicId: string) => {
		try {
			await approveTopic({ topicId, phaseId: phaseId, periodId: periodId! }).unwrap()
			toast.success('Duyệt đề tài thành công', { richColors: true })
			refetch()
		} catch (err) {
			toast.error(`Duyệt thất bại ${err}`, { richColors: true })
		}
	}

	const handleReject = async (topicId: string) => {
		try {
			await rejectTopic({ topicId, phaseId: phaseId, periodId: periodId! }).unwrap()
			toast.success('Từ chối đề tài thành công', { richColors: true })
			refetch()
		} catch (err) {
			toast.error(`Từ chối thất bại ${err}`, { richColors: true })
		}
	}
	const handleApproveMany = async () => {
		try {
			await approveTopics({ topicIds: selectedTopics, phaseId: phaseId, periodId: periodId! }).unwrap()
			toast.success('Duyệt đề tài thành công', { richColors: true })
			refetch()
		} catch (err) {
			toast.error(`Duyệt thất bại ${err}`, { richColors: true })
		}
	}
	const handleRejectMany = async () => {
		try {
			await rejectTopics({ topicIds: selectedTopics, periodId: periodId! }).unwrap()
			toast.success('Từ chối đề tài thành công', { richColors: true })
			refetch()
		} catch (err) {
			toast.error(`Từ chối thất bại ${err}`, { richColors: true })
		}
	}
	const isOpenRegistation =
		paginatedTopicsInPeriod?.meta.periodInfo.currentPhase === PeriodPhaseName.OPEN_REGISTRATION
	return (
		<div>
			<div>
				{isChoosingMany ? (
					<div className='flex gap-2 p-2'>
						<Button
							onClick={handleApproveMany}
							className='h-fit bg-green-500 px-2 py-1 text-white hover:bg-green-600'
							disabled={isLoadingApproveMany}
						>
							{isLoadingApproveMany && <Loader2 className='mr-2 inline-block h-4 w-4 animate-spin' />}
							Duyệt ({selectedTopics.length})
						</Button>

						<Button
							onClick={handleRejectMany}
							className='hover:bg-red-550 h-fit bg-red-500 px-2 py-1 text-white'
							disabled={isLoadingRejectMany}
						>
							{isLoadingRejectMany && <Loader2 className='mr-2 inline-block h-4 w-4 animate-spin' />}
							Từ chối ({selectedTopics.length})
						</Button>
						<Button
							className='hover:bg-gray-550 h-fit bg-gray-500 px-2 py-1'
							onClick={() => {
								setSelectedTopics([])
								setIsChoosingMany(false)
							}}
						>
							Hủy{' '}
						</Button>
					</div>
				) : (
					<Button
						onClick={() => {
							setIsChoosingMany(true)
						}}
						className='mb-2 h-fit px-2 py-1'
					>
						Chọn nhiều
					</Button>
				)}
			</div>

			<div className='overflow-x-auto rounded-lg border'>
				<table className='min-w-full bg-white'>
					<thead>
						<tr className='bg-gray-50 text-gray-700'>
							{isChoosingMany && <th className='px-3 py-2 text-left text-[15px] font-semibold'>Chọn</th>}
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Đề tài (Việt - Anh)</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Giảng viên</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngành</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngày đăng ký</th>
							{/* <th className='whitespace-nowrap px-3 py-2 text-left text-[15px] font-semibold'>
								Trạng thái đề tài
							</th> */}
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
							<th className='line-clamp-2 px-3 py-2 text-left text-[15px] font-semibold'>
								Số lượng đăng ký
							</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Yêu cầu cần duyệt</th>
							<th className='px-3 py-2 text-center text-[15px] font-semibold'>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{paginatedTopicsInPeriod?.data.map((hic) => {
							const pendingStudentsCount = hic.students?.pendingStudents?.length || 0
							return (
								<tr key={hic._id} className='border-b last:border-b-0 hover:bg-gray-50'>
									{isChoosingMany && (
										<td className='px-3 py-2'>
											<Checkbox
												checked={selectedTopics.includes(hic._id)}
												onCheckedChange={(checked) => {
													if (checked) {
														setSelectedTopics((prev) => [...prev, hic._id])
													} else {
														setSelectedTopics((prev) => prev.filter((id) => id !== hic._id))
													}
												}}
											/>
										</td>
									)}

									<td className='max-w-450 flex min-w-[150px] flex-col px-3 py-2'>
										<span className='font-semibold text-gray-900'>{hic.titleVN}</span>
										<span className='font-sm text-[13px] text-gray-500'>{`(${hic.titleEng})`}</span>
									</td>
									<td className='px-3 py-2'>
										<div className='flex flex-col text-sm'>
											{hic.lecturers.map((lecturer) => (
												<span
													key={lecturer._id}
												>{`${lecturer.title}. ${lecturer.fullName}`}</span>
											))}
										</div>
									</td>
									<td className='px-3 py-2'>{hic.major.name}</td>
									<td className='px-3 py-2'>{new Date(hic.updatedAt).toLocaleString('vi-VN')}</td>
									{/* <td className='px-3 py-2'>
									<span>
										{topicStatusLabels[hic.topicStatus as keyof typeof topicStatusLabels].name}
									</span>
								</td> */}
									<td className='px-3 py-2'>
										<span
											className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusMap[hic.lastStatusInPhaseHistory.status].color}`}
										>
											{statusMap[hic.lastStatusInPhaseHistory.status].label}
										</span>
									</td>
									<td className='px-3 py-2'>
										<span className='font-medium'>
											{hic.studentsNum}/{hic.maxStudents}
										</span>
									</td>
									<td className='px-3 py-2'>
										<span
											className='cursor-pointer px-5 font-medium text-yellow-500 hover:underline'
											onClick={() => {
												handleGoDetail(hic._id)
											}}
										>
											{pendingStudentsCount}
										</span>
									</td>
									<td className='px-3 py-2 text-center'>
										<button
											className='rounded-full p-2 transition-colors hover:bg-gray-100'
											onClick={() => handleGoDetail(hic._id)}
										>
											<Eye className='h-5 w-5 text-blue-500' />
										</button>

										{hic.lastStatusInPhaseHistory.status === 'submitted' && (
											<>
												<button
													disabled={isLoadingApprove}
													className='rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-50'
													onClick={() => handleApprove(hic._id)}
												>
													<CheckCircle className='h-5 w-5 text-green-500' />
												</button>
												<button
													disabled={isLoadingReject}
													className='rounded-full p-2 transition-colors hover:bg-gray-100 disabled:opacity-50'
													onClick={() => handleReject(hic._id)}
												>
													<XCircle className='h-5 w-5 text-red-500' />
												</button>
												<button
													className='rounded-full p-2 transition-colors hover:bg-gray-100'
													onClick={() => {
														setEditTopic(hic)
														setEditModalOpen(true)
													}}
													disabled={isRequestingEdit}
												>
													<Edit className='h-5 w-5 text-indigo-500' />
												</button>
											</>
										)}
									</td>
								</tr>
							)
						})}

						{isLoading && (
							<tr>
								<td colSpan={7} className='py-12 text-center'>
									<div className='flex flex-col items-center justify-center gap-2'>
										<Loader2 className='h-8 w-8 animate-spin text-blue-500' />
										<span className='text-gray-500'>Đang tải dữ liệu...</span>
									</div>
								</td>
							</tr>
						)}
						{error && (
							<tr>
								<td colSpan={7} className='py-12 text-center'>
									<div className='flex flex-col items-center justify-center gap-2'>
										<XCircle className='h-8 w-8 text-red-500' />
										<span className='text-gray-500'>
											{(error as ApiError).data?.message || 'Đã có lỗi xảy ra khi tải dữ liệu'}
										</span>
									</div>
								</td>
							</tr>
						)}
						{!isLoading && !error && paginatedTopicsInPeriod?.data?.length === 0 && (
							<tr>
								<td colSpan={7} className='py-12 text-center'>
									<EmptyState title='Không có dữ liệu' />
								</td>
							</tr>
						)}
						{paginatedTopicsInPeriod?.meta && paginatedTopicsInPeriod?.meta.totalPages > 1 && (
							<CustomPagination meta={paginatedTopicsInPeriod?.meta} onPageChange={onPageChange} />
						)}
					</tbody>
				</table>
				<EditRequestModal
					open={editModalOpen}
					topic={editTopic}
					onClose={() => {
						setEditModalOpen(false)
						setEditTopic(null)
					}}
					onConfirm={handleConfirmEditRequest}
				/>
			</div>
		</div>
	)
}

export default Phase1DataTable
