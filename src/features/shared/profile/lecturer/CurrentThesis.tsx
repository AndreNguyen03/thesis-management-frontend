import { formatDate } from '@/utils/utils'
import type { LecturerUser } from '@/models'
import { TaskCard } from './TaskCard'

export function CurrentThesis({ lecturer }: { lecturer: LecturerUser }) {
	return (
		<div className='space-y-4 p-6 bg-white rounded-md shadow-lg'>
			<h2 className='mb-4 text-xl font-bold text-gray-900 '>Đề tài phụ trách</h2>
			<div className='grid gap-4 lg:grid-cols-3'>
				{lecturer.currentThesis.map((t, idx) => (
					<TaskCard
						className='lg:col-span-1'
						key={idx}
						title={t.title}
						category={t.field}
						date={formatDate(t.deadline)}
						progress={t.totalSlots - t.slotsLeft}
						maxProgress={t.totalSlots}
					/>
				))}
			</div>
		</div>
	)
}
