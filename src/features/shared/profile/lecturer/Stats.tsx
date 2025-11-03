import type { ThesisStats } from '@/models'

export function Stats({ stats }: { stats: ThesisStats }) {
	return (
		<div className='grid gap-4 pt-8 text-center md:grid-cols-4'>
			<div>
				<p className='text-2xl font-bold'>{stats.total}</p>
				<p className='text-sm text-gray-500'>Tổng đề tài</p>
			</div>
			<div>
				<p className='text-2xl font-bold text-green-600'>{stats.completed}</p>
				<p className='text-sm text-gray-500'>Đã hoàn thành</p>
			</div>
			<div>
				<p className='text-2xl font-bold text-yellow-600'>{stats.excellent}</p>
				<p className='text-sm text-gray-500'>Xuất sắc</p>
			</div>
			<div>
				<p className='text-2xl font-bold'>{stats.successRate}%</p>
				<p className='text-sm text-gray-500'>Tỷ lệ thành công</p>
			</div>
		</div>
	)
}
