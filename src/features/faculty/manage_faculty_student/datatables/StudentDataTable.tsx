/* eslint-disable @typescript-eslint/no-explicit-any */
import { type ApiError, type PaginationStudentQueryParams } from '@/models'

import { Edit, Eye, Loader2, Trash, XCircle } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import { useDebounce } from '@/hooks/useDebounce'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button, Input, Select, SelectContent, SelectItem, SelectTrigger } from '@/components/ui'
import { CustomPagination } from '@/components/PaginationBar'
import { SelectValue } from '@radix-ui/react-select'

import { CustomBadge } from '@/components/ui/custom-badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'

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

import { useGetMajorsBySameFacultyIdQuery } from '@/services/major.ts'
import type { CreateStudentRequest, FacultyBoardProfile, StudentTable } from '@/models' // Assuming Major type is defined in models
import {
	useCreateStudentMutation,
	useDeleteStudentMutation,
	useGetStudentsQuery,
	useUpdateStudentMutation
} from '@/services/studentApi'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useAppSelector } from '@/store'
import { StudentForm } from '@/features/admin/manage_student/components/StudentForm'

const StudentDataTable = () => {
	const navigate = useNavigate()
	const facultyUser = useAppSelector((state) => state.auth.user) as FacultyBoardProfile
	const facultyId = facultyUser.facultyId
	//các state của modal
	// STATE CHO EDIT MODAL
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
	const [selectedUser, setSelectedUser] = useState<StudentTable | null>(null)
	// const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false)
	const [queryParams, setQueryParams] = useState<PaginationStudentQueryParams>({
		page: 1,
		limit: 10,
		search_by: ['user.fullName', 'user.email', 'user.phone', 'studentCode'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		isActive: 'all',
		facultyId: facultyId,
		major: 'all'
	})

	const skipMajors = facultyId === 'all'
	const majorsArg = {
		facultyId: facultyId!,
		queries: { page: 1, limit: 100 } as PaginationQueryParamsDto
	}
	const { data: majorsRes } = useGetMajorsBySameFacultyIdQuery(majorsArg, { skip: skipMajors })
	const majors = majorsRes?.data ?? []
	// get faculty lecturers data
	const { data: studentData, isLoading, error } = useGetStudentsQuery(queryParams)

	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueryParams((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	const [studentDataState, setStudentDataState] = useState<StudentTable[] | undefined>()
	useEffect(() => {
		if (studentData) setStudentDataState(studentData.data)
	}, [studentData])

	const [createStudent, { isLoading: isCreating }] = useCreateStudentMutation()
	const [updateStudent, { isLoading: isUpdating }] = useUpdateStudentMutation()
	const [deleteStudent] = useDeleteStudentMutation()

	const handleResetFilter = () => {
		setSearchTerm('')

		setQueryParams({
			page: 1,
			limit: 10,
			search_by: ['user.fullName', 'user.email', 'user.phone', 'studentCode'],
			query: '',
			sort_by: 'createdAt',
			sort_order: 'desc',
			isActive: 'all',
			facultyId: facultyId,
			major: 'all'
		})
	}

	const hasFilter = Boolean(searchTerm.trim()) || queryParams.isActive !== 'all' || queryParams.major !== 'all'

	return (
		<div className='px-2'>
			<div className='mb-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between'>
				{/* LEFT: FILTER */}
				<div className='flex flex-wrap items-center gap-4'>
					<Input
						placeholder='Tìm sinh viên theo tên, email, hoặc sđt, mã sinh viên...'
						value={searchTerm}
						onChange={(e) => onEdit(e.target.value)}
						className='w-full border-gray-300 bg-white sm:w-[320px]'
					/>
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
						value={queryParams.major ?? 'all'}
						onValueChange={(value) => {
							return setQueryParams((prev) => ({
								...prev,
								page: 1,
								major: value
							}))
						}}
					>
						<SelectTrigger className='w-[100px] border-gray-300 bg-white'>
							<SelectValue>
								{queryParams.major === 'all'
									? 'Tất cả ngành'
									: majors.find((m) => m.name === queryParams.major)?.name}
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả ngành</SelectItem>
							{majors.map((m) => (
								<SelectItem key={m._id} value={m.name}>
									{m.name}
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
				{/* <div className='flex shrink-0 gap-2'>
					<Button
						className='bg-blue-600 text-white hover:bg-blue-700'
						onClick={() => setIsCreateDialogOpen(true)}
					>
						<Plus />
						Thêm sinh viên
					</Button>
					<Button variant='outline' onClick={() => setIsBulkDialogOpen(true)}>
						<Plus />
						Tạo hàng loạt
					</Button>
				</div> */}
			</div>

			<div className='overflow-x-auto rounded-lg border'>
				<table className='min-w-full bg-white'>
					<thead>
						<tr className='bg-gray-50 text-gray-700'>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Mã sinh viên</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Họ và tên</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Email</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Số điện thoại</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Lớp</th>
							<th className='px-3 py-2 text-left text-[15px] font-semibold'>Ngành</th>
							<th className='px-3 py-2 text-center text-[15px] font-semibold'>Khoa</th>
							<th className='px-3 py-2 text-center text-[15px] font-semibold'>Trạng thái</th>
							<th className='px-3 py-2 text-center text-[15px] font-semibold'>Ngày tạo</th>
							<th className='px-3 py-2 text-center text-[15px] font-semibold'>Hành động</th>
						</tr>
					</thead>
					<tbody>
						{studentDataState?.map((student) => (
							<tr key={student.id} className='border-b last:border-b-0 hover:bg-gray-50'>
								<td className='px-3 py-2'>
									<span className='font-semibold text-gray-900'>{student.studentCode}</span>
								</td>
								<td className='max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 sm:max-w-[150px] lg:max-w-[150px]'>
									<span
										title={student.fullName}
										className='cursor-pointer font-semibold text-gray-900'
									>
										{student.fullName}
									</span>
								</td>
								<td className='max-w-[150px] overflow-hidden text-ellipsis whitespace-nowrap px-3 py-2 sm:max-w-[150px] lg:max-w-[150px]'>
									<span title={student.email} className='cursor-pointer'>
										{student.email}
									</span>
								</td>

								<td className='px-3 py-2'>{student.phone}</td>
								<td className='px-3 py-2'>{student.class}</td>
								<td className='px-3 py-2'>{student.major}</td>
								<td className='px-3 py-2'>{student.facultyName}</td>
								<td className='px-3 py-2'>
									<CustomBadge
										variant={student.isActive ? 'default' : 'secondary'}
										value={student.isActive}
										options={[
											{ label: 'Đang hoạt động', value: true },
											{ label: 'Ngừng hoạt động', value: false }
										]}
										role='button'
										aria-label={`Trạng thái: ${student.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}`}
									>
										{student.isActive ? 'Đang hoạt động' : 'Ngừng hoạt động'}
									</CustomBadge>
								</td>
								<td className='px-3 py-2'>
									<span>
										{student.createdAt
											? new Date(student.createdAt).toLocaleDateString('vi-VN', {
													day: '2-digit',
													month: '2-digit',
													year: 'numeric'
												})
											: '-'}
									</span>
								</td>
								<td className='px-3 py-2 text-center'>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => navigate(`/profile/student/${student.id}`)}
									>
										<Eye className='h-5 w-5 text-blue-500' />
									</button>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => {
											setSelectedUser(student)
											setIsEditDialogOpen(true)
										}}
									>
										<Edit className='h-5 w-5 text-blue-500' />
									</button>
									<button
										className='rounded-full p-2 transition-colors hover:bg-gray-100'
										onClick={() => {
											setSelectedUser(student)
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
								<td colSpan={10} className='py-12 text-center'>
									<div className='flex flex-col items-center justify-center gap-2'>
										<Loader2 className='h-8 w-8 animate-spin text-blue-500' />
										<span className='text-gray-500'>Đang tải dữ liệu...</span>
									</div>
								</td>
							</tr>
						)}
						{error && (
							<tr>
								<td colSpan={10} className='py-12 text-center'>
									<div className='flex flex-col items-center justify-center gap-2'>
										<XCircle className='h-8 w-8 text-red-500' />
										<span className='text-gray-500'>
											{(error as ApiError).data?.message || 'Đã có lỗi xảy ra khi tải dữ liệu'}
										</span>
									</div>
								</td>
							</tr>
						)}
						{!isLoading && !error && studentDataState?.length === 0 && (
							<tr>
								<td colSpan={10} className='py-12 text-center'>
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
							<DialogTitle>Thêm sinh viên</DialogTitle>
						</DialogHeader>

						<StudentForm
							onSubmit={(data: CreateStudentRequest) =>
								createStudent(data)
									.unwrap()
									.then(() => {
										setIsCreateDialogOpen(false)
										toast.success(`Thêm mới sinh viên thành công`, { richColors: true })
									})
									.catch((error: any) => {
										console.error('Error when creating student:', error)
										const message =
											error?.data?.message ||
											error?.message ||
											'Không thể thêm sinh viên. Vui lòng thử lại.'
										toast.error(message || 'Đã có lỗi xảy ra khi thêm sinh viên', {
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
								Chỉnh sửa sinh viên {selectedUser ? `- ${selectedUser.fullName}` : ''}
							</DialogTitle>
						</DialogHeader>

						{selectedUser && (
							<StudentForm
								student={selectedUser}
								onSubmit={(data) =>
									selectedUser &&
									updateStudent({ id: selectedUser.id, data })
										.unwrap()
										.then(() => {
											setIsEditDialogOpen(false)
											toast.success(`Cập nhật thông tin sinh viên thành công`, {
												richColors: true
											})
										})
										.catch((error: any) => {
											console.error('Error when updating student:', error)
											const message =
												error?.data?.message ||
												error?.message ||
												'Không thể chỉnh sửa sinh viên. Vui lòng thử lại.'
											toast.error(message || 'Đã có lỗi xảy ra khi chỉnh sửa sinh viên', {
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
								Hành động này không thể hoàn tác. Tài khoản sinh viên sẽ bị xóa vĩnh viễn.
							</AlertDialogDescription>
						</AlertDialogHeader>

						<AlertDialogFooter>
							<AlertDialogCancel>Hủy</AlertDialogCancel>
							<AlertDialogAction
								onClick={() =>
									selectedUser &&
									deleteStudent(selectedUser.id)
										.unwrap()
										.then(() => {
											setIsDeleteDialogOpen(false)
											toast.success(`Xóa sinh viên thành công`, {
												richColors: true
											})
										})
										.catch((error: any) => {
											console.error('Error when deleting student:', error)
											const message =
												error?.data?.message ||
												error?.message ||
												'Không thể xóa sinh viên. Vui lòng thử lại.'
											toast.error(message || 'Đã có lỗi xảy ra khi xóa sinh viên', {
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

				{/* Hộp thoại tạo hàng loạt
				<BulkCreateStudents isOpen={isBulkDialogOpen} onClose={() => setIsBulkDialogOpen(false)} /> */}

				{studentData?.meta && studentData?.meta.totalPages > 1 && (
					<CustomPagination
						meta={studentData?.meta}
						onPageChange={(p) => setQueryParams((prev) => ({ ...prev, page: p }))}
					/>
				)}
			</div>
		</div>
	)
}

export default StudentDataTable
