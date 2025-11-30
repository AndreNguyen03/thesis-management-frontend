import { Badge, Button } from '@/components/ui'
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useDebounce } from '@/hooks/useDebounce'
import type { RelatedStudentInTopic, ResponseMiniLecturerDto, ResponseMiniStudentDto } from '@/models'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Loader2, Plus, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useAppSelector } from '@/store'
import { useGetStudentsComboboxQuery } from '@/services/studentApi'

interface AddingStudentsContainerProps {
	// Danh sách các field ĐANG ĐƯỢC CHỌN (từ parent truyền xuống)
	students: RelatedStudentInTopic
	handleConfirm: (lecturerId: string) => void
	handleDelete?: (lecturerId: string) => void
	goToApproval: () => void
}

const AddingStudentsContainer = ({
	students,
	handleConfirm,
	handleDelete,
	goToApproval
}: AddingStudentsContainerProps) => {
	const [open, setOpen] = useState(false)
	const user = useAppSelector((state) => state.auth.user)
	const [hoveredId, setHoveredId] = useState<string | null>(null)

	//sử dụng để cộng dồn các lựa chọn khi bấm loadmore
	const [selectableOptions, setSelectableOptions] = useState<ResponseMiniStudentDto[]>([] as ResponseMiniStudentDto[])

	// State cho query tìm kiếm server-side
	// State cho query tìm kiếm server-side
	const [queriesStudent, setQueriesStudent] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 6,
		search_by: 'fullName',
		query: '',
		sort_by: 'fullName',
		sort_order: 'asc'
	})

	// Debounce search
	const setQueriesStudentSearch = (query: string) => {
		setQueriesStudent((prev) => ({ ...prev, query, page: 1 })) // Reset về trang 1 khi search
	}
	const debounceStudentOnChange = useDebounce({ onChange: setQueriesStudentSearch, duration: 300 })
	const handleOpenModal = (boolean: boolean) => {
		setOpen(boolean)
		debounceStudentOnChange('')
	}
	// Fetch data

	const { data: studentsPagingData, isLoading: isLoadingStudents } = useGetStudentsComboboxQuery(queriesStudent, {
		skip: !open
	})

	const handleRemove = (id: string) => {
		handleDelete?.(id)
	}

	const handleLoadMore = () => {
		if (studentsPagingData && studentsPagingData.meta.currentPage < studentsPagingData.meta.totalPages) {
			setQueriesStudent((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
		}
	}
	useEffect(() => {
		if (studentsPagingData?.data) {
			if (queriesStudent.page === 1) {
				// Trường hợp 1: Nếu là trang 1 (hoặc user mới search lại) -> Gán mới hoàn toàn
				setSelectableOptions(studentsPagingData.data)
			} else {
				// Trường hợp 2: Nếu là trang 2 trở đi (Load more) -> Cộng dồn vào mảng cũ
				setSelectableOptions((prev) => {
					// Mẹo: Lọc trùng lặp (nếu API trả về trùng) dựa trên _id
					const newItems = studentsPagingData.data.filter(
						(newItem) => !prev.some((prevItem) => prevItem._id === newItem._id)
					)
					return [...prev, ...newItems]
				})
			}
		}
	}, [studentsPagingData, queriesStudent.page])

	// CHẾ ĐỘ CHỈNH SỬA (EDIT MODE)
	return (
		<div>
			<div className='flex items-center gap-4'>
				<h4 className='mb-2 text-lg font-semibold text-gray-800'>Danh sách sinh viên</h4>
				<h4 className='mb-2 text-lg font-semibold text-blue-700'>{`(${students.approvedStudents.length})`}</h4>
			</div>
			{/* 2. Combobox tìm kiếm & chọn */}
			<Popover open={open} onOpenChange={handleOpenModal}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='w-full justify-between text-left font-normal'
					>
						<span>Thêm Sinh viên</span>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[400px] p-0'>
					<Command shouldFilter={false}>
						<CommandInput placeholder='Tìm kiếm yêu cầu...' onValueChange={debounceStudentOnChange} />
						<CommandList
							className='h-fit max-h-60 overflow-y-auto'
							style={{ overscrollBehavior: 'contain' }}
						>
							{isLoadingStudents ? (
								<div className='flex items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground'>
									<Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
								</div>
							) : (
								<>
									<CommandGroup heading='Danh sách các sinh viên'>
										{selectableOptions.map((req) => {
											const isSelected =
												students.approvedStudents.some((f) => f.student._id === req._id) ||
												students.pendingStudents.some((f) => f.student._id === req._id)

											return (
												<CommandItem
													key={req._id}
													value={req._id} // Lưu ý: value phải unique
													className='cursor-pointer'
													onMouseEnter={() => setHoveredId(req._id)}
													onMouseLeave={() => setHoveredId(null)}
												>
													<div className='flex items-center justify-between'>
														<Check
															className={cn(
																'mr-2 h-4 w-4',
																isSelected ? 'opacity-100' : 'opacity-0'
															)}
														/>
														{req.fullName}

														{hoveredId === req._id && !isSelected && (
															<Button
																size='sm'
																className='ml-2 h-fit w-fit bg-white text-green-700'
																onClick={() => handleConfirm(req._id)}
															>
																Thêm
															</Button>
														)}
													</div>
												</CommandItem>
											)
										})}
									</CommandGroup>
									{studentsPagingData?.data?.length === 0 && (
										<CommandEmpty>Không tìm thấy yêu cầu.</CommandEmpty>
									)}

									{studentsPagingData &&
										studentsPagingData.meta.currentPage < studentsPagingData.meta.totalPages && (
											<>
												<CommandSeparator />
												<CommandGroup>
													<CommandItem
														onSelect={handleLoadMore}
														className='cursor-pointer justify-center text-center font-medium text-blue-600'
													>
														{isLoadingStudents ? (
															<Loader2 className='mr-2 h-4 w-4 animate-spin' />
														) : (
															<Plus className='mr-2 h-4 w-4' />
														)}
														Tải thêm kết quả
													</CommandItem>
												</CommandGroup>
											</>
										)}
								</>
							)}
						</CommandList>
					</Command>
				</PopoverContent>
			</Popover>
			{/* 1. Hiển thị các tags đã chọn (có nút xóa) */}
			<div className='mb-2 mt-2 flex flex-col border'>
				{students.approvedStudents.map((stu) => (
					<div className='flex items-center gap-3 px-3 py-2 hover:bg-gray-200'>
						<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
							{stu.student.avatarUrl ? (
								<img
									src={stu.student.avatarUrl}
									alt={stu.student.fullName}
									className='h-10 w-10 rounded-full object-cover'
								/>
							) : (
								<User className='h-5 w-5 text-primary' />
							)}
						</div>
						<div className='min-w-0 flex-1'>
							<p className='flex gap-2 font-medium text-foreground'>
								{`${stu.student.studentCode} ${stu.student.fullName}`}{' '}
								{user?.role === 'lecturer' && stu.student._id === user.userId && (
									<Badge variant='outlineBlue'> Bạn</Badge>
								)}
							</p>

							<p className='truncate text-sm text-muted-foreground'>{stu.student.email}</p>
							<p className='text-xs text-muted-foreground'>{stu.student.facultyName}</p>
						</div>
						<div
							className='text-gray-400'
							onMouseEnter={() => setHoveredId(stu._id)}
							onMouseLeave={() => setHoveredId(null)}
						>
							<X
								className='h-5 w-5 cursor-pointer hover:text-red-600'
								onClick={() => handleRemove(stu.student._id)}
							/>
						</div>
					</div>
				))}
			</div>
			{/* Danh sách sinh viên đang chờ phê duyệt */}
			{students.pendingStudents.length === 0 ? null : (
				<>
					<div className='flex items-center gap-2'>
						<h4 className='text-lg font-semibold text-orange-800'>Đang chờ phê duyệt</h4>
						<div
							className='cursor-pointer font-normal text-orange-800 hover:underline'
							onClick={goToApproval}
						>
							Đi tới xét duyệt yêu cầu
						</div>
					</div>
					<div className='mb-2 mt-2 flex flex-col border border-orange-400 bg-orange-50'>
						{students.pendingStudents.map((stu) => (
							<div className='flex items-center gap-3 px-3 py-2 hover:bg-gray-200'>
								<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
									{stu.student.avatarUrl ? (
										<img
											src={stu.student.avatarUrl}
											alt={stu.student.fullName}
											className='h-10 w-10 rounded-full object-cover'
										/>
									) : (
										<User className='h-5 w-5 text-primary' />
									)}
								</div>
								<div className='min-w-0 flex-1'>
									<p className='flex gap-2 font-medium text-foreground'>
										{`${stu.student.studentCode} ${stu.student.fullName}`}{' '}
										{user?.role === 'lecturer' && stu.student._id === user.userId && (
											<Badge variant='outlineBlue'> Bạn</Badge>
										)}
									</p>

									<p className='truncate text-sm text-muted-foreground'>{stu.student.email}</p>
									<p className='text-xs text-muted-foreground'>{stu.student.facultyName}</p>
								</div>
							</div>
						))}
					</div>
				</>
			)}
		</div>
	)
}

export default AddingStudentsContainer
