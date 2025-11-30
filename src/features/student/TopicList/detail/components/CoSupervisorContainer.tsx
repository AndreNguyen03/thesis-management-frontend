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
import { Check, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Chip } from '@/features/lecturer/new_topic/components/Chip'
import { useGetAllLecturersComboboxQuery } from '@/services/lecturerApi'

interface CoSupervisorContainerContainerProps {
	// Danh sách các field ĐANG ĐƯỢC CHỌN (từ parent truyền xuống)
	selectedCoSupervisors: ResponseMiniLecturerDto[]
	isEditing?: boolean
	// Hàm callback để update ngược lại parent
	onSelectionChange?: (newFields: ResponseMiniLecturerDto[]) => void
}

const CoSupervisorContainer = ({
	selectedCoSupervisors,
	isEditing = true,
	onSelectionChange
}: CoSupervisorContainerContainerProps) => {
	const [open, setOpen] = useState(false)

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
		{ skip: !isEditing || !open }
	)
	// Logic chọn/bỏ chọn
	const handleSelect = (field: ResponseMiniLecturerDto) => {
		const isSelected = selectedCoSupervisors.some((f) => f._id === field._id)
		let newSelected: ResponseMiniLecturerDto[]

		if (isSelected) {
			// Nếu đã chọn -> Bỏ chọn
			newSelected = selectedCoSupervisors.filter((f) => f._id !== field._id)
		} else {
			// Nếu chưa chọn -> Thêm vào
			// Giới hạn chọn tối đa 2 người đồng hướng dẫn
			if (selectedCoSupervisors.length >= 2) {
				return
			}
			newSelected = [...selectedCoSupervisors, field]
		}

		// Gọi callback để parent update state
		onSelectionChange?.(newSelected)
	}

	const handleRemove = (id: string) => {
		console.log('Remove co-supervisor with id:', id)
		const newSelected = selectedCoSupervisors.filter((f) => f._id !== id)
		onSelectionChange?.(newSelected)
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
	// CHẾ ĐỘ XEM (VIEW MODE)
	if (!isEditing) {
		return (
			<div className='rounded-md border border-gray-300 bg-white px-8 py-6'>
				<h4 className='mb-2 text-lg font-semibold text-gray-800'>Lĩnh vực</h4>
				{selectedCoSupervisors.length > 0 ? (
					<div className='flex flex-wrap gap-2'>
						{selectedCoSupervisors.map((lec) => (
							<Badge key={lec._id} variant='blue' className='text-md px-3 py-1'>
								{lec.fullName}
							</Badge>
						))}
					</div>
				) : (
					<p className='text-sm text-gray-500'>Chưa cập nhật lĩnh vực</p>
				)}
			</div>
		)
	}

	// CHẾ ĐỘ CHỈNH SỬA (EDIT MODE)
	return (
		<div>
			<div className='flex items-center gap-4'>
				<h4 className='mb-2 text-lg font-semibold text-gray-800'>Người đồng hướng dẫn</h4>
				<h4 className='mb-2 text-sm font-semibold text-gray-500'>Chọn tối đa 2 người đồng hướng dẫn </h4>
				<h4 className='mb-2 text-lg font-semibold text-blue-600'>{`(${selectedCoSupervisors.length})`}</h4>
			</div>
			{/* 1. Hiển thị các tags đã chọn (có nút xóa) */}
			<div className='mb-2 flex flex-wrap gap-2'>
				{selectedCoSupervisors.map((req) => (
					<Chip key={req._id} label={req.fullName} onRemove={() => handleRemove(req._id)} />
				))}
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
						<span>Thêm yêu cầu...</span>
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
									{coSupervisorsPagingData?.data?.length === 0 && (
										<CommandEmpty>Không tìm thấy yêu cầu.</CommandEmpty>
									)}

									<CommandGroup heading='Danh sách các yêu cầu'>
										{selectableOptions.map((req) => {
											const isSelected = selectedCoSupervisors.some((f) => f._id === req._id)
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
		</div>
	)
}

export default CoSupervisorContainer
