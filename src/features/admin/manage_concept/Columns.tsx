import { ColumnDef } from '@tanstack/react-table'
import { ConceptCandidate, ConceptCandidateStatus } from '../types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, CheckCircle, XCircle, Clock } from 'lucide-react'
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

const getStatusBadge = (status: ConceptCandidateStatus) => {
	switch (status) {
		case ConceptCandidateStatus.PENDING:
			return (
				<Badge variant='outline' className='border-yellow-200 bg-yellow-50 text-yellow-700'>
					<Clock className='mr-1 h-3 w-3' />
					Đang chờ
				</Badge>
			)
		case ConceptCandidateStatus.APPROVED:
			return (
				<Badge variant='outline' className='border-green-200 bg-green-50 text-green-700'>
					<CheckCircle className='mr-1 h-3 w-3' />
					Đã duyệt
				</Badge>
			)
		case ConceptCandidateStatus.REJECTED:
			return (
				<Badge variant='outline' className='border-red-200 bg-red-50 text-red-700'>
					<XCircle className='mr-1 h-3 w-3' />
					Từ chối
				</Badge>
			)
	}
}

export const columns = (
	onView: (candidate: ConceptCandidate) => void,
	onApprove: (candidate: ConceptCandidate) => void,
	onReject: (candidate: ConceptCandidate) => void,
	onDelete: (candidate: ConceptCandidate) => void
): ColumnDef<ConceptCandidate>[] => [
	{
		accessorKey: 'canonical',
		header: 'Canonical Token',
		cell: ({ row }) => {
			const candidate = row.original
			return (
				<div className='space-y-1'>
					<div className='font-medium text-gray-900'>{candidate.canonical}</div>
					{candidate.suggestedLabel && (
						<div className='text-sm text-gray-500'>→ {candidate.suggestedLabel}</div>
					)}
				</div>
			)
		}
	},
	{
		accessorKey: 'frequency',
		header: 'Tần suất',
		cell: ({ row }) => {
			const frequency = row.getValue('frequency') as number
			return (
				<Badge variant='secondary' className='font-mono'>
					{frequency}
				</Badge>
			)
		}
	},
	{
		accessorKey: 'variants',
		header: 'Biến thể',
		cell: ({ row }) => {
			const variants = row.getValue('variants') as string[]
			if (variants.length <= 1) return <span className='text-gray-400'>—</span>

			return (
				<div className='flex flex-wrap gap-1'>
					{variants.slice(0, 3).map((v, idx) => (
						<Badge key={idx} variant='outline' className='text-xs'>
							{v}
						</Badge>
					))}
					{variants.length > 3 && (
						<Badge variant='outline' className='text-xs'>
							+{variants.length - 3}
						</Badge>
					)}
				</div>
			)
		}
	},
	{
		accessorKey: 'suggestedParent',
		header: 'Parent',
		cell: ({ row }) => {
			const parent = row.getValue('suggestedParent') as string | undefined
			if (!parent) return <span className='text-gray-400'>—</span>

			return (
				<Badge variant='outline' className='font-mono text-xs'>
					{parent}
				</Badge>
			)
		}
	},
	{
		accessorKey: 'status',
		header: 'Trạng thái',
		cell: ({ row }) => {
			const status = row.getValue('status') as ConceptCandidateStatus
			return getStatusBadge(status)
		}
	},
	{
		accessorKey: 'createdAt',
		header: 'Thời gian',
		cell: ({ row }) => {
			const createdAt = row.getValue('createdAt') as string
			return (
				<span className='text-sm text-gray-500'>
					{formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: vi })}
				</span>
			)
		}
	},
	{
		id: 'actions',
		header: 'Thao tác',
		cell: ({ row }) => {
			const candidate = row.original

			return (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant='ghost' className='h-8 w-8 p-0'>
							<MoreHorizontal className='h-4 w-4' />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align='end'>
						<DropdownMenuLabel>Thao tác</DropdownMenuLabel>
						<DropdownMenuSeparator />
						<DropdownMenuItem onClick={() => onView(candidate)}>Xem chi tiết</DropdownMenuItem>
						{candidate.status === ConceptCandidateStatus.PENDING && (
							<>
								<DropdownMenuItem onClick={() => onApprove(candidate)} className='text-green-600'>
									Phê duyệt
								</DropdownMenuItem>
								<DropdownMenuItem onClick={() => onReject(candidate)} className='text-red-600'>
									Từ chối
								</DropdownMenuItem>
							</>
						)}
						{candidate.status === ConceptCandidateStatus.REJECTED && (
							<DropdownMenuItem onClick={() => onDelete(candidate)} className='text-red-600'>
								Xóa
							</DropdownMenuItem>
						)}
					</DropdownMenuContent>
				</DropdownMenu>
			)
		}
	}
]
