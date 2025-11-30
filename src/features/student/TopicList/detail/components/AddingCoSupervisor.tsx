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
import type { ResponseMiniLecturerDto } from '@/models'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Loader2, Plus, User, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useGetAllLecturersComboboxQuery } from '@/services/lecturerApi'
import { useAppSelector } from '@/store'

interface AddingCoSupervisorContainerProps {
	// Danh sách các field ĐANG ĐƯỢC CHỌN (từ parent truyền xuống)
	selectedCoSupervisors: ResponseMiniLecturerDto[]
	handleConfirm: (lecturerId: string) => void
	handleDelete?: (lecturerId: string) => void
}

const AddingCoSupervisorContainer = ({ selectedCoSupervisors, handleConfirm, handleDelete }: AddingCoSupervisorContainerProps) => {
	const [open, setOpen] = useState(false)
	const user = useAppSelector((state) => state.auth.user)
	const [hoveredId, setHoveredId] = useState<string | null>(null)

	const handleOpenModal = (boolean: boolean) => {
		setOpen(boolean)
		debounceLecturerOnChange('')
	}
	//sử dụng để cộng dồn các lựa chọn khi bấm loadmore
	const [selectableOptions, setSelectableOptions] = useState<ResponseMiniLecturerDto[]>(
		[] as ResponseMiniLecturerDto[]
	)
	// State cho query tìm kiếm server-side
	const [queriesLecturer, setQueriesLecturer] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 6,
		search_by: 'fullName',
		query: '',
		sort_by: 'fullName',
		sort_order: 'asc'
	})

	// Debounce search
	const setQueriesLecturerSearch = (query: string) => {
		setQueriesLecturer((prev) => ({ ...prev, query, page: 1 })) // Reset về trang 1 khi search
	}
	const debounceLecturerOnChange = useDebounce({ onChange: setQueriesLecturerSearch, duration: 300 })

	// Fetch data

	const { data: coSupervisorsPagingData, isLoading: isLoadingCoSupervisors } = useGetAllLecturersComboboxQuery(
		queriesLecturer,
		{ skip: !open }
	)

	const handleRemove = (id: string) => {
		handleDelete?.(id)
	}

	const handleLoadMore = () => {
		if (
			coSupervisorsPagingData &&
			coSupervisorsPagingData.meta.currentPage < coSupervisorsPagingData.meta.totalPages
		) {
			setQueriesLecturer((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
		}
	}
	useEffect(() => {
		if (coSupervisorsPagingData?.data) {
			if (queriesLecturer.page === 1) {
				// Trường hợp 1: Nếu là trang 1 (hoặc user mới search lại) -> Gán mới hoàn toàn
				setSelectableOptions(coSupervisorsPagingData.data)
			} else {
				// Trường hợp 2: Nếu là trang 2 trở đi (Load more) -> Cộng dồn vào mảng cũ
				setSelectableOptions((prev) => {
					// Mẹo: Lọc trùng lặp (nếu API trả về trùng) dựa trên _id
					const newItems = coSupervisorsPagingData.data.filter(
						(newItem) => !prev.some((prevItem) => prevItem._id === newItem._id)
					)
					return [...prev, ...newItems]
				})
			}
		}
	}, [coSupervisorsPagingData, queriesLecturer.page])

	// CHẾ ĐỘ CHỈNH SỬA (EDIT MODE)
	return (
		<div>
			<div className='flex items-center gap-4'>
				<h4 className='mb-2 text-lg font-semibold text-gray-800'>Người đồng hướng dẫn</h4>
				<h4 className='mb-2 text-lg font-semibold text-blue-700'>{`(${selectedCoSupervisors.length})`}</h4>
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
						<span>Thêm giảng viên</span>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[400px] p-0'>
					<Command shouldFilter={false}>
						<CommandInput placeholder='Tìm kiếm yêu cầu...' onValueChange={debounceLecturerOnChange} />
						<CommandList
							className='h-fit max-h-60 overflow-y-auto'
							style={{ overscrollBehavior: 'contain' }}
						>
							{isLoadingCoSupervisors ? (
								<div className='flex items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground'>
									<Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
								</div>
							) : (
								<>
									<CommandGroup heading='Danh sách các yêu cầu'>
										{selectableOptions.map((req) => {
											const isSelected = selectedCoSupervisors.some((f) => f._id === req._id)

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
									{coSupervisorsPagingData?.data?.length === 0 && (
										<CommandEmpty>Không tìm thấy yêu cầu.</CommandEmpty>
									)}

									{coSupervisorsPagingData &&
										coSupervisorsPagingData.meta.currentPage <
											coSupervisorsPagingData.meta.totalPages && (
											<>
												<CommandSeparator />
												<CommandGroup>
													<CommandItem
														onSelect={handleLoadMore}
														className='cursor-pointer justify-center text-center font-medium text-blue-600'
													>
														{isLoadingCoSupervisors ? (
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
				{selectedCoSupervisors.map((lec) => (
					<div className='flex items-center gap-3 px-3 py-2 hover:bg-gray-200'>
						<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
							{lec.avatarUrl ? (
								<img
									src={lec.avatarUrl}
									alt={lec.fullName}
									className='h-10 w-10 rounded-full object-cover'
								/>
							) : (
								<User className='h-5 w-5 text-primary' />
							)}
						</div>
						<div className='min-w-0 flex-1'>
							<p className='flex gap-2 font-medium text-foreground'>
								{`${lec.title} ${lec.fullName}`}{' '}
								<span className='font-normal text-gray-500'>{lec.roleInTopic}</span>
								{user?.role === 'lecturer' && lec._id === user.userId && (
									<Badge variant='outlineBlue'> Bạn</Badge>
								)}
							</p>

							<p className='truncate text-sm text-muted-foreground'>{lec.email}</p>
							<p className='text-xs text-muted-foreground'>{lec.facultyName}</p>
						</div>
						<div
							className='text-gray-400'
							onMouseEnter={() => setHoveredId(lec._id)}
							onMouseLeave={() => setHoveredId(null)}
						>
							<X
								className='h-5 w-5 cursor-pointer hover:text-red-600'
								onClick={() => handleRemove(lec._id)}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

export default AddingCoSupervisorContainer
