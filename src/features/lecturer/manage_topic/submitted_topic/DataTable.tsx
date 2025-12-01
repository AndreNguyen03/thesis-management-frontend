'use client'

import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from '@tanstack/react-table'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Loader2 } from 'lucide-react'
import { useEffect } from 'react'

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
	isLoading?: boolean
	onChangeSelectedTopicIds: (selectedTopicIds: TData[]) => void
}

export function DataTable<TData, TValue>({
	columns,
	data,
	isLoading,
	onChangeSelectedTopicIds
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
	useEffect(() => {
		onChangeSelectedTopicIds(table.getSelectedRowModel().rows.map((row) => row.original))
	}, [table.getSelectedRowModel().rows.length])
	return (
		<div className='h-full overflow-hidden rounded-md border'>
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id} className='text-center'>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id} className='text-center' style={{ width: header.getSize() }}>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
			</Table>
			<div className='max-h-[500px] overflow-auto'>
				{isLoading ? (
					<div className='flex w-full justify-center p-4'>
						<Loader2 className='w- h-8 animate-spin' />
					</div>
				) : (
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
				)}
			</div>
		</div>
	)
}
