import { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch' // Import Switch của bạn
import { type GetFieldNameReponseDto, type PaginationTopicsQueryParams, type ResponseMiniLecturerDto } from '@/models'
import LecturersContainer from '../combobox/LecturersContainer'
import FieldsContainer from '../combobox/FieldsContainer'
import { TopicStatus } from '@/models/topic.model'

interface FilterBarProps {
	selectedFields: GetFieldNameReponseDto[]
	selectedLecturers: ResponseMiniLecturerDto[]
	onSelectionChangeFields: (val: GetFieldNameReponseDto[]) => void
	onSelectionChangeLecturers: (val: ResponseMiniLecturerDto[]) => void
	queryParams: PaginationTopicsQueryParams
	onSetQueryParams: (val: PaginationTopicsQueryParams) => void
}

export function FilterBar({
	selectedFields,
	selectedLecturers,
	queryParams,
	onSetQueryParams,
	onSelectionChangeFields,
	onSelectionChangeLecturers
}: FilterBarProps) {
	const [searchValue, setSearchValue] = useState(queryParams.query || '')
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
	const [isSemanticMode, setIsSemanticMode] = useState(queryParams.rulesPagination === 100) // Default based on current params

	// Sync local state with props if changed externally
	useEffect(() => {
		setIsSemanticMode(queryParams.rulesPagination === 100)
	}, [queryParams.rulesPagination])

	// Debounce search - Set rulesPagination based on switch
	useEffect(() => {
		const timer = setTimeout(() => {
			// Chỉ gọi API khi có searchValue
			if (searchValue.trim() !== '') {
				const rulesPagination = isSemanticMode ? 100 : 99
				if (rulesPagination === 100) {
					onSetQueryParams({
						page: 1,
						limit: 10,
						search_by: [],
						query: searchValue,
						sort_by: 'createdAt',
						sort_order: 'desc',
						status: 'all',
						rulesPagination: rulesPagination,
						lecturerIds: [],
						fieldIds: [],
						queryStatus: []
					})
				} else {
					onSetQueryParams({
						page: 1,
						limit: 10,
						search_by: ['titleVN', 'titleEng'],
						query: searchValue,
						sort_by: 'createdAt',
						sort_order: 'desc',
						status: 'all',
						rulesPagination: rulesPagination,
						lecturerIds: [],
						fieldIds: [],
						queryStatus: []
					})
				}
			}
		}, 400)
		return () => clearTimeout(timer)
	}, [searchValue, isSemanticMode])

	// Tính số lượng filter active (chỉ lecturerIds, fieldIds, và status !== 'all')
	const activeFilterCount = [
		queryParams.lecturerIds?.length ?? 0,
		queryParams.fieldIds?.length ?? 0,
		queryParams.status !== 'all'
	].filter(Boolean).length

	const clearFilters = () => {
		setSearchValue('')
		setIsSemanticMode(false) // Default to exact match
		onSelectionChangeFields([])
		onSelectionChangeLecturers([])
		onSetQueryParams({
			...queryParams,
			query: '',
			lecturerIds: [],
			fieldIds: [],
			status: 'all',
			queryStatus: [],
			page: 1,
			rulesPagination: 99
		})
		setMobileFiltersOpen(false)
	}

	const handleStatusChange = (value: string) => {
		let newStatus = value
		let newQueryStatus: string[] = []
		if (value === 'all') {
			newStatus = 'all'
			newQueryStatus = []
		} else if (value.includes(',')) {
			newStatus = value
			newQueryStatus = value.split(',')
		} else {
			newQueryStatus = [value]
		}
		onSetQueryParams({ ...queryParams, status: newStatus, queryStatus: newQueryStatus, page: 1 })
	}

	const handleModeToggle = (checked: boolean) => {
		setIsSemanticMode(checked)
		// Không gọi onSetQueryParams ở đây, chỉ đổi local state
	}

	const FilterControls = () => (
		<div className='flex flex-wrap items-center gap-3'>
			{/* Switch for Search Mode */}
			<div className='flex min-w-[160px] items-center gap-1.5'>
				<span className='whitespace-nowrap text-xs font-medium text-muted-foreground'>Tìm ngữ cảnh:</span>
				<Switch
					checked={isSemanticMode}
					onCheckedChange={handleModeToggle}
					aria-label='Toggle semantic search mode'
					className='ml-1' // Small margin for spacing
				/>
			</div>
			{/* Filter theo giảng viên */}
			<div className='flex min-w-[180px] items-center gap-1.5'>
				<span className='whitespace-nowrap text-xs font-medium text-muted-foreground'>Giảng viên:</span>
				<LecturersContainer
					selectedLecturers={selectedLecturers}
					onSelectionChange={onSelectionChangeLecturers}
					className='flex-1'
				/>
			</div>

			{/* Filter theo lĩnh vực */}
			<div className='flex min-w-[160px] items-center gap-1.5'>
				<span className='whitespace-nowrap text-xs font-medium text-muted-foreground'>Lĩnh vực:</span>
				<FieldsContainer
					selectedFields={selectedFields}
					onSelectionChange={onSelectionChangeFields}
					className='flex-1'
				/>
			</div>

			{/* Filter theo trạng thái */}
			<div className='flex min-w-[120px] items-center gap-1.5'>
				<span className='whitespace-nowrap text-xs font-medium text-muted-foreground'>Trạng thái:</span>
				<Select value={queryParams.status} onValueChange={handleStatusChange}>
					<SelectTrigger className='h-8 w-[100px] border-border bg-card text-xs'>
						<SelectValue placeholder='Tất cả' />
					</SelectTrigger>
					<SelectContent className='border-border bg-popover'>
						<SelectItem value='all'>Tất cả</SelectItem>
						<SelectItem value={`${TopicStatus.PENDING_REGISTRATION},${TopicStatus.REGISTERED}`}>
							Còn slot
						</SelectItem>
						<SelectItem value={TopicStatus.FULL}>Hết slot</SelectItem>
					</SelectContent>
				</Select>
			</div>
		</div>
	)

	return (
		<div className='glass-effect sticky top-0 z-40 border-b border-border bg-card px-4 py-3 sm:px-6 lg:px-8'>
			<div className='flex flex-col gap-3 md:flex-row md:items-center md:justify-between md:gap-0'>
				{/* Search & Mobile filter */}
				<div className='flex flex-1 items-center gap-2'>
					<div className='relative max-w-md flex-1'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							placeholder='Tìm kiếm đề tài...'
							className='h-9 border-border bg-card pl-10 pr-10 text-sm'
						/>
						{searchValue && (
							<button
								type='button'
								onClick={() => setSearchValue('')}
								className='absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground'
							>
								<X className='h-4 w-4' />
							</button>
						)}
					</div>

					<Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
						<SheetTrigger asChild className='md:hidden'>
							<Button variant='outline' size='sm' className='h-9 gap-1 border-border bg-card px-3'>
								<Filter className='h-4 w-4' />
								{activeFilterCount > 0 && (
									<Badge variant='secondary' className='h-4 w-5 px-1 text-xs'>
										{activeFilterCount}
									</Badge>
								)}
								<span className='sr-only'>Bộ lọc</span>
							</Button>
						</SheetTrigger>
						<SheetContent side='bottom' className='max-h-[70vh] border-t-border bg-card'>
							<SheetHeader className='border-b-border pb-4'>
								<SheetTitle className='text-base'>Bộ lọc nâng cao</SheetTitle>
							</SheetHeader>
							<div className='mt-4 flex flex-col gap-4 overflow-y-auto pb-4'>
								<FilterControls />
								{activeFilterCount > 0 && (
									<Button
										variant='outline'
										size='sm'
										onClick={clearFilters}
										className='border-destructive text-destructive hover:bg-destructive/5'
									>
										<X className='mr-1 h-3 w-3' />
										Xóa tất cả bộ lọc
									</Button>
								)}
							</div>
						</SheetContent>
					</Sheet>
				</div>

				{/* Desktop filters */}
				<div className='hidden items-center gap-2 md:flex lg:gap-3'>
					<FilterControls />
					{activeFilterCount > 0 && (
						<Button
							variant='ghost'
							size='sm'
							onClick={clearFilters}
							className='h-8 gap-1 px-2 text-muted-foreground hover:text-destructive'
						>
							<X className='h-3.5 w-3.5' />
							<span className='text-xs'>Xóa</span>
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
