import { type ApiError, type FacultyBoardProfile, type PaginationLecturerQueryParams } from '@/models'

import { Edit, Eye, Loader2, Plus, Trash, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui'
import { CustomPagination } from '@/components/PaginationBar'
import { SelectValue } from '@radix-ui/react-select'
import { useAppSelector } from '@/store'
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

const FacultyLecturerDataTable = () => {
	const navigate = useNavigate()

	// get facultyId from faculty board profile
	const facultyUser = useAppSelector((state) => state.auth.user) as FacultyBoardProfile
	const facultyId = facultyUser.facultyId
	//các state của modal
	// STATE CHO EDIT MODAL
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState<LecturerTable | null>(null)
	const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
	//gọi endpoint lấy tất cả các đợt/kỳ học, faculty board thi facultyId default
	const [queryParams, setQueryParams] = useState<PaginationLecturerQueryParams>({
		page: 1,
		limit: 10,
		search_by: ['user.fullName', 'user.email', 'user.phone'],
		query: '',
		sort_by: 'startTime',
		sort_order: 'desc',
		title: 'all',
		isActive: 'all',
		facultyId: facultyId
	})

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

	return (
		<div className='px-2'>
			<div className='mb-4 flex flex-col justify-between gap-4 sm:flex-row sm:items-center'>
				<div className='flex gap-5'>
					<Input
						placeholder='Tìm kiếm giảng viên theo tên, email, hoặc số điện thoại...'
						value={searchTerm}
						onChange={(e) => onEdit(e.target.value)}
						className='w-[500px] border-gray-300 bg-white'
					/>
					<div className='flex items-center space-x-5'>
						<Select
							onValueChange={(newValue) => {
								setQueryParams((prev) => ({ ...prev, title: newValue as AcademicTitle | 'all' }))
							}}
						>
							<SelectTrigger className='border-gray-300 bg-white'>
								<SelectValue placeholder='Lọc theo học vị' defaultValue={'all'} />
							</SelectTrigger>
							{/* 'Thạc sĩ' | 'Tiến sĩ' | 'Phó Giáo sư' | 'Giáo sư' */}
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
								setQueryParams((prev) => ({ ...prev, isActive: newValue as boolean | 'all' }))
							}
						>
							<SelectTrigger className='border-gray-300 bg-white'>
								<SelectValue placeholder='Lọc theo trạng thái' defaultValue={'all'} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả</SelectItem>
								<SelectItem value='true'>Đang hoạt động</SelectItem>
								<SelectItem value='false'>Ngừng hoạt động</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>
				<div className='space-x-2'>
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
								<td className='max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 sm:max-w-[200px] lg:max-w-[250px]'>
									<span title={lec.fullName}>{lec.fullName}</span>
								</td>
								<td className='max-w-[200px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 sm:max-w-[300px]'>
									<span title={lec.email}>{lec.email}</span>
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
										onClick={() => navigate(`/profile/lecturer/${lec.id}`)}
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
								<td colSpan={8} className='py-12 text-center'>
									<div className='flex flex-col items-center justify-center gap-2'>
										<Loader2 className='h-8 w-8 animate-spin text-blue-500' />
										<span className='text-gray-500'>Đang tải dữ liệu...</span>
									</div>
								</td>
							</tr>
						)}
						{error && (
							<tr>
								<td colSpan={8} className='py-12 text-center'>
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
								<td colSpan={8} className='py-12 text-center'>
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
											console.error('Error when updating lecturer:', error)
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
											console.error('Error when deleting lecturer:', error)
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
