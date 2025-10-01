import type { LecturerUser } from 'models'
import { ProgressBar } from './ProgressBar'

export function CompletedThesis({ lecturer }: { lecturer: LecturerUser }) {
	return (
		<div className='grid space-x-4 lg:grid-cols-6'>
			<div className='rounded-lg bg-white p-6 shadow-md lg:col-span-2'>
				<h2 className='mb-4 text-xl font-bold text-gray-900'>Thống kê</h2>
				<ProgressBar label='Xuất sắc' value={20} maxValue={48} color='bg-blue-700' />
				<ProgressBar label='Giỏi' value={24} maxValue={48} color='bg-blue-600' />
				<ProgressBar label='Khá' value={4} maxValue={48} color='bg-blue-500' />
				<div className='mt-4 text-center'>
					<span className='text-xl font-semibold text-gray-800'>92%</span>
					<p className='text-sm text-gray-600'>Tỷ lệ thành công</p>
				</div>
			</div>
			<div className='rounded-lg bg-white p-6 shadow-md lg:col-span-4'>
                <h2 className='mb-4 text-xl font-bold text-gray-900'>Khóa luận đã hướng dẫn nổi bật</h2>
				<ul className='space-y-2'>
					{lecturer.completedThesis.map((t, idx) => (
						<li key={idx} className='flex justify-between rounded border p-2 hover:bg-gray-100'>
							<div>
								<p className='text-sm font-medium'>{t.title}</p>
								<p className='text-xs text-gray-500'>
									{t.student} • {t.year} • {t.field}
								</p>
							</div>
							<span className='text-sm font-semibold'>{t.result}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
