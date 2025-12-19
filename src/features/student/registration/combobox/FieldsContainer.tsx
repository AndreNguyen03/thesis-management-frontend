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
import type { GetFieldNameReponseDto } from '@/models'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useGetFieldsQuery } from '@/services/fieldApi'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface FieldsContainerProps {
	// Danh sách các field ĐANG ĐƯỢC CHỌN (từ parent truyền xuống)
	selectedFields: GetFieldNameReponseDto[]
	isEditing?: boolean
	// Hàm callback để update ngược lại parent
	onSelectionChange?: (newFields: GetFieldNameReponseDto[]) => void
	className?: string
}

const FieldsContainer = ({ selectedFields, isEditing = true, onSelectionChange, className }: FieldsContainerProps) => {
	const [open, setOpen] = useState(false)

	const handleOpenModal = (boolean: boolean) => {
		setOpen(boolean)
		debounceFieldOnChange('')
	}
	//sử dụng để cộng dồn các lựa chọn khi bấm loadmore
	const [selectableOptions, setSelectableOptions] = useState<GetFieldNameReponseDto[]>([])
	// State cho query tìm kiếm server-side
	const [queriesField, setQueriesField] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 8,
		search_by: ['name'],
		query: '',
		sort_by: 'name',
		sort_order: 'asc'
	})

	// Debounce search
	const setQueriesFieldSearch = (query: string) => {
		setQueriesField((prev) => ({ ...prev, query, page: 1 })) // Reset về trang 1 khi search
	}
	const debounceFieldOnChange = useDebounce({ onChange: setQueriesFieldSearch, duration: 300 })

	// Fetch data
	const {
		data: fieldPagingData,
		isLoading,
		isFetching
	} = useGetFieldsQuery(queriesField, { skip: !isEditing || !open })

	// Logic chọn/bỏ chọn
	const handleSelect = (field: GetFieldNameReponseDto) => {
		const isSelected = selectedFields.some((f) => f._id === field._id)
		let newSelected: GetFieldNameReponseDto[]

		if (isSelected) {
			newSelected = selectedFields.filter((f) => f._id !== field._id)
		} else {
			newSelected = [...selectedFields, field]
		}
		onSelectionChange?.(newSelected)
	}

	const handleRemove = (id: string) => {
		const newSelected = selectedFields.filter((f) => f._id !== id)
		onSelectionChange?.(newSelected)
	}

	const handleLoadMore = () => {
		if (fieldPagingData && fieldPagingData.meta.currentPage < fieldPagingData.meta.totalPages) {
			setQueriesField((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
		}
	}
	useEffect(() => {
		if (fieldPagingData?.data) {
			if (queriesField.page === 1) {
				// Trường hợp 1: Nếu là trang 1 (hoặc user mới search lại) -> Gán mới hoàn toàn
				setSelectableOptions(fieldPagingData.data)
			} else {
				// Trường hợp 2: Nếu là trang 2 trở đi (Load more) -> Cộng dồn vào mảng cũ
				setSelectableOptions((prev) => {
					// Mẹo: Lọc trùng lặp (nếu API trả về trùng) dựa trên _id
					const newItems = fieldPagingData.data.filter(
						(newItem) => !prev.some((prevItem) => prevItem._id === newItem._id)
					)
					return [...prev, ...newItems]
				})
			}
		}
	}, [fieldPagingData, queriesField.page])
	// CHẾ ĐỘ XEM (VIEW MODE)
	if (!isEditing) {
		return (
			<div className='rounded-md'>
				<h4 className='mb-2 text-lg font-semibold text-gray-800'>Lĩnh vực</h4>
				{selectedFields.length > 0 ? (
					<div className='flex flex-wrap gap-2'>
						{selectedFields.map((field) => (
							<Badge key={field._id} variant='blue' className='text-md px-3 py-1'>
								{field.name}
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
		<div className={cn('space-y-2', className)}>
			{/* 1. Hiển thị các tags đã chọn (có nút xóa) */}
			{selectedFields.length > 0 && (
				<div className='flex flex-wrap gap-1.5 max-w-[200px]'>
					{selectedFields.map((field) => (
						<Badge
							key={field._id}
							variant='secondary'
							className='flex items-center gap-1 px-2 py-0.5 text-xs'
						>
							{field.name}
							<button
								onClick={() => handleRemove(field._id)}
								className='ml-1 rounded-full p-0.5 transition-colors hover:bg-muted-foreground/50'
							>
								<X className='h-2.5 w-2.5' />
							</button>
						</Badge>
					))}
				</div>
			)}

			{/* 2. Combobox tìm kiếm & chọn */}
			<Popover open={open} onOpenChange={handleOpenModal}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className={cn(
							'w-[140px] justify-between text-left font-normal text-xs h-8',
							selectedFields.length > 0 && 'text-muted-foreground'
						)}
					>
						<span className='truncate'>
							{selectedFields.length > 0
								? `${selectedFields.length} lĩnh vực đã chọn`
								: 'Thêm lĩnh vực...'}
						</span>
						<ChevronsUpDown className='ml-1 h-3 w-3 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[350px] p-0'>
					<Command>
						<CommandInput placeholder='Tìm kiếm lĩnh vực...' onValueChange={debounceFieldOnChange} className='h-9' />
						<CommandList
							className='h-fit max-h-60 overflow-y-auto'
							style={{ overscrollBehavior: 'contain' }}
						>
							{isLoading ? (
								<div className='flex items-center justify-center gap-2 py-6 text-center text-sm text-muted-foreground'>
									<Loader2 className='h-4 w-4 animate-spin' /> Đang tải...
								</div>
							) : (
								<>
									{fieldPagingData?.data?.length === 0 && (
										<CommandEmpty>Không tìm thấy lĩnh vực.</CommandEmpty>
									)}

									<CommandGroup heading='Danh sách lĩnh vực'>
										{selectableOptions.map((field) => {
											const isSelected = selectedFields.some((f) => f._id === field._id)
											return (
												<CommandItem
													key={field._id}
													value={field._id} // Lưu ý: value phải unique
													onSelect={() => handleSelect(field)}
													className='cursor-pointer'
													onPointerDown={(e) => e.preventDefault()} // Thêm dòng này để ngăn Popover đóng
												>
													<Check
														className={cn(
															'mr-2 h-4 w-4',
															isSelected ? 'opacity-100' : 'opacity-0'
														)}
													/>
													{field.name}
												</CommandItem>
											)
										})}
									</CommandGroup>

									{fieldPagingData &&
										fieldPagingData.meta.currentPage < fieldPagingData.meta.totalPages && (
											<>
												<CommandSeparator />
												<CommandGroup>
													<CommandItem
														onSelect={handleLoadMore}
														className='cursor-pointer justify-center text-center font-medium text-blue-600'
													>
														{isFetching ? (
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

export default FieldsContainer