import { Badge, Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import { topicStatusLabels, TopicTypeTransfer, type GetFieldNameReponseDto, type SubmittedTopic } from '@/models'
import { stripHtml } from '@/utils/lower-case-html'
import type { ColumnDef, Row } from '@tanstack/react-table'
import { Eye, Loader2, UndoDot } from 'lucide-react'

type ColumnsProps = {
	onSeeDetail: (topicId: string) => void
	showSelection: boolean
	onManualApprovalChange?: (checked: boolean, topicId: string) => void
	pendingId?: string | null
	pendingWithdrawId?: string | null
	onWithdraw: (topic: SubmittedTopic) => void
}
interface NewSubmittedTopic extends SubmittedTopic {
	index: number
}

export const getColumns = ({
	onSeeDetail,
	showSelection,
	onManualApprovalChange,
	pendingId,
	pendingWithdrawId,
	onWithdraw
}: ColumnsProps): ColumnDef<NewSubmittedTopic>[] => [
	{
		accessorKey: 'index',
		size: 10,
		header: () => <div className='text-center'>STT</div>,
		cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('index')}</div>
	},
	{
		accessorKey: 'titleVN',
		size: 300,
		header: () => <div className='text-center'>Tên đề tài</div>,
		cell: ({ row }) => (
			<div className='max-w-xl'>
				<div className='flex max-w-xl justify-center text-[14px] capitalize' title={row.getValue('titleVN')}>
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
		size: 250,
		header: () => <div className='text-center'>Mô tả</div>,
		cell: ({ row }) => {
			const rawHtml = row.getValue('description') as string
			const plainTextTitle = stripHtml(rawHtml || '')

			return (
				<div className='flex max-w-xl justify-center text-[13px] capitalize' title={plainTextTitle}>
					<span className='line-clamp-5 text-wrap break-words'>{plainTextTitle}</span>
				</div>
			)
		}
	},
	{
		accessorKey: 'type',
		size: 120,
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
		accessorKey: 'periodInfo',
		size: 150,
		header: () => <div className='text-center'> HK</div>,
		cell: ({ row }) => {
			return (
				<div className='flex justify-center text-[14px] capitalize'>{row.original.periodInfo?.name || ''}</div>
			)
		}
	},
	{
		accessorKey: 'createdAt',
		size: 50,
		header: () => <div className='justify-center'>Số lượng đăng ký</div>,
		cell: ({ row }) => <div className='flex justify-center capitalize'>{row.original.studentsNum}</div>
	},
	{
		accessorKey: 'submittedAt',
		size: 50,
		header: () => <div className='text-center'> Ngày nộp</div>,
		cell: ({ row }) => (
			<div className='flex justify-center text-[13px] font-semibold capitalize text-blue-800'>
				{(() => {
					return <>{new Date(row.getValue('submittedAt')).toLocaleString('vi-VN')}</>
				})()}
			</div>
		)
	},
	{
		accessorKey: 'fields',
		size: 200,
		header: () => <div className='text-center'>Lĩnh vực</div>,
		cell: ({ row }) => (
			<div className='flex flex-row flex-wrap justify-center gap-1 capitalize'>
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
		header: () => <div className='text-center'>Duyệt tự động</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
				<div className='flex items-center space-x-2'>
					{pendingId === row.original._id ? <Loader2 className='h-2 w-2 animate-spin' /> : null}
					<Switch
						disabled={pendingId === row.original._id}
						checked={row.getValue('allowManualApproval')}
						onCheckedChange={(checked) => {
							onManualApprovalChange && onManualApprovalChange(checked, row.original._id)
						}}
					/>
				</div>
			</div>
		)
	},
	...(!showSelection
		? [
				{
					accessorKey: 'actions',
					size: 200,
					header: () => <div className='text-center'>Hành động</div>,
					cell: ({ row }: { row: Row<NewSubmittedTopic> }) => (
						<div className='flex flex-row flex-wrap justify-center gap-1 capitalize'>
							<Button
								title='Xem chi tiết'
								variant='outline'
								size='sm'
								onClick={() => onSeeDetail(row.original._id)}
							>
								<Eye className='h-4 w-4' />
							</Button>
							{row.original.currentStatus === 'submitted' && (
								<Button
									title='Rút'
									variant='outline'
									size='sm'
									onClick={() => {
										onWithdraw(row.original)
									}}
								>
									{pendingWithdrawId === row.original._id ? (
										<Loader2 className='h-4 w-4 animate-spin' />
									) : (
										<UndoDot className='h-4 w-4' />
									)}
								</Button>
							)}
						</div>
					)
				}
			]
		: []),
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
		: [])
]
