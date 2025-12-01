'use client'

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui'
import { Loader2 } from 'lucide-react'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	onSubmitSelected?: (selected: TData[]) => void
	showSelection?: boolean
	isSubmitting?: boolean
	isSuccess?: boolean
}

export function DataTable<TData, TValue>({
	columns,
	data,
	onSubmitSelected,
	showSelection,
	isSubmitting,
	isSuccess
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
		columnResizeMode: 'onChange',
		defaultColumn: {
			minSize: 50,
			maxSize: 500
		}
	})
	const selectedRows = table.getSelectedRowModel().rows
	// Lấy mảng các đề tài đã chọn:
	const selectedTopics = selectedRows.map((row) => row.original)
	if (isSuccess) {
		table.resetRowSelection()
	}
	return (
		<div className='h-full overflow-hidden rounded-md border'>
			{showSelection && onSubmitSelected && (
				<div className='flex items-center gap-2'>
					<Button
						variant={'send'}
						disabled={table.getSelectedRowModel().rows.length === 0 || isSubmitting}
						onClick={() => onSubmitSelected?.(selectedTopics)}
					>
						{isSubmitting && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
						Nộp các đề tài đã chọn
					</Button>
					<span>
						Đã chọn <span className='font-bold'>{table.getSelectedRowModel().rows.length}</span> đề tài
					</span>
				</div>
			)}
			<div className='max-h-[400px] overflow-auto'>
				<Table>
					<TableHeader>
						{table.getHeaderGroups().map((headerGroup) => (
							<TableRow key={headerGroup.id} className='text-center'>
								{headerGroup.headers.map((header) => {
									return (
										<TableHead
											key={header.id}
											className='text-center'
											style={{ width: header.getSize() }}
										>
											{header.isPlaceholder
												? null
												: flexRender(header.column.columnDef.header, header.getContext())}
										</TableHead>
									)
								})}
							</TableRow>
						))}
					</TableHeader>
					<TableBody>
						{table.getRowModel().rows?.length ? (
							table.getRowModel().rows.map((row) => (
								<TableRow
									key={row.id}
									data-state={row.getIsSelected() && 'selected'}
									className='justify-center'
								>
									{row.getVisibleCells().map((cell) => (
										<TableCell
											key={cell.id}
											className='text-center'
											style={{ width: cell.column.getSize() }}
										>
											{flexRender(cell.column.columnDef.cell, cell.getContext())}
										</TableCell>
									))}
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={columns.length} className='h-24 text-center'>
									No results.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	)
}
