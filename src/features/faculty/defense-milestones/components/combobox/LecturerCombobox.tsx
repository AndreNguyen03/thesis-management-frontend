import { Button } from '@/components/ui'
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
import { useGetAllLecturersComboboxQuery } from '@/services/lecturerApi'
import { ChevronsUpDown, Loader2, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface LecturersComboboxProps {
	onSelect?: (lecturer: ResponseMiniLecturerDto) => void
}

const LecturersCombobox = ({ onSelect }: LecturersComboboxProps) => {
	const [open, setOpen] = useState(false)

	const handleOpenModal = (boolean: boolean) => {
		setOpen(boolean)
		debounceFieldOnChange('')
	}
	//sử dụng để cộng dồn các lựa chọn khi bấm loadmore
	const [selectableOptions, setSelectableOptions] = useState<ResponseMiniLecturerDto[]>([])
	// State cho query tìm kiếm server-side
	const [queriesField, setQueriesField] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 8,
		search_by: ['fullName'],
		query: '',
		sort_by: 'fullName',
		sort_order: 'asc'
	})

	// Debounce search
	const setQueriesFieldSearch = (query: string) => {
		setQueriesField((prev) => ({ ...prev, query, page: 1 })) // Reset về trang 1 khi search
	}
	const debounceFieldOnChange = useDebounce({ onChange: setQueriesFieldSearch, duration: 300 })

	// Fetch data
	const {
		data: lecturerPagingData,
		isLoading,
		isFetching
	} = useGetAllLecturersComboboxQuery(queriesField, { skip: !open })

	// Logic chọn
	const handleSelect = (lecturer: ResponseMiniLecturerDto) => {
		onSelect?.(lecturer)
		setOpen(false) // Close popover after selection
	}

	const handleLoadMore = () => {
		if (lecturerPagingData && lecturerPagingData.meta.currentPage < lecturerPagingData.meta.totalPages) {
			setQueriesField((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
		}
	}
	useEffect(() => {
		if (lecturerPagingData?.data) {
			if (queriesField.page === 1) {
				// Trường hợp 1: Nếu là trang 1 (hoặc user mới search lại) -> Gán mới hoàn toàn
				setSelectableOptions(lecturerPagingData.data)
			} else {
				// Trường hợp 2: Nếu là trang 2 trở đi (Load more) -> Cộng dồn vào mảng cũ
				setSelectableOptions((prev) => {
					// Mẹo: Lọc trùng lặp (nếu API trả về trùng) dựa trên _id
					const newItems = lecturerPagingData.data.filter(
						(newItem) => !prev.some((prevItem) => prevItem._id === newItem._id)
					)
					return [...prev, ...newItems]
				})
			}
		}
	}, [lecturerPagingData, queriesField.page])

	return (
		<div>
			<Popover open={open} onOpenChange={handleOpenModal}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						size='sm'
						className='h-7 w-full max-w-[100px] px-2 py-0 text-xs font-normal'
					>
						<div className='flex'>
							<span className='ml-1 text-[10px]'>Thêm GV</span>
							<ChevronsUpDown className='ml-1 h-3 w-3 shrink-0 text-[10px] opacity-50' />
						</div>
					</Button>
				</PopoverTrigger>

				<PopoverContent className='w-[280px] p-0' align='start'>
					<Command shouldFilter={false}>
						<CommandInput
							placeholder='Tìm kiếm...'
							onValueChange={debounceFieldOnChange}
							className='h-8 text-xs'
						/>
						<CommandList className='max-h-48 overflow-y-auto' style={{ overscrollBehavior: 'contain' }}>
							{isLoading ? (
								<div className='flex items-center justify-center gap-2 py-4 text-xs text-muted-foreground'>
									<Loader2 className='h-3 w-3 animate-spin' /> Đang tải...
								</div>
							) : (
								<>
									{lecturerPagingData?.data?.length === 0 && (
										<CommandEmpty className='py-4 text-xs'>Không tìm thấy giảng viên</CommandEmpty>
									)}

									<CommandGroup>
										{selectableOptions.map((lecturer) => {
											return (
												<CommandItem
													key={lecturer._id}
													value={lecturer._id}
													onSelect={() => handleSelect(lecturer)}
													className='cursor-pointer py-1.5 text-xs'
												>
													<Plus className='mr-1.5 h-3 w-3' />
													<span className='truncate'>
														{lecturer.title} {lecturer.fullName}
													</span>
												</CommandItem>
											)
										})}
									</CommandGroup>

									{lecturerPagingData &&
										lecturerPagingData.meta.currentPage < lecturerPagingData.meta.totalPages && (
											<>
												<CommandSeparator />
												<CommandGroup>
													<CommandItem
														onSelect={handleLoadMore}
														className='cursor-pointer justify-center py-1.5 text-center text-xs font-medium text-blue-600'
													>
														{isFetching ? (
															<Loader2 className='h-3 w-3 animate-spin' />
														) : (
															<Plus className='h-3 w-3' />
														)}
														<span className='ml-1'>Tải thêm</span>
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

export default LecturersCombobox
