import { Badge, Button, Input } from '@/components/ui'
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
import { useCreateFieldMutation, useGetFieldsQuery } from '@/services/fieldApi'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Textarea } from '@/components/ui/textarea'
import { toSlug } from '@/utils/utils'

interface FieldsContainerProps {
	// Danh sách các field ĐANG ĐƯỢC CHỌN (từ parent truyền xuống)
	selectedFields: GetFieldNameReponseDto[]
	isEditing?: boolean
	// Hàm callback để update ngược lại parent
	onSelectionChange?: (newFields: GetFieldNameReponseDto[]) => void
}

const FieldsContainer = ({ selectedFields, isEditing = true, onSelectionChange }: FieldsContainerProps) => {
	const [open, setOpen] = useState(false)

	const handleOpenModal = (boolean: boolean) => {
		setOpen(boolean)
		debounceFieldOnChange('')
	}

	const [openCreateDialog, setOpenCreateDialog] = useState(false)
	const [newFieldName, setNewFieldName] = useState('')
	const [newFieldDescription, setNewFieldDescription] = useState('')
	const [searchKeyword, setSearchKeyword] = useState('')
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
		setSearchKeyword(query)
		setQueriesField((prev) => ({ ...prev, query, page: 1 })) // Reset về trang 1 khi search
	}
	const debounceFieldOnChange = useDebounce({ onChange: setQueriesFieldSearch, duration: 300 })

	// Fetch data
	const {
		data: fieldPagingData,
		isLoading,
		isFetching
	} = useGetFieldsQuery(queriesField, { skip: !isEditing || !open })

	// create new skill
	const [createField, { isLoading: isCreating }] = useCreateFieldMutation()

	const handleSubmitCreateSkill = async () => {
		if (!newFieldName.trim() || !newFieldDescription.trim()) return

		try {
			const newField = await createField({
				name: newFieldName.trim(),
				slug: toSlug(newFieldName),
				description: newFieldDescription.trim()
			}).unwrap()

			onSelectionChange?.([...selectedFields, newField])

			// reset
			setNewFieldName('')
			setNewFieldDescription('')
			setOpenCreateDialog(false)
			setOpen(false)
		} catch (err) {
			console.error(err)
		}
	}

	// Logic chọn/bỏ chọn
	const handleSelect = (field: GetFieldNameReponseDto) => {
		const isSelected = selectedFields.some((f) => f._id === field._id)
		let newSelected: GetFieldNameReponseDto[]

		if (isSelected) {
			// Nếu đã chọn -> Bỏ chọn
			newSelected = selectedFields.filter((f) => f._id !== field._id)
		} else {
			// Nếu chưa chọn -> Thêm vào
			// Giới hạn chọn tối đa 3 lĩnh vực
			if (selectedFields.length >= 3) {
				return
			}
			newSelected = [...selectedFields, field]
		}

		// Gọi callback để parent update state
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
		<div>
			<div className='flex items-center gap-4'>
				<h4 className='mb-2 text-lg font-semibold text-gray-800'>
					Lĩnh vực <span className='text-red-500'>*</span>
				</h4>
				<h4 className='mb-2 text-sm font-semibold text-gray-500'>Chọn tối đa 3 lĩnh vực chính</h4>
				<h4 className='mb-2 text-lg font-semibold text-blue-600'>{`(${selectedFields.length})`}</h4>
			</div>
			{/* 1. Hiển thị các tags đã chọn (có nút xóa) */}
			<div className='mb-2 flex flex-wrap gap-2'>
				{selectedFields.map((field) => (
					<Badge
						key={field._id}
						variant='secondary'
						className='flex items-center gap-1 px-3 py-1 pr-1 text-sm'
					>
						{field.name}
						<button
							onClick={() => handleRemove(field._id)}
							className='ml-1 rounded-full p-0.5 transition-colors hover:bg-gray-300'
						>
							<X className='h-3 w-3' />
						</button>
					</Badge>
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
									{fieldPagingData?.data?.length === 0 && searchKeyword && (
										<>
											<CommandEmpty>Không tìm thấy lĩnh vực.</CommandEmpty>
											<CommandSeparator />
											<CommandGroup>
												<CommandItem
													onSelect={() => {
														setNewFieldName(searchKeyword)
														setOpenCreateDialog(true)
													}}
													className='cursor-pointer font-medium text-green-600'
												>
													<Plus className='mr-2 h-4 w-4' />
													Tạo lĩnh vực mới
												</CommandItem>
											</CommandGroup>
										</>
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
			<Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Tạo lĩnh vực mới</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						<div>
							<label className='text-sm font-medium'>Tên Lĩnh vực *</label>
							<Input
								value={newFieldName}
								onChange={(e) => setNewFieldName(e.target.value)}
								placeholder='VD: React, Machine Learning...'
							/>
						</div>

						<div>
							<label className='text-sm font-medium'>Mô tả *</label>
							<Textarea
								value={newFieldDescription}
								onChange={(e) => setNewFieldDescription(e.target.value)}
								placeholder='Mô tả ngắn về lĩnh vực'
							/>
						</div>

						<div className='flex justify-end gap-2'>
							<Button variant='outline' onClick={() => setOpenCreateDialog(false)}>
								Hủy
							</Button>
							<Button onClick={handleSubmitCreateSkill} disabled={isCreating}>
								{isCreating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
								Tạo lĩnh vực
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default FieldsContainer
