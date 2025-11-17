import { Badge, Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/checkbox'
import type { ColumnDef } from '@tanstack/react-table'

export type Suggestion = {
	_id: string
	index: number
	content: string
	status: boolean
}

type ColumnsProps = {
	editingIndex: number | null
	editingValue: string
	setEditingIndex: (index: number | null) => void
	setEditingValue: (value: string) => void
	onEditContent: (id: string, content: string) => void
}

export const getColumns = ({
	editingIndex,
	editingValue,
	setEditingIndex,
	setEditingValue,
	onEditContent
}: ColumnsProps): ColumnDef<Suggestion>[] => [
	{
		id: 'num',
		size: 10,
		header: ({ table }) => (
			<div className='flex justify-center'>
				<Checkbox
					checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
					onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
					aria-label='Select all'
				/>
			</div>
		),
		cell: ({ row }) => (
			<div className='flex justify-center'>
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label='Select row'
				/>
			</div>
		),
		enableSorting: false,
		enableHiding: false
	},
	{
		accessorKey: 'index',
		size: 80,
		header: () => <div className='text-center'>Number</div>,
		cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('index')}</div>
	},
	{
		accessorKey: 'content',
		header: () => <div className='text-center'>Content</div>,
		cell: ({ row }) => {
			const isEditing = editingIndex === row.original.index
			return (
				<div className='flex items-center justify-center space-x-3'>
					{isEditing ? (
						<input
							value={editingValue}
							onChange={(e) => setEditingValue(e.target.value)}
							onBlur={() => onEditContent(row.original._id, editingValue)}
							className='border border-gray-300 px-2 py-1'
							autoFocus
						/>
					) : (
						<div
							className='w-fit cursor-pointer px-1 py-1 text-center capitalize hover:border hover:border-gray-200 hover:bg-white'
							onClick={() => {
								setEditingIndex(row.original.index)
								setEditingValue(row.original.content)
							}}
						>
							{row.getValue('content')}
						</div>
					)}
					{/* button save or cancel changes
					<div className='flex items-center justify-between space-x-1'>
						<Button variant={'blue'} className='h-fit px-1 py-1 text-[12px]'>
							Lưu
						</Button>
						<Button variant={'red'} className='h-fit px-1 py-1 text-[12px]'>
							Hủy
						</Button>
					</div> */}
				</div>
			)
		}
	},
	{
		accessorKey: 'status',
		size: 120,
		header: () => <div className='text-center'>Status</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
				{row.getValue('status') ? (
					<Badge variant='success'>Đang dùng</Badge>
				) : (
					<Badge variant='destructive'>Không dùng</Badge>
				)}
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
