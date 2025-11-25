import { Badge, Button } from '@/components/ui'
import { Checkbox } from '@/components/ui/checkbox'
import {
	topicStatusLabels,
	TopicTypeTransfer,
	type GetFieldNameReponseDto,
	type GetRequirementNameReponseDto,
	type SubmittedTopic
} from '@/models'
import type { ColumnDef } from '@tanstack/react-table'
import { Eye } from 'lucide-react'

type ColumnsProps = {
	onSeeDetail: (topicId: string) => void
}
interface NewSubmittedTopic extends SubmittedTopic {
	index: number
}

export const getColumns = ({ onSeeDetail }: ColumnsProps): ColumnDef<NewSubmittedTopic>[] => [
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
				<div className='flex max-w-xl justify-center capitalize' title={row.getValue('titleVN')}>
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
		size: 300,
		header: () => <div className='text-center'>Mô tả</div>,
		cell: ({ row }) => (
			<div className='flex max-w-xl justify-center capitalize' title={row.getValue('description')}>
				<span className='line-clamp-5 text-wrap break-words'>{row.getValue('description')}</span>
			</div>
		)
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
			return <div className='flex justify-center capitalize'>{row.original.periodInfo?.name || ''}</div>
		}
	},
	{
		accessorKey: 'createdAt',
		size: 50,
		header: () => <div className='text-center'> Ngày tạo</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
				{(() => {
					return <>{new Date(row.getValue('createdAt')).toLocaleString('vi-VN')}</>
				})()}
			</div>
		)
	},
	{
		accessorKey: 'submittedAt',
		size: 50,
		header: () => <div className='text-center'> Ngày nộp</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
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
			<div className='flex flex-row flex-wrap justify-center capitalize'>
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
		accessorKey: 'actions',
		size: 200,
		header: () => <div className='text-center'>Hành động</div>,
		cell: ({ row }) => (
			<div className='flex flex-row flex-wrap justify-center capitalize'>
				<Button variant='outline' size='sm' onClick={() => onSeeDetail(row.original._id)}>
					<Eye className='h-4 w-4' />
				</Button>
			</div>
		)
	}
]
