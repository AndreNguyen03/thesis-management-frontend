import { Badge } from '@/components/ui'
import { Checkbox } from '@/components/ui/checkbox'
import type { DraftTopic, GetFieldNameReponseDto, GetRequirementNameReponseDto } from '@/models'
import type { ColumnDef } from '@tanstack/react-table'

type ColumnsProps = {
	editingIndex: number | null
	editingValue: string
	setEditingIndex: (index: number | null) => void
	setEditingValue: (value: string) => void
	onEditContent: (id: string, content: string) => void
}
interface NewDraftTopic extends DraftTopic {
	index: number
	time: { createdAt: Date; updatedAt: Date }
}

export const getColumns = (): ColumnDef<NewDraftTopic>[] => [
	{
		accessorKey: 'index',
		size: 80,
		header: () => <div className='text-center'>STT</div>,
		cell: ({ row }) => <div className='text-center capitalize'>{row.getValue('index')}</div>
	},
	{
		accessorKey: 'description',
		size: 300,
		header: () => <div className='text-center'>Mô tả</div>,
		cell: ({ row }) => (
			<>
				<div className='flex justify-center capitalize'>{row.getValue('description')}</div>
				<Badge variant='outline'>Bản nháp</Badge>
			</>
		)
	},
	{
		accessorKey: 'type',
		size: 120,
		header: () => <div className='text-center'>Loại</div>,
		cell: ({ row }) => <div className='flex justify-center capitalize'>{row.getValue('type')}</div>
	},
	{
		accessorKey: 'maxStudents',
		size: 120,
		header: () => <div className='text-center'>Số lượng sinh viên tối đa</div>,
		cell: ({ row }) => <div className='flex justify-center capitalize'>{row.getValue('maxStudents')}</div>
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
								<span className='font-semibold'>Ngày Tạo:</span>
								{` ${new Date(time.createdAt).toLocaleString('vi-VN')}`}
							</div>
							<div>
								<span className='font-semibold'>Cập nhật:</span>
								{` ${new Date(time.updatedAt).toLocaleString('vi-VN')}`}
							</div>
						</>
					)
				})()}
			</div>
		)
	},
	{
		accessorKey: 'fields',
		size: 120,
		header: () => <div className='text-center'>Lĩnh vực</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
				{(() => {
					const fields = row.getValue('fields') as Array<GetFieldNameReponseDto> | undefined
					return fields && Array.isArray(fields)
						? fields.map((field) => (
								<Badge key={field.slug} className='mr-1'>
									{field.name}
								</Badge>
							))
						: null
				})()}
			</div>
		)
	},
	{
		accessorKey: 'requirements',
		size: 120,
		header: () => <div className='text-center'>Yêu cầu</div>,
		cell: ({ row }) => (
			<div className='flex justify-center capitalize'>
				{(() => {
					const requirements = row.getValue('requirements') as Array<GetRequirementNameReponseDto> | undefined
					return requirements && Array.isArray(requirements)
						? requirements.map((requirement) => (
								<Badge key={requirement.slug} className='mr-1'>
									{requirement.name}
								</Badge>
							))
						: null
				})()}
			</div>
		)
	}
]
