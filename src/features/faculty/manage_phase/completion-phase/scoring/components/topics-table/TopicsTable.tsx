'use client'

import { Skeleton } from '@/components/ui/skeleton'
import type { TopicsInDefenseMilestone } from '@/models'
import { TopicsTableRow } from './TopicsTableRow'
interface TopicsTableProps {
	topics: TopicsInDefenseMilestone[] | null
	milestoneId: string
	isLoading: boolean
	onScore: (topicId: string) => void
	onDownload?: (topic: TopicsInDefenseMilestone) => void
	onDelete: (topicId: string) => void
}

export function TopicsTable({ topics, milestoneId, isLoading, onScore, onDownload, onDelete }: TopicsTableProps) {
	if (isLoading) {
		return (
			<div className='space-y-2'>
				{Array.from({ length: 5 }).map((_, i) => (
					<Skeleton key={i} className='h-16 w-full' />
				))}
			</div>
		)
	}

	if (!topics || topics.length === 0) {
		return (
			<div className='flex items-center justify-center py-12'>
				<div className='space-y-2 text-center'>
					<p className='text-muted-foreground'>Không có đề tài nào</p>
					<p className='text-sm text-muted-foreground'>
						Vui lòng chọn một mốc thời gian bảo vệ để xem danh sách đề tài
					</p>
				</div>
			</div>
		)
	}

	return (
		<div className='overflow-x-auto rounded-lg border'>
			<table className='w-full border-collapse'>
				<thead className='bg-muted'>
					<tr>
						<th className='w-12 border px-4 py-3 text-left text-sm font-semibold text-foreground'>STT</th>
						<th className='min-w-64 border px-4 py-3 text-left text-sm font-semibold text-foreground'>
							Tiêu đề đề tài
						</th>
						<th className='min-w-48 border px-4 py-3 text-left text-sm font-semibold text-foreground'>
							Sinh viên
						</th>
						<th className='min-w-48 border px-4 py-3 text-left text-sm font-semibold text-foreground'>
							Giảng viên
						</th>
						<th className='w-24 border px-4 py-3 text-center text-sm font-semibold text-foreground'>
							Trạng thái
						</th>
						<th className='w-16 border px-4 py-3 text-center text-sm font-semibold text-foreground'>
							Điểm
						</th>
						<th className='w-24 border px-4 py-3 text-center text-sm font-semibold text-foreground'>
							Xếp loại
						</th>
						<th className='w-20 border px-4 py-3 text-center text-sm font-semibold text-foreground'>
							Thao tác
						</th>
					</tr>
				</thead>
				<tbody>
					{topics.map((topic, index) => (
						<TopicsTableRow
							key={topic._id}
							topic={topic}
							index={index}
							onScore={onScore}
							onDownload={onDownload}
							onDelete={onDelete}
						/>
					))}
				</tbody>
			</table>
		</div>
	)
}
