import { useState, useEffect } from 'react'
import { Search, X, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/Button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import type { FilterState } from '../types'
import { mockAdvisors, mockFields } from '../mock'

interface FilterBarProps {
	filters: FilterState
	onFiltersChange: (filters: FilterState) => void
}

export function FilterBar({ filters, onFiltersChange }: FilterBarProps) {
	const [searchValue, setSearchValue] = useState(filters.search)
	const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

	// Debounce search
	useEffect(() => {
		const timer = setTimeout(() => {
			onFiltersChange({ ...filters, search: searchValue })
		}, 400)
		return () => clearTimeout(timer)
	}, [searchValue])

	// Chỉ tính filter active dựa trên advisor, field, status
	const activeFilterCount = [filters.advisor, filters.field, filters.status !== 'all' ? filters.status : ''].filter(
		Boolean
	).length

	const clearFilters = () => {
		setSearchValue('')
		onFiltersChange({
			search: '',
			advisor: '',
			field: '',
			status: 'all'
		})
	}

	const FilterControls = () => (
		<div className='flex flex-wrap gap-2'>
			{/* Filter theo giảng viên */}
			<Select
				value={filters.advisor}
				onValueChange={(value) => onFiltersChange({ ...filters, advisor: value === 'all' ? '' : value })}
			>
				<SelectTrigger className='w-full min-w-[120px] border-border bg-card md:w-[160px]'>
					<SelectValue placeholder='Giảng viên' />
				</SelectTrigger>
				<SelectContent className='border-border bg-popover'>
					<SelectItem value='all'>Tất cả giảng viên</SelectItem>
					{mockAdvisors.map((advisor) => (
						<SelectItem key={advisor.id} value={advisor.id}>
							{advisor.name}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Filter theo lĩnh vực */}
			<Select
				value={filters.field}
				onValueChange={(value) => onFiltersChange({ ...filters, field: value === 'all' ? '' : value })}
			>
				<SelectTrigger className='w-full min-w-[120px] border-border bg-card md:w-[140px]'>
					<SelectValue placeholder='Lĩnh vực' />
				</SelectTrigger>
				<SelectContent className='border-border bg-popover'>
					<SelectItem value='all'>Tất cả lĩnh vực</SelectItem>
					{mockFields.map((field) => (
						<SelectItem key={field} value={field}>
							{field}
						</SelectItem>
					))}
				</SelectContent>
			</Select>

			{/* Filter theo trạng thái */}
			<Select
				value={filters.status}
				onValueChange={(value) => onFiltersChange({ ...filters, status: value as FilterState['status'] })}
			>
				<SelectTrigger className='w-full min-w-[100px] border-border bg-card md:w-[120px]'>
					<SelectValue placeholder='Trạng thái' />
				</SelectTrigger>
				<SelectContent className='border-border bg-popover'>
					<SelectItem value='all'>Tất cả</SelectItem>
					<SelectItem value='available'>Còn slot</SelectItem>
					<SelectItem value='full'>Hết slot</SelectItem>
				</SelectContent>
			</Select>
		</div>
	)

	return (
		<div className='glass-effect sticky top-0 z-40 border-b border-border bg-card px-8'>
			<div className='flex flex-col gap-2 md:flex-row md:items-center md:justify-between'>
				{/* Search & Mobile filter */}
				<div className='flex flex-1 flex-wrap gap-2'>
					<div className='relative max-w-md flex-1'>
						<Search className='absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
						<Input
							value={searchValue}
							onChange={(e) => setSearchValue(e.target.value)}
							placeholder='Tìm kiếm...'
							className='border-border bg-card pl-8 pr-8'
						/>
						{searchValue && (
							<button
								onClick={() => setSearchValue('')}
								className='absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground'
							>
								<X className='h-4 w-4' />
							</button>
						)}
					</div>

					<Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
						<SheetTrigger asChild className='md:hidden'>
							<Button variant='outline' className='gap-1 bg-card'>
								<Filter className='h-4 w-4' />
								{activeFilterCount > 0 && (
									<Badge variant='secondary' className='h-4 px-1 text-xs'>
										{activeFilterCount}
									</Badge>
								)}
							</Button>
						</SheetTrigger>
						<SheetContent side='bottom' className='h-auto bg-card'>
							<SheetHeader>
								<SheetTitle>Bộ lọc</SheetTitle>
							</SheetHeader>
							<div className='mt-2 flex flex-col gap-2 pb-3'>
								<FilterControls />
								{activeFilterCount > 0 && (
									<Button
										variant='ghost'
										onClick={() => {
											clearFilters()
											setMobileFiltersOpen(false)
										}}
										className='text-destructive'
									>
										Xóa bộ lọc
									</Button>
								)}
							</div>
						</SheetContent>
					</Sheet>
				</div>

				{/* Desktop filters */}
				<div className='hidden flex-wrap items-center gap-2 md:flex'>
					<FilterControls />
					{activeFilterCount > 0 && (
						<Button
							variant='ghost'
							size='sm'
							onClick={clearFilters}
							className='text-muted-foreground hover:text-destructive'
						>
							<X className='mr-1 h-4 w-4' />
							Xóa
						</Button>
					)}
				</div>
			</div>
		</div>
	)
}
