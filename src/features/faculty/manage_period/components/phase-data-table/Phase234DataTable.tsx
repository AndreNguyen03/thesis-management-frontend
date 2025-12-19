import { CustomPagination } from '@/components/PaginationBar'
import { Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/checkbox'
import type { TableAction } from '@/components/ui/DataTable/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { type ApiError, type GeneralTopic, type PaginatedGeneralTopics } from '@/models'
import { PeriodPhaseName, type PaginatedTopicsInPeriod, type PhaseType } from '@/models/period.model'
import {
	useFacuBoardApproveTopicMutation,
	useFacuBoardApproveTopicsMutation,
	useFacuBoardRejectTopicMutation,
	useFacuBoardRejectTopicsMutation
} from '@/services/topicApi'
import { Check, CheckCircle, Eye, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'

// Badge màu cho trạng thái
const statusMap: Record<string, { label: string; color: string }> = {
	draft: { label: 'Bản nháp', color: 'text-center bg-gray-100 text-gray-700' },
	submitted: { label: 'Đã nộp', color: 'text-center bg-yellow-100 text-yellow-700' },
	under_review: { label: 'Đang xét duyệt', color: 'text-center bg-blue-100 text-blue-700' },
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
const Phase234DataTable = ({
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

	const renderHeader = () => {
		switch (phaseName) {
			case PeriodPhaseName.OPEN_REGISTRATION:
				return (
					<>
						<th className='line-clamp-2 px-3 py-2 text-left text-[15px] font-semibold'>Số lượng đăng ký</th>
					</>
				)
			case PeriodPhaseName.EXECUTION:
				return (
					<>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Tiến độ</th>
						<th className='line-clamp-2 px-3 py-2 text-left text-[15px] font-semibold'>
							Số lượng tham gia
						</th>
					</>
				)
			case PeriodPhaseName.COMPLETION:
				return (
					<>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Điểm số</th>
						<th className='line-clamp-2 px-3 py-2 text-left text-[15px] font-semibold'>Ngày báo cáo</th>
					</>
				)
		}
	}
	const renderBody = (hic: GeneralTopic) => {
		switch (phaseName) {
			case PeriodPhaseName.OPEN_REGISTRATION:
				return (
					<>
						<td className='t px-3 py-2'>
							<span className='text-center font-medium'>
								{hic.studentsNum}/{hic.maxStudents}
							</span>
						</td>{' '}
					</>
				)
			case PeriodPhaseName.EXECUTION:
				return (
					<>
						<td className='px-3 py-2'>
							<span className='cursor-pointer font-medium text-yellow-500 hover:underline'>coming</span>
						</td>
						<td className='px-3 py-2'>
							<span className='cursor-pointer font-medium text-yellow-500 hover:underline'>
								{hic.studentsNum}
							</span>
						</td>
					</>
				)
			case PeriodPhaseName.COMPLETION:
				return (
					<>
						<>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Điểm số - coming</th>
							<th className='line-clamp-2 px-3 py-2 text-left text-[15px] font-semibold'>
								Ngày báo cáo -coming
							</th>
						</>
					</>
				)
		}
	}
	return (
		<div className='overflow-x-auto rounded-lg border'>
			<table className='min-w-full bg-white'>
				<thead>
					<tr className='bg-gray-50 text-gray-700'>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Đề tài (Việt - Anh)</th>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Giảng viên</th>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngành</th>
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Cập nhật mới nhất</th>
						{renderHeader()}
						<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
						<th className='px-3 py-2 text-center text-[15px] font-semibold'>Hành động</th>
					</tr>
				</thead>
				<tbody>
					{paginatedTopicsInPeriod?.data.map((hic) => {
						return (
							<tr key={hic._id} className='border-b last:border-b-0 hover:bg-gray-50'>
								<td className='max-w-450 flex min-w-[150px] flex-col px-3 py-2'>
									<span className='font-semibold text-gray-900'>{hic.titleVN}</span>
									<span className='font-sm text-[13px] text-gray-500'>{`(${hic.titleEng})`}</span>
								</td>
								<td className='px-3 py-2'>
									<div className='flex flex-col text-sm'>
										{hic.lecturers.map((lecturer) => (
											<span key={lecturer._id}>{`${lecturer.title}. ${lecturer.fullName}`}</span>
										))}
									</div>
								</td>
								<td className='px-3 py-2'>{hic.major.name}</td>
								<td className='px-3 py-2'>{new Date(hic.updatedAt).toLocaleString('vi-VN')}</td>

								{renderBody(hic)}
								<td className='px-3 py-2'>
									<span
										className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusMap[hic.lastStatusInPhaseHistory.status].color}`}
									>
										{statusMap[hic.lastStatusInPhaseHistory.status].label}
									</span>
								</td>
								<td className='px-3 py-2 text-center'>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => handleGoDetail(hic._id)}
									>
										<Eye className='h-5 w-5 text-blue-500' />
									</button>
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
		</div>
	)
}

export default Phase234DataTable
