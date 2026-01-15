import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	SortingState,
	useReactTable
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	pageCount?: number
	pageIndex?: number
	pageSize?: number
	onPageChange?: (page: number) => void
}

export function DataTable<TData, TValue>({
	columns,
	data,
	pageCount = 1,
	pageIndex = 0,
	pageSize = 20,
	onPageChange
}: DataTableProps<TData, TValue>) {
	const [sorting, setSorting] = useState<SortingState>([])

	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		onSortingChange: setSorting,
		state: {
			sorting,
			pagination: {
				pageIndex,
				pageSize
			}
		},
		pageCount,
		manualPagination: true
	})

	return (
		<div className='space-y-4'>
			<div className='rounded-md border'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id}>
								{headerGroup.headers.map((header) => (
									<TableHead key={header.id}>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								))}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
									{row.getVisibleCells().map((cell) => (
										<TableCell key={cell.id}>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className='h-24 text-center'>
									Không có dữ liệu
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>

			{/* Pagination */}
			<div className='flex items-center justify-between px-2'>
				<div className='text-sm text-muted-foreground'>
					Trang {pageIndex + 1} / {pageCount}
				</div>
				<div className='flex items-center space-x-2'>
					<Button
						variant='outline'
						size='sm'
						onClick={() => onPageChange?.(pageIndex - 1)}
						disabled={pageIndex === 0}
					>
						<ChevronLeft className='h-4 w-4' />
						Trước
					</Button>
					<Button
						variant='outline'
						size='sm'
						onClick={() => onPageChange?.(pageIndex + 1)}
						disabled={pageIndex >= pageCount - 1}
					>
						Sau
						<ChevronRight className='h-4 w-4' />
					</Button>
				</div>
			</div>
		</div>
	)
}
