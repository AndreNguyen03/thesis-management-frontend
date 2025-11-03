import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Edit2, Plus, Trash2 } from 'lucide-react'
import { DialogHeader, Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { DEFAULT_PASSWORD, type CreateStudentRequest, type StudentTable } from './types'
import { DataTable } from '@/components/ui/DataTable'
import type { QueryParams, TableColumn, TableAction } from '@/components/ui/DataTable/types'
import { CustomBadge } from '@/components/ui/custom-badge'
import { StudentForm } from './components/StudentForm'
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
import { usePageBreadcrumb } from '@/hooks'
import {
	useCreateStudentMutation,
	useDeleteStudentMutation,
	useGetStudentsQuery,
	useUpdateStudentMutation
} from '@/services/studentApi'

export const ManageStudentPage = () => {
	const searchFields = {
		email: 'Email',
		fullName: 'Họ và tên',
		isActive: 'Trạng thái',
		phone: 'Số điện thoại',
		created_at: 'Ngày tạo'
	}

	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Quản lý sinh viên' }])

	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedStudent, setSelectedStudent] = useState<StudentTable | null>(null)

	const [queryParams, setQueryParams] = useState<QueryParams>({
		page: 1,
		page_size: 10,
		search_by: 'fullName',
		query: '',
		sort_by: 'fullName',
		sort_order: 'asc'
	})

	const { data, isLoading, error } = useGetStudentsQuery(queryParams)
    console.log('student :', data)
	const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation()
	const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation()
	const [deleteStudent] = useDeleteStudentMutation()

	const columns: TableColumn<StudentTable>[] = [
		{ key: 'studentCode', title: 'Mã sinh viên', sortable: true, searchable: true },
		{ key: 'fullName', title: 'Họ và tên', sortable: true, searchable: true },
		{ key: 'email', title: 'Email', sortable: true, searchable: true },
		{ key: 'phone', title: 'Số điện thoại', sortable: true, searchable: true },
		{ key: 'class', title: 'Lớp', sortable: true, searchable: true },
		{ key: 'major', title: 'Chuyên ngành', sortable: true, searchable: true },
		{ key: 'facultyName', title: 'Khoa', sortable: true, searchable: true },
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
				>
					{value ? 'Đang hoạt động' : 'Ngừng hoạt động'}
				</CustomBadge>
			),
			renderSearchInput: ({ value, onChange }) => (
				<Select onValueChange={(newValue) => onChange({ value: newValue })} value={value.value}>
					<SelectTrigger className='w-full'>
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
						onChange({ value: date.toISOString().split('T')[0], date })
					}}
					className='flex h-10 w-full rounded-md border border-input px-3 py-2 text-sm'
				/>
			)
		}
	]

	const actions: TableAction<StudentTable>[] = [
		{
			icon: <Edit2 className='h-4 w-4' />,
			label: 'edit',
			onClick: (user) => {
				setSelectedStudent(user)
				setIsEditDialogOpen(true)
			},
			variant: 'outline'
		},
		{
			icon: <Trash2 className='h-4 w-4' />,
			label: 'delete',
			onClick: (user) => {
				setSelectedStudent(user)
				setIsDeleteDialogOpen(true)
			},
			variant: 'outline'
		}
	]

	return (
		<>
			<div className='flex h-full flex-col' role='main'>
				<header className='mb-6 flex items-center justify-between'>
					<h1 className='text-2xl font-bold'>Danh sách sinh viên</h1>
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
							title: 'Không tìm thấy sinh viên nào',
							description: 'Hãy thử thay đổi tìm kiếm hoặc bộ lọc của bạn'
						}}
						toolbar={
							<div className='flex gap-2'>
								<Button
									size='default'
									className='flex items-center gap-2'
									onClick={() => setIsCreateDialogOpen(true)}
									aria-label='Thêm quản trị viên'
								>
									<Plus className='h-4 w-4' aria-hidden='true' />
									<span className='hidden sm:inline'>Thêm sinh viên</span>
								</Button>

								<Button
									size='default'
									className='flex items-center gap-2'
									aria-label='Tạo sinh viên hàng loạt'
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
						<DialogTitle>Thêm sinh viên</DialogTitle>
					</DialogHeader>

					<StudentForm
						onSubmit={(data: CreateStudentRequest) =>
							createStudent({ ...data, password: DEFAULT_PASSWORD })
								.unwrap()
								.then(() => {
									setIsCreateDialogOpen(false)
									toast({ title: 'Thành công', description: 'Đã thêm sinh viên mới.' })
								})
								.catch((error) => {
									console.error('Error creating student:', error)
									toast({
										title: 'Lỗi',
										description: error?.data?.message || 'Không thể thêm sinh viên.',
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
							Chỉnh sửa sinh viên {selectedStudent ? `- ${selectedStudent.fullName}` : ''}
						</DialogTitle>
					</DialogHeader>

					{selectedStudent && (
						<StudentForm
							student={selectedStudent}
							onSubmit={(data) =>
								selectedStudent &&
								updateStudent({ id: selectedStudent.id, data })
									.unwrap()
									.then(() => {
                                        console.log(`update student data ::`, data)
										setIsEditDialogOpen(false)
										toast({
											title: 'Thành công',
											description: 'Đã cập nhật thông tin sinh viên.'
										})
									})
									.catch(() =>
										toast({
											title: 'Lỗi',
											description: 'Không thể cập nhật thông tin sinh viên.',
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
							Hành động này không thể hoàn tác. Tài khoản sinh viên sẽ bị xóa vĩnh viễn.
						</AlertDialogDescription>
					</AlertDialogHeader>

					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction
							onClick={() =>
								selectedStudent &&
								deleteStudent(selectedStudent.id)
									.unwrap()
									.then(() => {
										setIsDeleteDialogOpen(false)
										toast({
											title: 'Thành công',
											description: 'Đã xóa sinh viên thành công.'
										})
									})
									.catch(() =>
										toast({
											title: 'Lỗi',
											description: 'Không thể xóa sinh viên.',
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
		</>
	)
}
