import { useState } from 'react'
import { DataTable } from '@/components/ui/DataTable'
import type { TableAction, TableColumn } from '@/components/ui/DataTable/types'
import { Plus, Edit, Trash, Eye } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Badge } from '@/components/ui/badge'
import { mockPeriods } from '../mockData'
import { Button } from '@/components/ui'
import { EditPeriodModal } from './modals/EditPeriodModal'
import { DeletePeriodModal } from './modals/DeletePeriodModal'
import type { Period, PeriodStatus, PhaseType } from '@/models/period'
// import { useGetPeriodsQuery, useDeletePeriodMutation } from "@/lib/api/periods"
const getStatusBadge = (status: PeriodStatus) => {
	const variants = {
		ongoing: { label: 'Đang diễn ra', variant: 'default' as const },
		completed: { label: 'Đã kết thúc', variant: 'secondary' as const },
		upcoming: { label: 'Sắp tới', variant: 'outline' as const }
	}

	const config = variants[status]
	return <Badge variant={config.variant}>{config.label}</Badge>
}

// ⚙️ Query Params type
interface QueryParams {
	page: number
	page_size: number
	search_by: string
	query: string
	sort_by: string
	sort_order: 'asc' | 'desc'
}

// 🚀 Component
export function PeriodsTable({ onOpenModal }: { onOpenModal: (open: boolean) => void }) {
	const navigate = useNavigate()

	const [queryParams, setQueryParams] = useState<QueryParams>({
		page: 1,
		page_size: 10,
		search_by: 'name',
		query: '',
		sort_by: 'startDate',
		sort_order: 'desc'
	})

	// STATE CHO EDIT MODAL
	const [editModalOpen, setEditModalOpen] = useState(false)
	const [selectedPeriod, setSelectedPeriod] = useState<Period | null>(null)

	// STATE CHO DELETE MODAL
	const [deleteModalOpen, setDeleteModalOpen] = useState(false) // state để mở modal xóa

	// const { data, isLoading, error } = useGetPeriodsQuery(queryParams)
	// const [deletePeriod] = useDeletePeriodMutation()
	const data = mockPeriods
	const isLoading = false
	const error = null

	// 📋 Định nghĩa các cột
	const columns: TableColumn<Period>[] = [
		{
			key: 'name',
			title: 'Tên đợt',
			sortable: false,
			searchable: true
		},
		{
			key: 'startDate',
			title: 'Thời gian',
			sortable: true,
			render: (_, record) => (
				<div className='text-sm'>
					{new Date(record.startDate).toLocaleDateString('vi-VN')} -{' '}
					{new Date(record.endDate).toLocaleDateString('vi-VN')}
				</div>
			)
		},
		{
			key: 'status',
			title: 'Trạng thái',
			sortable: false,
			render: (value: PeriodStatus) => getStatusBadge(value),
			renderSearchInput: ({ value, onChange }) => (
				<select
					className='w-full rounded border p-2 text-sm'
					value={value?.value || ''}
					onChange={(e) => onChange({ value: e.target.value })}
				>
					<option value=''>Tất cả</option>
					<option value='upcoming'>Sắp tới</option>
					<option value='ongoing'>Đang diễn ra</option>
					<option value='completed'>Đã kết thúc</option>
				</select>
			)
		},
		{
			key: 'currentPhase',
			title: 'Pha hiện tại',
			sortable: false,
			render: (value: PhaseType) => <Badge variant='outline'>Pha {value}</Badge>
		},
		{
			key: 'totalTopics',
			title: 'Số đề tài',
			sortable: true,
			render: (value: number) => <div className='text-center font-semibold'>{value}</div>
		}
	]

	// ⚡ Hành động cho mỗi hàng
	const actions: TableAction<Period>[] = [
		{
			icon: <Eye className='h-4 w-4' />,
			label: 'Xem chi tiết',
			onClick: (period) => navigate(`/period/${period.id}`)
		},
		{
			icon: <Edit className='h-4 w-4' />,
			label: 'Chỉnh sửa',
			onClick: (period) => {
				setSelectedPeriod(period)
				setEditModalOpen(true)
			}
		},
		{
			icon: <Trash className='h-4 w-4' />,
			label: 'Xóa',
			variant: 'destructive',
			onClick: (period) => {
				setSelectedPeriod(period)
				setDeleteModalOpen(true)
			}
		}
	]

	return (
		<div className='flex h-full flex-col' role='main'>
			<header className='mb-6 flex items-center justify-between'>
				<header className='flex flex-col items-start justify-between'>
					<h1 className='text-2xl font-bold'>Quản lý Đợt Đăng Ký</h1>
					<p className='mt-1 text-muted-foreground'>Quản lý các đợt đăng ký đề tài tốt nghiệp</p>
				</header>
			</header>

			<section aria-label='Bảng quản lý đợt đăng ký'>
				<DataTable<Period>
					// data={data?.datas || []}
					data={data || []}
					columns={columns}
					actions={actions}
					isLoading={isLoading}
					error={error}
					// totalRecords={data?.total_records || 0}
					totalRecords={data?.length || 0}
					pageSize={queryParams.page_size}
					onQueryChange={setQueryParams}
					searchFields={{
						name: 'Tên đợt',
					}}
					emptyState={{
						title: 'Không tìm thấy đợt đăng ký nào',
						description: 'Hãy thử thay đổi tìm kiếm hoặc bộ lọc của bạn'
					}}
					toolbar={
						<Button
							size='default'
							className='flex items-center gap-2'
							onClick={() => onOpenModal(true)}
							aria-label='Thêm đợt mới'
						>
							<Plus className='h-4 w-4' aria-hidden='true' />
							<span className='hidden sm:inline'>Thêm đợt mới</span>
						</Button>
					}
				/>
			</section>

			{/* Edit Period Modal */}
			{selectedPeriod && (
				<EditPeriodModal
					open={editModalOpen}
					onOpenChange={setEditModalOpen} // để modal tự đóng
					period={selectedPeriod} // period cần chỉnh sửa
					onSubmit={() => alert('edited !')}
				/>
			)}

			{/* Delete Period Modal */}
			{selectedPeriod && (
				<DeletePeriodModal
					open={deleteModalOpen}
					onOpenChange={setDeleteModalOpen}
					period={selectedPeriod}
					onConfirm={(periodId) => {
						console.log('Xóa đợt:', periodId)
						// TODO: gọi API xóa hoặc cập nhật state
						alert(`Đã xóa đợt ${periodId}`)
					}}
				/>
			)}
		</div>
	)
}
