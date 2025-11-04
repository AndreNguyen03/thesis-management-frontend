'use client'

import { CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import type { LecturerRecord } from './BulkCreateModal'


interface LecturerProgressTableProps {
	lecturers: LecturerRecord[]
}

export default function LecturerProgressTable({ lecturers }: LecturerProgressTableProps) {
	const getStatusIcon = (status: LecturerRecord['status']) => {
		switch (status) {
			case 'success':
				return <CheckCircle2 className='h-5 w-5 text-green-500' />
			case 'error':
				return <AlertCircle className='h-5 w-5 text-red-500' />
			case 'pending':
			case 'processing':
				return <Clock className='h-5 w-5 text-amber-500' />
		}
	}

	const getStatusText = (status: LecturerRecord['status']) => {
		switch (status) {
			case 'success':
				return 'Thành công'
			case 'error':
				return 'Thất bại'
			case 'pending':
			case 'processing':
				return 'Đang xử lý'
		}
	}

	return (
		<div className='overflow-x-auto'>
			<table className='w-full text-sm'>
				<thead>
					<tr className='border-b border-border'>
						<th className='px-4 py-3 text-left font-medium text-muted-foreground'>Tên giảng viên</th>
						<th className='px-4 py-3 text-left font-medium text-muted-foreground'>Email</th>
						<th className='px-4 py-3 text-left font-medium text-muted-foreground'>Trạng thái</th>
					</tr>
				</thead>
				<tbody>
					{lecturers.map((lecturer, idx) => (
						<tr key={idx} className='border-b border-border/50'>
							<td className='px-4 py-3'>
								<div>
									<p className='font-medium text-foreground'>{lecturer.name}</p>
									<p className='text-xs text-muted-foreground'>{lecturer.code}</p>
								</div>
							</td>
							<td className='px-4 py-3'>{lecturer.email}</td>
							<td className='px-4 py-3'>
								<div className='flex items-center gap-2'>
									{getStatusIcon(lecturer.status)}
									<span className='text-foreground'>{getStatusText(lecturer.status)}</span>
								</div>
								{lecturer.error && <p className='mt-1 text-xs text-red-500'>{lecturer.error}</p>}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
