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
	selectedFields: string[]
	onSelectionChange?: (val: string[]) => void
}

const FieldsCombobox = ({ selectedFields, onSelectionChange }: FieldsContainerProps) => {
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
		sort_order: 'desc',
		filter: selectedFields,
		filter_by: '_id'
	})

	// Debounce search
	const setQueriesFieldSearch = (query: string) => {
		setQueriesField((prev) => ({ ...prev, query, page: 1 })) // Reset về trang 1 khi search
	}
	const debounceFieldOnChange = useDebounce({ onChange: setQueriesFieldSearch, duration: 300 })

	// Fetch data
	const { data: fieldPagingData, isLoading, isFetching } = useGetFieldsQuery(queriesField, { skip: !open })

	// Logic chọn/bỏ chọn
	const handleSelect = (fieldId: string) => {
		const isSelected = selectedFields?.some((f) => f === fieldId)
		let newSelected: string[]

		if (isSelected) {
			// Nếu đã chọn -> Bỏ chọn
			newSelected = selectedFields.filter((f) => f !== fieldId)
		} else {
			newSelected = [...selectedFields, fieldId]
		}

		// Gọi callback để parent update state
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

	return (
		<div>
			<Popover open={open} onOpenChange={handleOpenModal}>
				<PopoverTrigger asChild>
					<Button
						variant='outline'
						role='combobox'
						aria-expanded={open}
						className='w-full justify-between text-left font-normal'
					>
						<span>Thêm lĩnh vực...</span>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>

				<PopoverContent className='w-[400px] p-0'>
					<Command shouldFilter={false}>
						<CommandInput placeholder='Tìm kiếm lĩnh vực...' onValueChange={debounceFieldOnChange} />
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
											const isSelected = selectedFields.some((f) => f === field._id)
											return (
												<CommandItem
													key={field._id}
													value={field._id} // Lưu ý: value phải unique
													onSelect={() => handleSelect(field._id)}
													className='cursor-pointer'
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

export default FieldsCombobox
