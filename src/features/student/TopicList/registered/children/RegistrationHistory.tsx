import { CustomPagination } from '@/components/PaginationBar'
import { Card, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'
import {
	registrationStatusMap,
	StudentRegistrationStatus,
	tranferToRejectionReasonType,
	type IStudentRegistration,
	type RegistrationHistoryQueryParams
} from '@/models'
import { useGetRegistrationsHistoryQuery } from '@/services/registrationApi'
import { formatPeriodInfoMiniPeriod } from '@/utils/utils'
import { Eye, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const RegistrationHistory = ({ periodId }: { periodId?: string }) => {
	const [queries, setQueries] = useState<RegistrationHistoryQueryParams>({
		limit: 10,
		page: 1,
		periodId: periodId ? periodId : undefined,
		search_by: ['topicInfo.titleVN', 'topicInfo.titleEng', 'lecturers.fullName', 'periodName'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: undefined,
		filter_by: 'fieldIds'
	})
	const { data: registrationHistoryData } = useGetRegistrationsHistoryQuery({ queries })
	// search input handler
	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueries((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}
	const navigate = useNavigate()
	const handleGoDetail = (registration: IStudentRegistration) => {
		navigate(`/detail-topic/${registration.topicId}`, {
			state: {
				notiType: 'REJECTED',
				message: `Đăng ký đề tài của bạn đã bị từ chối với lý do chính: "${tranferToRejectionReasonType[registration.rejectionReasonType as keyof typeof tranferToRejectionReasonType] || 'Lý do khác'}".`,
				rejectedBy: registration.processedBy.fullName,
				reasonSub: registration.lecturerResponse
			}
		})
	}
	const handleSelectPeriod = (value: string) => {
		setQueries((prev) => ({
			...prev,
			periodId: value === 'Tất cả' ? undefined : value,
			page: 1
		}))
	}
	return (
        <>
		<Card className='w-full space-y-2 rounded-xl border border-gray-200 bg-white p-6 shadow-md'>
			{!periodId && (
				<div className='w-fit'>
					<h2 className='mb-1 text-xl font-bold text-gray-900'>Lịch Sử Đăng Ký Đề Tài</h2>
					<p className='mb-6 text-sm text-gray-500'>Xem lịch sử và trạng thái của các lần đăng ký trước đó</p>
				</div>
			)}
			<div className='flex items-end gap-2'>
				<div className='flex flex-col items-start space-y-1'>
					<label className='text-sm font-semibold text-slate-700'>Tìm kiếm từ khóa</label>
					<Input
						placeholder='Tìm kiếm theo Đợt, Đề tài, hoặc Giảng viên...'
						value={searchTerm}
						onChange={(e) => onEdit(e.target.value)}
						className='sm:w-[350px]'
					/>
				</div>
				<div className='flex flex-col items-start space-y-1'>
					<label className='text-sm font-semibold text-slate-700'>Chọn kỳ/đợt đăng ký</label>
					<Select
						value={queries.periodId === undefined ? 'Tất cả' : queries.periodId}
						onValueChange={(value) => handleSelectPeriod(value)}
					>
						<SelectTrigger className='w-full bg-slate-50'>
							<SelectValue placeholder='Chọn năm' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='Tất cả'>Tất cả</SelectItem>
							{registrationHistoryData?.meta.periodOptions.map((y) => (
								<SelectItem key={y._id} value={y._id}>
									{formatPeriodInfoMiniPeriod(y)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className='overflow-x-auto rounded-lg border'>
				<table className='min-w-full bg-white'>
					<thead>
						<tr className='bg-gray-50 text-gray-700'>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Đợt</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Đề tài (Việt - Anh)</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Giảng viên</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngành</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngày đăng ký</th>
							{/* <th className='whitespace-nowrap px-3 py-2 text-left text-[15px] font-semibold'>
								Trạng thái đề tài
							</th> */}
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
							<th className='px-3 py-2 text-center text-[15px] font-semibold'>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{registrationHistoryData?.data.map((hic) => (
							<tr key={hic._id} className='border-b last:border-b-0 hover:bg-gray-50'>
								<td className='px-3 py-2 font-semibold'>
									{formatPeriodInfoMiniPeriod(hic.periodInfo)}
								</td>
								<td className='flex flex-col px-3 py-2'>
									<span className='font-semibold text-gray-900'>{hic.titleVN}</span>
									<span className='font-sm text-[13px] text-gray-500'>{`(${hic.titleEng})`}</span>
								</td>
								<td className='px-3 py-2'>
									<div className='flex flex-col text-sm'>
										{hic.lecturers
											.map((lecturer) => `${lecturer.title}. ${lecturer.fullName}`)
											.join(', ')}
									</div>
								</td>
								<td className='px-3 py-2'>{hic.major}</td>
								<td className='px-3 py-2'>{new Date(hic.registeredAt).toLocaleString('vi-VN')}</td>
								<td className='px-3 py-2'>
									<span
										className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${registrationStatusMap[hic.registrationStatus].color}`}
									>
										{registrationStatusMap[hic.registrationStatus].label}
									</span>
								</td>
								<td className='px-3 py-2 text-center'>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => handleGoDetail(hic)}
									>
										<Eye className='h-5 w-5 text-blue-500' />
									</button>
									{hic.registrationStatus === StudentRegistrationStatus.PENDING && (
										<button className='rounded-full p-2 transition-colors hover:bg-gray-100'>
											<Trash2 className='h-5 w-5 text-red-400' />
										</button>
									)}
								</td>
							</tr>
						))}
						{registrationHistoryData?.data.length === 0 && (
							<tr>
								<td colSpan={5} className='py-6 text-center text-gray-400'>
									Không có dữ liệu phù hợp.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
			{registrationHistoryData?.meta && registrationHistoryData?.meta.totalPages > 1 && (
				<CustomPagination
					meta={registrationHistoryData?.meta}
					onPageChange={(p) => setQueries((prev) => ({ ...prev, page: p }))}
				/>
			)}
		</Card>
        </>
	)
}

export default RegistrationHistory
