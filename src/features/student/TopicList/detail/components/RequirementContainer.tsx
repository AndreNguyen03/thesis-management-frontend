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
import type { GetRequirementNameReponseDto } from '@/models'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { cn } from '@/lib/utils'
import { Check, ChevronsUpDown, Loader2, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useCreateRequirementMutation, useGetRequirementsQuery } from '@/services/requirementApi'
import { toSlug } from '@/utils/utils'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'

interface RequirementContainerProps {
	// Danh sách các field ĐANG ĐƯỢC CHỌN (từ parent truyền xuống)
	selectedRequirements: GetRequirementNameReponseDto[]
	isEditing?: boolean
	// Hàm callback để update ngược lại parent
	onSelectionChange?: (newFields: GetRequirementNameReponseDto[]) => void
}

const RequirementContainer = ({
	selectedRequirements,
	isEditing = true,
	onSelectionChange
}: RequirementContainerProps) => {
	const [open, setOpen] = useState(false)

	const [searchKeyword, setSearchKeyword] = useState('')
	const [openCreateDialog, setOpenCreateDialog] = useState(false)
	const [newRequirementName, setNewRequirementName] = useState('')
	const [newRequirementDescription, setNewRequirementDescription] = useState('')

	const handleOpenModal = (boolean: boolean) => {
		setOpen(boolean)
		debounceRequirementOnChange('')
	}
	//sử dụng để cộng dồn các lựa chọn khi bấm loadmore
	const [selectableOptions, setSelectableOptions] = useState<GetRequirementNameReponseDto[]>([])
	// State cho query tìm kiếm server-side
	const [queriesRequirement, setQueriesRequirement] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 6,
		search_by: ['name'],
		query: '',
		sort_by: 'name',
		sort_order: 'asc'
	})

	// Debounce search
	const setQueriesRequirementSearch = (query: string) => {
		setSearchKeyword(query)
		setQueriesRequirement((prev) => ({ ...prev, query, page: 1 })) // Reset về trang 1 khi search
	}
	const debounceRequirementOnChange = useDebounce({ onChange: setQueriesRequirementSearch, duration: 300 })

	// Fetch data
	const {
		data: requirementPagingData,
		isLoading,
		isFetching
	} = useGetRequirementsQuery(queriesRequirement, { skip: !isEditing || !open })

	const [createRequirement, { isLoading: isCreating }] = useCreateRequirementMutation()

	const handleSubmitCreateSkill = async () => {
		if (!newRequirementName.trim() || !newRequirementDescription.trim()) return

		try {
			const newRequirement = await createRequirement({
				name: newRequirementName.trim(),
				slug: toSlug(newRequirementName),
				description: newRequirementDescription.trim()
			}).unwrap()

			onSelectionChange?.([...selectedRequirements, newRequirement])

			// reset
			setNewRequirementName('')
			setNewRequirementDescription('')
			setOpenCreateDialog(false)
			setOpen(false)
		} catch (err) {
			console.error(err)
		}
	}

	// Logic chọn/bỏ chọn
	const handleSelect = (field: GetRequirementNameReponseDto) => {
		const isSelected = selectedRequirements.some((f) => f._id === field._id)
		let newSelected: GetRequirementNameReponseDto[]

		if (isSelected) {
			// Nếu đã chọn -> Bỏ chọn
			newSelected = selectedRequirements.filter((f) => f._id !== field._id)
		} else {
			// Nếu chưa chọn -> Thêm vào
			// Giới hạn chọn tối đa 15 lĩnh vực
			if (selectedRequirements.length >= 15) {
				return
			}
			newSelected = [...selectedRequirements, field]
		}

		// Gọi callback để parent update state
		onSelectionChange?.(newSelected)
	}

	const handleRemove = (id: string) => {
		const newSelected = selectedRequirements.filter((f) => f._id !== id)
		onSelectionChange?.(newSelected)
	}

	const handleLoadMore = () => {
		if (requirementPagingData && requirementPagingData.meta.currentPage < requirementPagingData.meta.totalPages) {
			setQueriesRequirement((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))
		}
	}
	useEffect(() => {
		if (requirementPagingData?.data) {
			if (queriesRequirement.page === 1) {
				// Trường hợp 1: Nếu là trang 1 (hoặc user mới search lại) -> Gán mới hoàn toàn
				setSelectableOptions(requirementPagingData.data)
			} else {
				// Trường hợp 2: Nếu là trang 2 trở đi (Load more) -> Cộng dồn vào mảng cũ
				setSelectableOptions((prev) => {
					// Mẹo: Lọc trùng lặp (nếu API trả về trùng) dựa trên _id
					const newItems = requirementPagingData.data.filter(
						(newItem) => !prev.some((prevItem) => prevItem._id === newItem._id)
					)
					return [...prev, ...newItems]
				})
			}
		}
	}, [requirementPagingData, queriesRequirement.page])
	// CHẾ ĐỘ XEM (VIEW MODE)
	if (!isEditing) {
		return (
			<div className='rounded-md'>
				<h4 className='mb-2 text-lg font-semibold text-gray-800'> Yêu cầu kỹ năng</h4>
				{selectedRequirements.length > 0 ? (
					<div className='flex flex-wrap gap-2'>
						{selectedRequirements.map((field) => (
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
					Yêu cầu kỹ năng <span className='text-red-500'>*</span>
				</h4>
				<h4 className='mb-2 text-sm font-semibold text-gray-500'>Chọn tối đa 15 yêu cầu </h4>
				<h4 className='mb-2 text-lg font-semibold text-blue-600'>{`(${selectedRequirements.length})`}</h4>
			</div>
			{/* 1. Hiển thị các tags đã chọn (có nút xóa) */}
			<div className='mb-2 flex flex-wrap gap-2'>
				{selectedRequirements.map((req) => (
					<Badge key={req._id} variant='secondary' className='flex items-center gap-1 px-3 py-1 pr-1 text-sm'>
						{req.name}
						<button
							onClick={() => handleRemove(req._id)}
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
						<span>Thêm yêu cầu...</span>
						<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-[400px] p-0'>
					<Command shouldFilter={false}>
						<CommandInput placeholder='Tìm kiếm yêu cầu...' onValueChange={debounceRequirementOnChange} />
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
									{requirementPagingData?.data?.length === 0 && searchKeyword && (
										<>
											<CommandEmpty>Không tìm thấy kỹ năng yêu cầu.</CommandEmpty>
											<CommandSeparator />
											<CommandGroup>
												<CommandItem
													onSelect={() => {
														setNewRequirementName(searchKeyword)
														setOpenCreateDialog(true)
													}}
													className='cursor-pointer font-medium text-green-600'
												>
													<Plus className='mr-2 h-4 w-4' />
													Tạo yêu cầu mới
												</CommandItem>
											</CommandGroup>
										</>
									)}

									<CommandGroup heading='Danh sách các yêu cầu'>
										{selectableOptions.map((req) => {
											const isSelected = selectedRequirements.some((f) => f._id === req._id)
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
													{req.name}
												</CommandItem>
											)
										})}
									</CommandGroup>

									{requirementPagingData &&
										requirementPagingData.meta.currentPage <
											requirementPagingData.meta.totalPages && (
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
						<DialogTitle>Tạo kỹ năng mới</DialogTitle>
					</DialogHeader>

					<div className='space-y-4'>
						<div>
							<label className='text-sm font-medium'>Tên yêu cầu kỹ năng *</label>
							<Input
								value={newRequirementName}
								onChange={(e) => setNewRequirementName(e.target.value)}
								placeholder='VD: React, Machine Learning...'
							/>
						</div>

						<div>
							<label className='text-sm font-medium'>Mô tả *</label>
							<Textarea
								value={newRequirementDescription}
								onChange={(e) => setNewRequirementDescription(e.target.value)}
								placeholder='Mô tả ngắn về kỹ năng'
							/>
						</div>

						<div className='flex justify-end gap-2'>
							<Button variant='outline' onClick={() => setOpenCreateDialog(false)}>
								Hủy
							</Button>
							<Button onClick={handleSubmitCreateSkill} disabled={isCreating}>
								{isCreating && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
								Tạo yêu cầu
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	)
}

export default RequirementContainer
