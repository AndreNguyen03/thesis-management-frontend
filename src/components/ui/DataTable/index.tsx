/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type ReactNode, useEffect, useRef } from 'react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'
import { Link } from 'react-router-dom'
import { FilterX, ArrowUpDown, ChevronUp, ChevronDown } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button, Input } from '@/components/ui'
import { EmptyState } from '../EmptyState'
import { LoadingState } from '../LoadingState'
import type { DataTableProps, QueryParams, SearchValue, SortOrder, TableAction } from './types'

export function DataTable<T extends Record<string, any>>({
	data,
	columns,
	actions,
	isLoading,
	error,
	totalRecords = 0,
	pageSize = 10,
	searchFields,
	onQueryChange,
	emptyState = {
		title: 'Không có dữ liệu',
		description: 'Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
	},
	toolbar
}: DataTableProps<T>): ReactNode {
	const [page, setPage] = useState(1)
	const [searchField, setSearchField] = useState<string>((columns.find((col) => col.searchable)?.key as string) || '')
	const [searchValue, setSearchValue] = useState<SearchValue>({ value: '' })
	const [sortField, setSortField] = useState<string>((columns.find((col) => col.sortable)?.key as string) || '')
	const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
	const [isDropdownOpen, setIsDropdownOpen] = useState(false)

	const totalPages = Math.ceil(totalRecords / pageSize)
	const tableRef = useRef<HTMLDivElement>(null)
	const firstFocusableRef = useRef<HTMLElement>(null)
	const searchFieldRef = useRef<HTMLButtonElement>(null)
	const searchInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (tableRef.current) {
			const firstFocusable = tableRef.current.querySelector('input, button, [tabindex="0"]') as HTMLElement
			firstFocusableRef.current = firstFocusable
		}
	}, [data])

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setPage(newPage)
			updateQuery({ page: newPage })
		}
	}

	const handleSort = (field: string) => {
		const newSortOrder = sortField === field && sortOrder === 'asc' ? 'desc' : 'asc'
		setSortField(field)
		setSortOrder(newSortOrder)
		setPage(1)
		updateQuery({ sort_by: field, sort_order: newSortOrder, page: 1 })
	}

	const handleSearch = (newValue: SearchValue) => {
		setSearchValue(newValue)
		setPage(1)
		updateQuery({ query: newValue.value.trim(), page: 1 })
	}

	const resetFilters = () => {
		setSearchValue({ value: '' })
		setPage(1)
		updateQuery({ query: '', page: 1 })
	}

	const updateQuery = (updates: Partial<QueryParams>) => {
		onQueryChange({
			page,
			limit: pageSize,
			search_by: searchField,
			query: searchValue.value,
			sort_by: sortField,
			sort_order: sortOrder,
			...updates
		})
	}

	const getSortIcon = (field: string) => {
		if (sortField !== field) return <ArrowUpDown className='ml-2 h-4 w-4' />
		return sortOrder === 'asc' ? <ChevronUp className='ml-2 h-4 w-4' /> : <ChevronDown className='ml-2 h-4 w-4' />
	}

	const renderSearchInput = () => {
		const currentColumn = columns.find((col) => col.key === searchField)
		if (currentColumn?.renderSearchInput) {
			return currentColumn.renderSearchInput({
				value: searchValue,
				onChange: handleSearch,
				placeholder: 'Tìm kiếm...'
			})
		}

		return (
			<Input
				ref={searchInputRef}
				placeholder={'Tìm kiếm...'}
				value={searchValue.value}
				onChange={(e) => handleSearch({ value: e.target.value })}
				className='w-full'
				aria-label={`Tìm kiếm trong ${searchFields?.[searchField] || 'bảng'}`}
			/>
		)
	}

	const renderActionButton = (action: TableAction<T>, row: T) => {
		const buttonProps = {
			variant: action.variant || 'outline',
			size: 'sm' as const,
			onClick: action.onClick ? () => action.onClick?.(row) : undefined,
			disabled: action.disabled?.(row),
			'aria-label': action.label,
			className: 'flex items-center gap-2'
		}

		if (action.href && action.asChild) {
			return (
				<Button key={action.label} {...buttonProps} asChild>
					<Link to={action.href(row)}>
						<span aria-hidden='true'>{action.icon}</span>
					</Link>
				</Button>
			)
		}

		return (
			<Button key={action.label} {...buttonProps}>
				<span aria-hidden='true'>{action.icon}</span>
			</Button>
		)
	}

	return (
		<div className='space-y-4'>
			{/* Bộ lọc và thanh công cụ */}
			<section className='rounded-md bg-muted/30 py-2.5' aria-label='Bộ lọc và tìm kiếm bảng'>
				<div className='flex flex-col gap-4 lg:flex-row lg:items-end'>
					<div className='flex flex-1 flex-col gap-4 lg:flex-row'>
						{searchFields && (
							<div className='w-full lg:w-2/12'>
								<Select
									onValueChange={(value) => {
										setSearchField(value)
										setSearchValue({ value: '' })
										updateQuery({
											search_by: value,
											query: '',
											page: 1
										})
										setIsDropdownOpen(false)
										setTimeout(() => {
											searchInputRef.current?.focus()
										}, 100)
									}}
									value={searchField}
									onOpenChange={setIsDropdownOpen}
								>
									<SelectTrigger ref={searchFieldRef} aria-label='Chọn trường tìm kiếm'>
										<SelectValue placeholder={'Trường tìm kiếm'} />
									</SelectTrigger>
									<SelectContent role='listbox'>
										{Object.entries(searchFields).map(([key, label]) => (
											<SelectItem key={key} value={key} role='option'>
												{label}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<div className='flex w-full gap-2 lg:w-6/12'>
							{renderSearchInput()}
							{searchValue.value && (
								<Button
									variant='outline'
									size='default'
									onClick={resetFilters}
									className='flex items-center gap-2'
									aria-label={'Xóa bộ lọc'}
								>
									<FilterX className='h-4 w-4' aria-hidden='true' />
									<span className='hidden sm:inline'>{'Xóa'}</span>
								</Button>
							)}
						</div>
					</div>

					{toolbar && (
						<div className='flex justify-end lg:ml-auto' role='toolbar' aria-label='Hành động bảng'>
							{toolbar}
						</div>
					)}
				</div>
			</section>

			{/* Bảng dữ liệu */}
			<div
				ref={tableRef}
				className='max-h-[calc(100vh-300px)] overflow-auto rounded-md border bg-white'
				role='region'
				aria-label='Bảng dữ liệu'
			>
				<Table role='table'>
					<TableHeader className='sticky top-0 z-10 bg-muted/50 shadow-sm'>
						<TableRow role='row'>
							{columns.map((column) => (
								<TableHead
									key={column.key as string}
									className={column.sortable ? 'cursor-pointer' : ''}
									onClick={() => column.sortable && handleSort(column.key as string)}
									role='columnheader'
									aria-sort={
										sortField === column.key
											? sortOrder === 'asc'
												? 'ascending'
												: 'descending'
											: column.sortable
												? 'none'
												: undefined
									}
								>
									<div className='flex items-center'>
										{column.title}
										{column.sortable && (
											<span aria-hidden='true'>{getSortIcon(column.key as string)}</span>
										)}
									</div>
								</TableHead>
							))}
							{actions && <TableHead className='text-right'>Hành động</TableHead>}
						</TableRow>
					</TableHeader>

					<TableBody>
						{isLoading ? (
							<TableRow>
								<TableCell colSpan={columns.length + (actions ? 1 : 0)}>
									<LoadingState message={'Đang tải dữ liệu...'} />
								</TableCell>
							</TableRow>
						) : error ? (
							<TableRow>
								<TableCell colSpan={columns.length + (actions ? 1 : 0)}>
									<div className='text-red-500'>Lỗi: {JSON.stringify(error)}</div>
								</TableCell>
							</TableRow>
						) : !data.length ? (
							<TableRow>
								<TableCell colSpan={columns.length + (actions ? 1 : 0)} className='py-8 text-center'>
									<EmptyState title={emptyState.title} description={emptyState.description} />
								</TableCell>
							</TableRow>
						) : (
							data.map((row, index) => (
								<TableRow key={index}>
									{columns.map((column) => (
										<TableCell key={column.key as string}>
											{column.render ? column.render(row[column.key], row) : row[column.key]}
										</TableCell>
									))}

									{actions && (
										<TableCell className='text-right'>
											<div className='flex justify-end gap-2'>
												{actions.map((action) => renderActionButton(action, row))}
											</div>
										</TableCell>
									)}
								</TableRow>
							))
						)}
					</TableBody>
				</Table>
			</div>

			{/* Phân trang */}
			{totalPages > 1 && (
				<nav aria-label='Phân trang'>
					<Pagination>
						<PaginationContent>
							<PaginationItem>
								<PaginationPrevious
									onClick={() => handlePageChange(page - 1)}
									className={page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
									aria-label='Trang trước'
								/>
							</PaginationItem>

							{Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
								const pageNum = Math.max(1, Math.min(totalPages - 4, page - 2)) + i
								if (pageNum > totalPages) return null

								return (
									<PaginationItem key={pageNum}>
										<PaginationLink
											onClick={() => handlePageChange(pageNum)}
											isActive={page === pageNum}
											className='cursor-pointer'
											aria-label={`Tới trang ${pageNum}`}
											aria-current={page === pageNum ? 'page' : undefined}
										>
											{pageNum}
										</PaginationLink>
									</PaginationItem>
								)
							})}

							<PaginationItem>
								<PaginationNext
									onClick={() => handlePageChange(page + 1)}
									className={page >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
									aria-label='Trang kế tiếp'
								/>
							</PaginationItem>
						</PaginationContent>
					</Pagination>
				</nav>
			)}
		</div>
	)
}
