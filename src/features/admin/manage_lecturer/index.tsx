import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { DialogHeader, Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import type { CreateUserRequest, LecturerTable } from './types'
import {
	useGetLecturersQuery,
	useCreateLecturerMutation,
	useUpdateLecturerMutation,
	useDeleteLecturerMutation
} from '@/services/lecturerApi'
import { DataTable } from '@/components/ui/DataTable'
import type { QueryParams, TableColumn, TableAction } from '@/components/ui/DataTable/types'
import { CustomBadge } from '@/components/ui/custom-badge'
import { LecturerForm } from './components/LecturerForm'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/use-toast'
import { toErrorObject } from '@/utils/catch-error'
import { BulkCreateModal } from './components/BulkCreateModal'
import { usePageBreadcrumb } from '@/hooks'

export const ManageLecturerPage = () => {
	const searchFields = {
		email: 'Email',
		fullName: 'Họ và tên',
		isActive: 'Trạng thái',
		phone: 'Số điện thoại',
		created_at: 'Ngày tạo'
	}

	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Quản lý giảng viên' }])

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState<LecturerTable | null>(null)
	const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)

	const [queryParams, setQueryParams] = useState<QueryParams>({
		page: 1,
		page_size: 10,
		search_by: 'fullName',
		query: '',
		sort_by: 'fullName',
		sort_order: 'asc'
	})

	const { data, isLoading, error } = useGetLecturersQuery(queryParams)
	console.log('lecturer ::', data)
	const [createLecturer, { isLoading: isCreating }] = useCreateLecturerMutation()
	const [updateLecturer, { isLoading: isUpdating }] = useUpdateLecturerMutation()
	const [deleteLecturer] = useDeleteLecturerMutation()

	const columns: TableColumn<LecturerTable>[] = [
		{
			key: 'fullName',
			title: 'Họ và tên',
			sortable: true,
			searchable: true
		},
		{
			key: 'email',
			title: 'Email',
			sortable: true,
			searchable: true
		},
		{
			key: 'facultyName',
			title: 'Khoa',
			sortable: true,
			searchable: true
		},
		{
			key: 'title',
			title: 'Học vị',
			sortable: true,
			searchable: true
		},
		{
			key: 'phone',
			title: 'Số điện thoại',
			sortable: true,
			searchable: true
		},
		{
			key: 'isActive',
			title: 'Trạng thái',
			sortable: true,
			searchable: true,
			render: (value) => (
				<CustomBadge
					variant={value ? 'default' : 'secondary'}
					value={value}
					options={[
						{ label: 'Đang hoạt động', value: true },
						{ label: 'Ngừng hoạt động', value: false }
					]}
					role='button'
					aria-label={`Trạng thái: ${value ? 'Đang hoạt động' : 'Ngừng hoạt động'}`}
				>
					{value ? 'Đang hoạt động' : 'Ngừng hoạt động'}
				</CustomBadge>
			),
			renderSearchInput: ({ value, onChange }) => (
				<Select onValueChange={(newValue) => onChange({ value: newValue })} value={value.value}>
					<SelectTrigger className='w-full' aria-label='Lọc theo trạng thái'>
						<SelectValue placeholder='Chọn trạng thái' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='1'>Đang hoạt động</SelectItem>
						<SelectItem value='0'>Ngừng hoạt động</SelectItem>
					</SelectContent>
				</Select>
			)
		},
		{
			key: 'createdAt',
			title: 'Ngày tạo',
			sortable: true,
			searchable: true,
			render: (value) => new Date(value).toLocaleDateString('vi-VN'),
			renderSearchInput: ({ value, onChange }) => (
				<input
					type='date'
					value={value.date?.toISOString().split('T')[0] || ''}
					onChange={(e) => {
						const date = new Date(e.target.value)
						onChange({
							value: date.toISOString().split('T')[0],
							date
						})
					}}
					aria-label='Lọc theo ngày tạo'
					className='flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
				/>
			)
		}
		// {
		// 	key: 'last_login',
		// 	title: 'Lần hoạt động gần nhất',
		// 	sortable: true,
		// 	searchable: true
		// }
	]

	const actions: TableAction<LecturerTable>[] = [
		{
			icon: <Edit2 className='h-4 w-4' />,
			label: 'edit',
			onClick: (user) => {
				setSelectedUser(user)
				setIsEditDialogOpen(true)
			},
			variant: 'outline'
		},
		{
			icon: <Trash2 className='h-4 w-4' />,
			label: 'delete',
			onClick: (user) => {
				setSelectedUser(user)
				setIsDeleteDialogOpen(true)
			},
			variant: 'outline'
		}
	]

	return (
		<>
			<div className='flex h-full flex-col' role='main'>
				<header className='mb-6 flex items-center justify-between'>
					<h1 className='text-2xl font-bold'>Danh sách giảng viên</h1>
				</header>

				<section aria-label='Bảng quản lý quản trị viên'>
					<DataTable
						data={data?.datas || []}
						columns={columns}
						actions={actions}
						isLoading={isLoading}
						error={toErrorObject(error)}
						totalRecords={data?.total_records || 0}
						pageSize={queryParams.page_size}
						searchFields={searchFields}
						onQueryChange={setQueryParams}
						emptyState={{
							title: 'Không tìm thấy giảng viên nào',
							description: 'Hãy thử thay đổi tìm kiếm hoặc bộ lọc của bạn'
						}}
						toolbar={
							<div className='flex gap-2'>
								{/* Nút Thêm quản trị viên */}
								<Button
									size='default'
									className='flex items-center gap-2'
									onClick={() => setIsCreateDialogOpen(true)}
									aria-label='Thêm quản trị viên'
								>
									<Plus className='h-4 w-4' aria-hidden='true' />
									<span className='hidden sm:inline'>Thêm quản trị viên</span>
								</Button>

								{/* Nút Tạo hàng loạt */}
								<Button
									size='default'
									className='flex items-center gap-2'
									onClick={() => setIsBulkDialogOpen(true)}
									aria-label='Tạo quản trị viên hàng loạt'
									variant='outline'
								>
									<Plus className='h-4 w-4' aria-hidden='true' />
									<span className='hidden sm:inline'>Tạo hàng loạt</span>
								</Button>
							</div>
						}
					/>
				</section>
			</div>

			{/* Hộp thoại tạo mới */}
			<Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Thêm giảng viên</DialogTitle>
					</DialogHeader>

					<LecturerForm
						onSubmit={(data: CreateUserRequest) =>
							createLecturer(data)
								.unwrap()
								.then(() => {
									setIsCreateDialogOpen(false)
									toast({
										title: 'Thành công',
										description: 'Đã thêm giảng viên mới.'
									})
								})
								.catch((error) => {
									console.error('Error when creating lecturer:', error)
									const message =
										error?.data?.message ||
										error?.message ||
										'Không thể thêm giảng viên. Vui lòng thử lại.'
									toast({
										title: 'Lỗi',
										description: message,
										variant: 'destructive'
									})
								})
						}
						isLoading={isCreating}
					/>
				</DialogContent>
			</Dialog>

			{/* Hộp thoại chỉnh sửa */}
			<Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Chỉnh sửa giảng viên {selectedUser ? `- ${selectedUser.fullName}` : ''}
						</DialogTitle>
					</DialogHeader>

					{selectedUser && (
						<LecturerForm
							lecturer={selectedUser}
							onSubmit={(data) =>
								selectedUser &&
								updateLecturer({ id: selectedUser.id, data })
									.unwrap()
									.then(() => {
										setIsEditDialogOpen(false)
										toast({
											title: 'Thành công',
											description: 'Đã cập nhật thông tin giảng viên.'
										})
									})
									.catch(() =>
										toast({
											title: 'Lỗi',
											description: 'Không thể cập nhật thông tin giảng viên.',
											variant: 'destructive'
										})
									)
							}
							isLoading={isUpdating}
						/>
					)}
				</DialogContent>
			</Dialog>

			{/* Hộp thoại xác nhận xóa */}
			<AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Bạn có chắc chắn không?</AlertDialogTitle>
						<AlertDialogDescription>
							Hành động này không thể hoàn tác. Tài khoản giảng viên sẽ bị xóa vĩnh viễn.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								selectedUser &&
								deleteLecturer(selectedUser.id)
									.unwrap()
									.then(() => {
										setIsDeleteDialogOpen(false)
										toast({
											title: 'Thành công',
											description: 'Đã xóa giảng viên thành công.'
										})
									})
									.catch(() =>
										toast({
											title: 'Lỗi',
											description: 'Không thể xóa giảng viên.',
											variant: 'destructive'
										})
									)
							}
							className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
						>
							Xóa
						</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>

			{/* Hộp thoại tạo hàng loạt */}
			<BulkCreateModal isOpen={isBulkDialogOpen} onClose={() => setIsBulkDialogOpen(false)} />
		</>
	)
}
