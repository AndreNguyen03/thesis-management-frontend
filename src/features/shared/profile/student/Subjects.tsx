import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import type { StudentUser } from 'models'

export const Subjects = ({ student }: { student: StudentUser }) => {
	const subjects = student.subjects || []
	const [showAll, setShowAll] = useState(false)
	if (!subjects || subjects.length === 0) return <p className='text-sm text-gray-400'>Chưa có môn học</p>

	const visibleSubjects = showAll ? subjects : subjects.slice(0, 6)

	return (
		<div className='rounded-lg bg-white p-4 shadow'>
			<div className='mb-4 flex items-center gap-2'>
				<BookOpen className='h-5 w-5 text-gray-600' />
				<h3 className='text-xl font-semibold'>Môn học đã học</h3>
			</div>

			<ul className='list-inside list-disc space-y-1 text-sm text-gray-700'>
				{visibleSubjects.map((subj, idx) => (
					<li key={idx}>{subj}</li>
				))}
			</ul>

			{subjects.length > 6 && (
				<button
					type='button'
					onClick={() => setShowAll(!showAll)}
					className='mt-2 text-sm text-blue-600 hover:underline'
				>
					{showAll ? 'Thu gọn' : 'Xem thêm'}
				</button>
			)}
		</div>
	)
}
