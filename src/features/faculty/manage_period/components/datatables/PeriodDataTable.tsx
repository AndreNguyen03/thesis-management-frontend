import { ROLES, type ApiError, type PaginationTopicsQueryParams } from '@/models'
import {
	type Period,
	type PaginationPeriodQueryParams,
	type UpdatePeriodDto,
	type PeriodTypeEnum,
	type PeriodType,
	type PeriodStatus,
	periodTypeMap,
	statusMap,
	phaseMap
} from '@/models/period.model'
import { useAdjustPeriodMutation, useDeletePeriodMutation, useGetPeriodsQuery } from '@/services/periodApi'

import { Edit, Eye, Loader2, Plus, Trash, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { EditPeriodModal } from '../modals/EditPeriodModal'
import { DeletePeriodModal } from '../modals/DeletePeriodModal'
import { useDebounce } from '@/hooks/useDebounce'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui'
import { CustomPagination } from '@/components/PaginationBar'
import { SelectValue } from '@radix-ui/react-select'

const PeriodDataTable = ({ onOpenChange }: { onOpenChange: () => void }) => {
	// search input handler
	const navigate = useNavigate()
	//các state của modal
	// STATE CHO EDIT MODAL
	const [editModalOpen, setEditModalOpen] = useState(false)
	const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)
	const [deleteModalOpen, setDeleteModalOpen] = useState(false) // state để mở modal xóa

	//gọi endpoint lấy tất cả các đợt/kỳ học
	const [queryParams, setQueryParams] = useState<PaginationPeriodQueryParams>({
		page: 1,
		limit: 10,
		search_by: ['name'],
		query: '',
		sort_by: 'startTime',
		sort_order: 'desc',
		type: 'all',
		status: 'all',
		role: ROLES.LECTURER
	})
	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueryParams((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}
	const { data: periodDataState, isLoading, error } = useGetPeriodsQuery(queryParams)
	const [periodData, setPeriodData] = useState<Period[] | undefined>()
	useEffect(() => {
		if (periodDataState) setPeriodData(periodDataState.data)
	}, [periodDataState])
	const [adjustPeriod, { isLoading: isAdjustingPeriod }] = useAdjustPeriodMutation()
	const [deletePeriod, { isLoading: isDeletingPeriod }] = useDeletePeriodMutation()

	async function handleDeletePeriod(periodId: string) {
		try {
			const result = await deletePeriod(periodId).unwrap()
			if (result) {
				toast.success(`Xóa đợt thành công ${result.message}`, { richColors: true })
			}
		} catch (error) {
			toast.error((error as ApiError).data?.message || 'Đã có lỗi xảy ra khi xóa đợt', { richColors: true })
		}
	}
	const handleEditConfirm = async (updatedPeriod: UpdatePeriodDto) => {
		try {
			const newPeriod = await adjustPeriod({ periodId: selectedPeriod?._id!, body: updatedPeriod }).unwrap()
			console.log('Updated period:', newPeriod)
			setPeriodData((prev) => [...(prev || []), newPeriod])
			setEditModalOpen(false)
			toast.success('Cập nhật đợt thành công', { richColors: true })
		} catch {
			toast.error('Đã có lỗi xảy ra khi cập nhật đợt', { richColors: true })
		}
	}
	return (
		<div className='px-2'>
			<div className='mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
				<div className='flex gap-5'>
					<Input
						placeholder='Tìm kiếm theo Đợt, Đề tài, hoặc Giảng viên...'
						value={searchTerm}
						onChange={(e) => onEdit(e.target.value)}
						className='w-[500px] border-gray-300 bg-white'
					/>
					<div className='flex items-center space-x-5'>
						<Select
							onValueChange={(newValue) => {
								setQueryParams((prev) => ({ ...prev, type: newValue as PeriodType | 'all' }))
							}}
						>
							<SelectTrigger className='border-gray-300 bg-white'>
								<SelectValue placeholder='Lọc theo loại đợt' defaultValue={'all'} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả</SelectItem>
								<SelectItem value='thesis'>Khóa luận</SelectItem>
								<SelectItem value='scientific_research'>Nghiên cứu khoa học</SelectItem>
							</SelectContent>
						</Select>

						<Select
							onValueChange={(newValue) =>
								setQueryParams((prev) => ({ ...prev, status: newValue as PeriodStatus | 'all' }))
							}
						>
							<SelectTrigger className='border-gray-300 bg-white'>
								<SelectValue placeholder='Lọc theo trạng thái' defaultValue={'all'} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả</SelectItem>
								<SelectItem value='timeout'>Hết hạn</SelectItem>
								<SelectItem value='active'>Đang hoạt động</SelectItem>
								<SelectItem value='pending'>Đang chờ</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<Button className='bg-blue-600 text-white hover:bg-blue-700' onClick={onOpenChange}>
					<Plus />
					Thêm đợt/kì mới
				</Button>
			</div>

			<div className='overflow-x-auto rounded-lg border'>
				<table className='min-w-full table-auto bg-white'>
					<thead>
						<tr className='bg-gray-50 text-gray-700'>
							<th className='w-[100px] px-3 py-2 text-left text-[15px] font-semibold'>Năm học</th>
							<th className='w-[80px] px-3 py-2 text-left text-[15px] font-semibold'>Học kỳ</th>
							<th className='w-[150px] px-3 py-2 text-left text-[15px] font-semibold'>Loại đợt</th>
							<th className='w-[200px] px-3 py-2 text-left text-[15px] font-semibold'>Thời gian</th>
							<th className='w-[150px] px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái kì</th>
							<th className='w-[150px] px-3 py-2 text-left text-[15px] font-semibold'>Pha hiện tại</th>
							<th className='w-[150px] px-3 py-2 text-left text-[15px] font-semibold'>
								Trạng thái của pha
							</th>
							<th className='w-[120px] px-3 py-2 text-center text-[15px] font-semibold'>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{periodData?.map((pe) => (
							<tr key={pe._id} className='border-b last:border-b-0 hover:bg-gray-50'>
								<td className='overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2'>
									<span title={pe.year} className='font-semibold text-gray-900'>
										{pe.year}
									</span>
								</td>
								<td className='overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2'>
									<span title={`${pe.semester}`} className='font-semibold text-gray-900'>
										{pe.semester}
									</span>
								</td>
								<td className='overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2'>
									<span title={periodTypeMap[pe.type]}>{periodTypeMap[pe.type]}</span>
								</td>
								<td className='overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2'>
									<span
										title={`${new Date(pe.startTime).toLocaleString()} - ${new Date(pe.endTime).toLocaleString()}`}
									>
										{new Date(pe.startTime).toLocaleString('vi-VN')} -{' '}
										{new Date(pe.endTime).toLocaleString('vi-VN')}
									</span>
								</td>
								<td className='overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2'>
									<span
										className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusMap[pe.status].color}`}
										title={statusMap[pe.status].label}
									>
										{statusMap[pe.status].label}
									</span>
								</td>
								<td className='overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2'>
									<span
										className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${phaseMap[pe.currentPhase].color}`}
										title={phaseMap[pe.currentPhase].label}
									>
										{phaseMap[pe.currentPhase].label}
									</span>
								</td>
								<td className='overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2'>
									<span
										className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${statusMap[pe.currentPhaseDetail.status].color}`}
										title={statusMap[pe.currentPhaseDetail.status].label}
									>
										{statusMap[pe.currentPhaseDetail.status].label}
									</span>
								</td>
								<td className='whitespace-nowrap px-3 py-2 text-center'>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => navigate(`/period/${pe._id}`)}
									>
										<Eye className='h-5 w-5 text-blue-500' />
									</button>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => {
											setSelectedPeriod(pe)
											setEditModalOpen(true)
										}}
									>
										<Edit className='h-5 w-5 text-blue-500' />
									</button>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => {
											setSelectedPeriod(pe)
											setDeleteModalOpen(true)
										}}
									>
										<Trash className='h-5 w-5 text-red-500' />
									</button>
								</td>
							</tr>
						))}
					</tbody>
				</table>

				{/* Edit Period Modal */}
				{selectedPeriod && (
					<EditPeriodModal
						open={editModalOpen}
						onOpenChange={setEditModalOpen} // để modal tự đóng
						data={selectedPeriod} // period cần chỉnh sửa
						onSubmit={handleEditConfirm}
						isLoading={isAdjustingPeriod}
					/>
				)}

				{/* Delete Period Modal */}
				{selectedPeriod && (
					<DeletePeriodModal
						open={deleteModalOpen}
						onOpenChange={setDeleteModalOpen}
						isLoading={isDeletingPeriod}
						period={selectedPeriod}
						onConfirm={handleDeletePeriod}
					/>
				)}
				{periodDataState?.meta && periodDataState?.meta.totalPages > 1 && (
					<CustomPagination
						meta={periodDataState?.meta}
						onPageChange={(p) => setQueryParams((prev) => ({ ...prev, page: p }))}
					/>
				)}
			</div>
		</div>
	)
}

export default PeriodDataTable
