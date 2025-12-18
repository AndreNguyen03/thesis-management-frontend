import { Badge, Button, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
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
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Chip } from '@/features/lecturer/new_topic/components/Chip'
import type { ResponseMiniStudentDto } from '@/models'
import { useGetStudentsComboboxQuery } from '@/services/studentApi'
interface StudentContainerProps {
	// Danh sách các field ĐANG ĐƯỢC CHỌN (từ parent truyền xuống)
	selectedStudents: ResponseMiniStudentDto[]
	isEditing?: boolean
	// Hàm callback để update ngược lại parent
	onSelectionChange?: (newStudents: ResponseMiniStudentDto[]) => void
	maxStudents: number
	setMaxStudents: (num: number) => void
}

const StudentContainer = ({
	selectedStudents,
	isEditing = true,
	onSelectionChange,
	maxStudents,
	setMaxStudents
}: StudentContainerProps) => {
	const [open, setOpen] = useState(false)

	//sử dụng để cộng dồn các lựa chọn khi bấm loadmore
	const [selectableOptions, setSelectableOptions] = useState<ResponseMiniStudentDto[]>([] as ResponseMiniStudentDto[])
	// State cho query tìm kiếm server-side
	const [queriesStudent, setQueriesStudent] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 6,
		search_by: ['fullName'],
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
	// Logic chọn/bỏ chọn
	const handleSelect = (field: ResponseMiniStudentDto) => {
		const isSelected = selectedStudents.some((f) => f._id === field._id)
		let newSelected: ResponseMiniStudentDto[]
		if (isSelected) {
			// Nếu đã chọn -> Bỏ chọn
			newSelected = selectedStudents.filter((f) => f._id !== field._id)
		} else {
			// Nếu chưa chọn -> Thêm vào
			// Giới hạn chọn tối đa {maxStudents} sinh viên thực hiện đề tài
			if (selectedStudents.length >= maxStudents) {
				return
			}
			newSelected = [...selectedStudents, field]
		}

		// Gọi callback để parent update state
		onSelectionChange?.(newSelected)
	}

	const handleRemove = (id: string) => {
		const newSelected = selectedStudents.filter((f) => f._id !== id)
		onSelectionChange?.(newSelected)
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
	// CHẾ ĐỘ XEM (VIEW MODE)
	if (!isEditing) {
		return (
			<div className='rounded-md border border-gray-300 bg-white px-8 py-6'>
				<h4 className='mb-2 text-lg font-semibold text-gray-800'>Sinh viên thực hiện</h4>
				{selectedStudents.length > 0 ? (
					<div className='flex flex-wrap gap-2'>
						{selectedStudents.map((lec) => (
							<Badge key={lec._id} variant='blue' className='text-md px-3 py-1'>
								{lec.fullName}
							</Badge>
						))}
					</div>
				) : (
					<p className='text-sm text-gray-500'>Chưa cập nhật mục sinh viên thực hiện</p>
				)}
			</div>
		)
	}
	return (
		<div>
			<div className='flex items-center gap-4'>
				<h4 className='mb-2 text-lg font-semibold text-gray-800'>Sinh viên thực hiện</h4>
				<h4 className='mb-2 text-sm font-semibold text-gray-500'>{`Đề tài sẽ có tối đa ${maxStudents} sinh viên thực hiện`}</h4>
				<h4 className='mb-2 text-lg font-semibold text-blue-600'>{`(${selectedStudents.length})`}</h4>
			</div>
			{/* 1. Hiển thị các tags đã chọn (có nút xóa) */}
			<div className='mb-2 flex flex-wrap gap-2'>
				{selectedStudents.map((req) => (
					<Chip key={req._id} label={req.fullName} onRemove={() => handleRemove(req._id)} />
				))}
			</div>
			<div className='flex flex-col items-start gap-3 sm:flex-row'>
				<div className='flex-1'>
					<Select
						value={maxStudents.toString()}
						onValueChange={(value) => {
							setMaxStudents(parseInt(value))
						}}
					>
						<SelectTrigger id='max-students' className='bg-background'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent className='bg-popover'>
							{[1, 2, 3, 4].map((num) => (
								<SelectItem key={num} value={num.toString()}>
									{num} sinh viên
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				<div className='flex-1'>
					{/* 2. Combobox tìm kiếm & chọn */}
					<Popover open={open} onOpenChange={handleOpenModal}>
						<PopoverTrigger asChild>
							<Button
								variant='outline'
								role='combobox'
								aria-expanded={open}
								className='w-full justify-between text-left font-normal'
							>
								<span>Thêm sinh viên thực hiện</span>
								<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
							</Button>
						</PopoverTrigger>
						<PopoverContent className='w-fit p-0'>
							<Command shouldFilter={false}>
								<CommandInput
									placeholder='Tìm kiếm yêu cầu...'
									onValueChange={debounceStudentOnChange}
								/>
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
											{studentsPagingData?.data?.length === 0 && (
												<CommandEmpty>Không tìm thấy sinh viên.</CommandEmpty>
											)}

											<CommandGroup heading='Danh sách các sinh viên'>
												{selectableOptions.map((req) => {
													const isSelected = selectedStudents.some((f) => f._id === req._id)
													return (
														<CommandItem
															key={req._id}
															value={req._id} // Lưu ý: value phải unique
															onSelect={() => handleSelect(req)}
															className='cursor-pointer'
														>
															<Check
																className={cn(
																	'mr-2 h-4 w-4',
																	isSelected ? 'opacity-100' : 'opacity-0'
																)}
															/>
															{req.fullName}
														</CommandItem>
													)
												})}
											</CommandGroup>

											{studentsPagingData &&
												studentsPagingData.meta.currentPage <
													studentsPagingData.meta.totalPages && (
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
				</div>
			</div>
		</div>
	)
}

export default StudentContainer
