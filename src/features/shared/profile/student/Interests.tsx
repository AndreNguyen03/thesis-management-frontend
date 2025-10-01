// Interests.tsx
import { Heart } from 'lucide-react'
import type { StudentUser } from 'models'

export const Interests = ({ student }: { student: StudentUser }) => {
    const interests = student.interests

	return (
		<div className='rounded-lg bg-white p-4 shadow'>
			<div className='mb-3 flex items-center gap-2'>
				<Heart className='h-5 w-5' />
				<h3 className='text-lg font-semibold'>Hướng nghiên cứu quan tâm</h3>
			</div>
			{interests.length > 0 ? (
				<div className='flex flex-wrap gap-2'>
					{interests.map((interest, idx) => (
						<span
							key={idx}
							className='rounded bg-blue-100 px-2 py-1 text-sm text-blue-700 transition hover:bg-blue-200'
						>
							{interest}
						</span>
					))}
				</div>
			) : (
				<p className='text-sm text-gray-400'>Chưa có</p>
			)}
		</div>
	)
}
