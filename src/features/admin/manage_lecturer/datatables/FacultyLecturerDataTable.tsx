import { type ApiError, type PaginationLecturerQueryParams } from '@/models'

import { Edit, Eye, Loader2, Plus, Trash, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui'
import { CustomPagination } from '@/components/PaginationBar'
import { SelectValue } from '@radix-ui/react-select'
import {
	useCreateLecturerMutation,
	useDeleteLecturerMutation,
	useGetLecturersQuery,
	useUpdateLecturerMutation
} from '@/services/lecturerApi'
import type { AcademicTitle, CreateUserRequest, LecturerTable } from '@/features/admin/manage_lecturer/types'
import { CustomBadge } from '@/components/ui/custom-badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { LecturerForm } from '@/features/admin/manage_lecturer/components/LecturerForm'
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
import { BulkCreateLecturers } from '@/features/admin/manage_lecturer/components/BulkCreateLecturers'
import { useGetFacultiesQuery } from '@/services/facultyApi'

const FacultyLecturerDataTable = () => {
	// search input handler
	// const navigate = useNavigate()

	//các state của modal
	// STATE CHO EDIT MODAL
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState<LecturerTable | null>(null)
	const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
	const [queryParams, setQueryParams] = useState<PaginationLecturerQueryParams>({
		page: 1,
		limit: 10,
		search_by: ['user.fullName', 'user.email', 'user.phone'],
		query: '',
		sort_by: 'startTime',
		sort_order: 'desc',
		title: 'all',
		isActive: 'all',
		facultyId: 'all'
	})

	const { data: facultyRes } = useGetFacultiesQuery({
		page: 1,
		limit: 100
	})
	const faculties = facultyRes?.data ?? []

	// get faculty lecturers data
	const { data: lecturerData, isLoading, error } = useGetLecturersQuery(queryParams)

	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueryParams((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	const [lecturerDataState, setLecturerDataState] = useState<LecturerTable[] | undefined>()
	useEffect(() => {
		if (lecturerData) setLecturerDataState(lecturerData.data)
	}, [lecturerData])

	const [createLecturer, { isLoading: isCreating }] = useCreateLecturerMutation()
	const [updateLecturer, { isLoading: isUpdating }] = useUpdateLecturerMutation()
	const [deleteLecturer] = useDeleteLecturerMutation()

	const handleResetFilter = () => {
		setSearchTerm('')

		setQueryParams({
			page: 1,
			limit: 10,
			search_by: ['user.fullName', 'user.email', 'user.phone'],
			query: '',
			sort_by: 'startTime',
			sort_order: 'desc',
			title: 'all',
			isActive: 'all',
			facultyId: 'all'
		})
	}

    console.log('lecturerData', lecturerData)

	const hasFilter =
		Boolean(searchTerm.trim()) ||
		queryParams.title !== 'all' ||
		queryParams.isActive !== 'all' ||
		queryParams.facultyId !== 'all'

	return (
		<div className='px-2'>
			<div className='mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
				{/* LEFT: FILTER */}
				<div className='flex flex-wrap items-center gap-4'>
					<Input
						placeholder='Tìm giảng viên theo tên, email, hoặc sđt'
						value={searchTerm}
						onChange={(e) => onEdit(e.target.value)}
						className='w-full border-gray-300 bg-white sm:w-[320px]'
					/>

					<Select
						onValueChange={(newValue) =>
							setQueryParams((prev) => ({ ...prev, page: 1, title: newValue as AcademicTitle | 'all' }))
						}
					>
						<SelectTrigger className='w-[100px] border-gray-300 bg-white'>
							<SelectValue placeholder='Học vị' />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả</SelectItem>
							<SelectItem value='Thạc sĩ'>Thạc sĩ</SelectItem>
							<SelectItem value='Tiến sĩ'>Tiến sĩ</SelectItem>
							<SelectItem value='Phó Giáo sư'>Phó Giáo sư</SelectItem>
							<SelectItem value='Giáo sư'>Giáo sư</SelectItem>
						</SelectContent>
					</Select>

					<Select
						onValueChange={(newValue) =>
							setQueryParams((prev) => ({ ...prev, page: 1, isActive: newValue as boolean | 'all' }))
						}
					>
						<SelectTrigger className='w-[100px] border-gray-300 bg-white'>
							<SelectValue placeholder='Trạng thái'>
								{queryParams.isActive === 'all'
									? 'Tất cả'
									: queryParams.isActive
										? 'Đang hoạt động'
										: 'Ngừng hoạt động'}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả</SelectItem>
							<SelectItem value='true'>Đang hoạt động</SelectItem>
							<SelectItem value='false'>Ngừng hoạt động</SelectItem>
						</SelectContent>
					</Select>

					<Select
						value={queryParams.facultyId ?? 'all'}
						onValueChange={(value) => {
							return setQueryParams((prev) => ({
								...prev,
								page: 1,
								facultyId: value
							}))
						}}
					>
						<SelectTrigger className='w-[150px] border-gray-300 bg-white'>
							<SelectValue>
								{queryParams.facultyId === 'all'
									? 'Tất cả khoa'
									: faculties.find((f) => f._id === queryParams.facultyId)?.name}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả khoa</SelectItem>
							{faculties.map((f) => (
								<SelectItem key={f._id} value={f._id}>
									{f.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{hasFilter && (
						<Button variant='outline' onClick={handleResetFilter} className='gap-2 text-gray-700'>
							<XCircle className='h-4 w-4' />
							Xóa filter
						</Button>
					)}
				</div>

				{/* RIGHT: ACTION */}
				<div className='flex shrink-0 gap-2'>
					<Button
						className='bg-blue-600 text-white hover:bg-blue-700'
						onClick={() => setIsCreateDialogOpen(true)}
					>
						<Plus />
						Thêm giảng viên
					</Button>
					<Button variant='outline' onClick={() => setIsBulkDialogOpen(true)}>
						<Plus />
						Tạo hàng loạt
					</Button>
				</div>
			</div>

			<div className='overflow-x-auto rounded-lg border'>
				<table className='min-w-full bg-white'>
					<thead>
						<tr className='bg-gray-50 text-gray-700'>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Họ và tên</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Email</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Khoa</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Học vị</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Số diện thoại</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Trạng thái</th>
							<th className='px-3 py-2 text-center text-[15px] font-semibold'>Ngày tạo</th>
							<th className='px-3 py-2 text-center text-[15px] font-semibold'>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{lecturerDataState?.map((lec) => (
							<tr key={lec.id} className='border-b last:border-b-0 hover:bg-gray-50'>
								<td className='px-3 py-2'>
									<span className='font-semibold text-gray-900'>{lec.fullName}</span>
								</td>
								<td className='px-3 py-2'>
									<span className='font-semibold text-gray-900'>{lec.email}</span>
								</td>
								<td className='px-3 py-2'>{lec.facultyName}</td>
								<td className='px-3 py-2'>{lec.title}</td>
								<td className='px-3 py-2'>{lec.phone}</td>
								<td className='px-3 py-2'>
									<CustomBadge
										variant={lec.isActive ? 'default' : 'secondary'}
										value={lec.isActive}
										options={[
											{ label: 'Đang hoạt động', value: true },
											{ label: 'Ngừng hoạt động', value: false }
										]}
										role='button'
										aria-label={`Trạng thái: ${lec.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}`}
									>
										{lec.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
									</CustomBadge>
								</td>
								<td className='px-3 py-2'>
									<span>
										{new Date(lec.createdAt).toLocaleDateString('vi-VN', {
											day: '2-digit',
											month: '2-digit',
											year: 'numeric'
										})}
									</span>
								</td>
								<td className='px-3 py-2 text-center'>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => alert('Chức năng đang phát triển')}
									>
										<Eye className='h-5 w-5 text-blue-500' />
									</button>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => {
											setSelectedUser(lec)
											setIsEditDialogOpen(true)
										}}
									>
										<Edit className='h-5 w-5 text-blue-500' />
									</button>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => {
											setSelectedUser(lec)
											setIsDeleteDialogOpen(true)
										}}
									>
										<Trash className='h-5 w-5 text-red-500' />
									</button>
								</td>
							</tr>
						))}
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
						{!isLoading && !error && lecturerDataState?.length === 0 && (
							<tr>
								<td colSpan={7} className='py-12 text-center'>
									<EmptyState title='Không có dữ liệu' />
								</td>
							</tr>
						)}
					</tbody>
				</table>

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
										toast.success(`Thêm mới giảng viên thành công`, { richColors: true })
									})
									.catch((error) => {
										console.error('Error when creating lecturer:', error)
										const message =
											error?.data?.message ||
											error?.message ||
											'Không thể thêm giảng viên. Vui lòng thử lại.'
										toast.error(message || 'Đã có lỗi xảy ra khi thêm giảng viên', {
											richColors: true
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
											toast.success(`Cập nhật thông tin giảng viên thành công`, {
												richColors: true
											})
										})
										.catch((error) => {
											console.error('Error when creating lecturer:', error)
											const message =
												error?.data?.message ||
												error?.message ||
												'Không thể chỉnh sửa giảng viên. Vui lòng thử lại.'
											toast.error(message || 'Đã có lỗi xảy ra khi chỉnh sửa giảng viên', {
												richColors: true
											})
										})
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
											toast.success(`Xóa giảng viên thành công`, {
												richColors: true
											})
										})
										.catch((error) => {
											console.error('Error when creating lecturer:', error)
											const message =
												error?.data?.message ||
												error?.message ||
												'Không thể xóa giảng viên. Vui lòng thử lại.'
											toast.error(message || 'Đã có lỗi xảy ra khi xóa giảng viên', {
												richColors: true
											})
										})
								}
								className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
							>
								Xóa
							</AlertDialogAction>
						</AlertDialogFooter>
					</AlertDialogContent>
				</AlertDialog>

				{/* Hộp thoại tạo hàng loạt */}
				<BulkCreateLecturers isOpen={isBulkDialogOpen} onClose={() => setIsBulkDialogOpen(false)} />

				{lecturerData?.meta && lecturerData?.meta.totalPages > 1 && (
					<CustomPagination
						meta={lecturerData?.meta}
						onPageChange={(p) => setQueryParams((prev) => ({ ...prev, page: p }))}
					/>
				)}
			</div>
		</div>
	)
}

export default FacultyLecturerDataTable
