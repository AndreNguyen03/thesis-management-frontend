import { Badge, Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/checkbox'
import { KnowledgeStatus, SourceType, type KnowledgeSource } from '@/models/knowledge-source.model'
import type { ColumnDef } from '@tanstack/react-table'
import { Copy, Download } from 'lucide-react'

export interface NewKnowledgeSource extends KnowledgeSource {
	index: number
	ownerName: string
}

type ColumnsProps = {
	editingIndex: number | null
	editingValue: string
	setEditingIndex: (index: number | null) => void
	setEditingValue: (value: string) => void
	onEditContent: (id: string, content: string) => void
}
// }
// {
// 	editingIndex,
// 	editingValue,
// 	setEditingIndex,
// 	setEditingValue,
// 	onEditContent
// }: ColumnsProps

export const getColumns = (): ColumnDef<NewKnowledgeSource>[] => [
	// {
	// 	id: 'num',
	// 	size: 10,
	// 	header: ({ table }) => (
	// 		<div className='flex justify-center'>
	// 			<Checkbox
	// 				checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
	// 				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
	// 				aria-label='Select all'
	// 			/>
	// 		</div>
	// 	),
	// 	cell: ({ row }) => (
	// 		<div className='flex justify-center'>
	// 			<Checkbox
	// 				checked={row.getIsSelected()}
	// 				onCheckedChange={(value) => row.toggleSelected(!!value)}
	// 				aria-label='Select row'
	// 			/>
	// 		</div>
	// 	),
	// 	enableSorting: false,
	// 	enableHiding: false
	// },
	{
		accessorKey: 'index',
		size: 20,
		header: () => <div className='text-center'>STT</div>,
		cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('index')}</div>
	},
	{
		accessorKey: 'name',
		header: () => <div className='text-center'>Tên Nguồn</div>,
		cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('name')}</div>
	},
	{
		accessorKey: 'description',
		header: () => <div className='text-center'>Mô tả</div>,
		cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('description')}</div>
	},
	{
		accessorKey: 'source_type',
		header: () => <div className='text-center'>Loại nguồn</div>,
		cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('source_type')}</div>
	},
	{
		accessorKey: 'source_location',
		size: 50,
		header: () => <div className='text-center'>Dẫn nguồn</div>,
		cell: ({ row }) => (
			<div className='flex items-center justify-center gap-2'>
				{row.getValue('source_type') === SourceType.URL ? (
					<>
						<div
							className='max-w-20 truncate text-wrap text-center capitalize'
							title={row.getValue('source_location')}
						>
							{row.getValue('source_location')}
						</div>
						<Button
							title='Copy URL'
							variant='ghost'
							size='sm'
							className='h-6 w-6 p-0'
							onClick={() => {
								navigator.clipboard.writeText(row.getValue('source_location'))
							}}
						>
							<Copy className='h-3 w-3' />
						</Button>
					</>
				) : (
					<>
						<Button variant={'gray'} className='bg-gray-100 hover:bg-gray-200'>
							<Download />
							Tải xuống
						</Button>
					</>
				)}
			</div>
		)
	},
	{
		accessorKey: 'status',
		size: 120,
		header: () => <div className='text-center'>Trạng thái</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
				{row.getValue('status') === KnowledgeStatus.ENABLED ? (
					<Badge variant='success'>Đang dùng</Badge>
				) : (
					<Badge variant='graybold'>
						<span title='Chatbot chưa được phép sử dụng nguồn này để làm đầu vào'>Chưa dùng</span>
					</Badge>
				)}
			</div>
		)
	},
	{
		accessorKey: 'ownerName',
		header: () => <div className='text-center'>Người tải</div>,
		cell: ({ row }) => (
			<div className='text-center capitalize'>
				<span title={`${row.getValue('ownerName')} là người tải lên nguồn kiến thức này`}>
					{row.getValue('ownerName')}
				</span>
			</div>
		)
	},
	{
		accessorKey: 'createdAt',
		header: () => <div className='text-center'>Ngày tạo</div>,
		cell: ({ row }) => (
			<div className='text-center capitalize'>{new Date(row.getValue('createdAt')).toLocaleString('vi-VN')}</div>
		)
	},
	{
		accessorKey: 'lastProcessedAt',
		header: () => <div className='text-center'>Lần xử lý cuối</div>,
		cell: ({ row }) => (
			<div className='text-center capitalize'>
				{row.getValue('lastProcessedAt') ? row.getValue('lastProcessedAt') : 'Đang chờ'}
			</div>
		)
	}
	// ,
	// {
	// 	id: 'actions',
	// 	enableHiding: false,
	// 	cell: ({ row }) => {
	// 		const payment = row.original
	// 		return (
	// 			<DropdownMenu>
	// 				<DropdownMenuTrigger asChild>
	// 					<Button variant='ghost' className='h-8 w-8 p-0'>
	// 						<span className='sr-only'>Open menu</span>
	// 						<MoreHorizontal />
	// 					</Button>
	// 				</DropdownMenuTrigger>
	// 				<DropdownMenuContent align='end'>
	// 					<DropdownMenuLabel>Actions</DropdownMenuLabel>
	// 					<DropdownMenuItem onClick={() => navigator.clipboard.writeText(payment.index.toString())}>
	// 						Copy payment ID
	// 					</DropdownMenuItem>
	// 					<DropdownMenuSeparator />
	// 					<DropdownMenuItem>View customer</DropdownMenuItem>
	// 					<DropdownMenuItem>View payment details</DropdownMenuItem>
	// 				</DropdownMenuContent>
	// 			</DropdownMenu>
	// 		)
	// 	}
	// }
]
