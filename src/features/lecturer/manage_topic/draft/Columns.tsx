import { Badge, Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { topicStatusLabels, TopicTypeTransfer, type DraftTopic, type GetFieldNameReponseDto } from '@/models'
import { stripHtml } from '@/utils/lower-case-html'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye, Loader2, Trash } from 'lucide-react'

type ColumnsProps = {
	onSeeDetail: (topicId: string) => void
	showSelection: boolean
	onManualApprovalChange?: (checked: boolean, topicId: string) => void
	pendingId?: string | null
	handleDeleteConfirmModal: (topicId: string) => void
}
interface NewDraftTopic extends DraftTopic {
	index: number
	time: { createdAt: Date; updatedAt: Date }
}

export const getColumns = ({
	onSeeDetail,
	showSelection,
	onManualApprovalChange,
	pendingId,
	handleDeleteConfirmModal
}: ColumnsProps): ColumnDef<NewDraftTopic>[] => [
	...(showSelection
		? [
				{
					id: 'select',
					size: 30,
					header: ({ table }: any) => (
						<div className='flex justify-center'>
							<Checkbox
								checked={table.getIsAllRowsSelected()}
								onCheckedChange={(value) => table.toggleAllRowsSelected(!!value)}
								aria-label='Chọn tất cả'
							/>
						</div>
					),
					cell: ({ row }: any) => (
						<div className='flex justify-center'>
							<Checkbox
								checked={row.getIsSelected()}
								onCheckedChange={(value) => row.toggleSelected(!!value)}
								aria-label={`Chọn đề tài ${row.getValue('titleVN')}`}
							/>
						</div>
					),
					enableSorting: false,
					enableColumnFilter: false
				}
			]
		: []),
	{
		accessorKey: 'index',
		size: 10,
		header: () => <div className='text-center'>STT</div>,
		cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('index')}</div>
	},
	{
		accessorKey: 'titleVN',
		header: () => <div className='text-center'>Tên đề tài</div>,
		cell: ({ row }) => (
			<div className=''>
				<div className='flex max-w-xs justify-center capitalize' title={row.getValue('titleVN')}>
					<span className='truncate text-wrap'>{row.getValue('titleVN')}</span>
				</div>
				<div
					className='flex max-w-xs justify-center truncate text-xs text-muted-foreground'
					title={row.original.titleEng}
				>
					<span className='truncate text-wrap'>{row.original.titleEng}</span>
				</div>
			</div>
		)
	},
	{
		accessorKey: 'description',
		size: 200,
		header: () => <div className='text-center'>Mô tả</div>,
		cell: ({ row }) => (
			<div className=''>
				<div className='flex max-w-80 justify-center capitalize' title={stripHtml(row.getValue('description'))}>
					<span className='p line-clamp-5 truncate text-wrap'>{stripHtml(row.getValue('description'))}</span>
				</div>
			</div>
		)
	},
	{
		accessorKey: 'currentStatus',
		size: 120,
		header: () => <div className='text-center'>Trạng thái</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
				<Badge
					className={topicStatusLabels[row.getValue('currentStatus') as keyof typeof topicStatusLabels].css}
				>
					{topicStatusLabels[row.getValue('currentStatus') as keyof typeof topicStatusLabels].name}
				</Badge>
			</div>
		)
	},
	{
		accessorKey: 'type',
		size: 100,
		header: () => <div className='text-center'>Loại</div>,
		cell: ({ row }) => (
			<div className='flex flex-row flex-wrap justify-center capitalize'>
				<Badge className={TopicTypeTransfer[row.getValue('type') as keyof typeof TopicTypeTransfer].css}>
					{TopicTypeTransfer[row.getValue('type') as keyof typeof TopicTypeTransfer].name}
				</Badge>
			</div>
		)
	},
	{
		accessorKey: 'time',
		size: 120,
		header: () => <div className='text-center'>Thời gian</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
				{(() => {
					const time = row.getValue('time') as { createdAt: Date; updatedAt: Date }
					return (
						<>
							<div>
								<span className='text-[13px] font-semibold'>Ngày Tạo:</span>
								<span className='text-[13px]'>{` ${new Date(time.createdAt).toLocaleString('vi-VN')}`}</span>
							</div>
							<div>
								<span className='text-[13px] font-semibold'>Cập nhật:</span>
								<span className='text-[13px]'>{` ${new Date(time.updatedAt).toLocaleString('vi-VN')}`}</span>
							</div>
						</>
					)
				})()}
			</div>
		)
	},
	{
		accessorKey: 'fields',
		size: 200,
		header: () => <div className='text-center'>Lĩnh vực</div>,
		cell: ({ row }) => (
			<div className='flex flex-row flex-wrap justify-center gap-2 capitalize'>
				{(() => {
					const fields = row.getValue('fields') as Array<GetFieldNameReponseDto> | undefined
					return fields && Array.isArray(fields)
						? fields.map((field) => (
								<Badge variant='mini' key={field.slug} className='mr-1'>
									{field.name}
								</Badge>
							))
						: null
				})()}
			</div>
		)
	},
	{
		accessorKey: 'allowManualApproval',
		size: 50,
		header: () => <div className='text-center'>Xét duyệt</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
				<div className='flex items-center space-x-2'>
					{pendingId === row.original._id ? <Loader2 className='h-2 w-2 animate-spin' /> : null}
					<Switch
						disabled={pendingId === row.original._id}
						checked={row.getValue('allowManualApproval')}
						onCheckedChange={(checked) => {
							if (onManualApprovalChange) {
								onManualApprovalChange(checked, row.original._id)
							}
						}}
					/>
				</div>
			</div>
		)
	},
	{
		accessorKey: 'actions',
		size: 10,
		header: () => <div className='text-center'>Hành động</div>,
		cell: ({ row }) => (
			<div className='flex w-fit flex-row flex-wrap justify-center gap-2 capitalize'>
				<Button variant='outline' size='sm' onClick={() => onSeeDetail(row.original._id)}>
					<Eye className='h-4 w-4' />
				</Button>
				<Button
					variant='outline'
					size='sm'
					title='Xóa bản nháp'
					onClick={() => handleDeleteConfirmModal(row.original._id)}
				>
					<Trash className='h-4 w-4' />
				</Button>
			</div>
		)
	}
]
