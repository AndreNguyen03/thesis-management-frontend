import { Code } from 'lucide-react'
import type { StudentUser } from '@/models'

export const Skills = ({ student }: { student: StudentUser }) => {
	const skills = student.skills || []

	return (
		<div className='rounded-lg bg-white p-4 shadow'>
			<div className='mb-3 flex items-center gap-2'>
				<Code className='h-5 w-5' />
				<h3 className='text-lg font-semibold'>Kỹ năng & Công cụ</h3>
			</div>

			{skills.length > 0 ? (
				<div className='flex flex-wrap gap-2'>
					{skills.map((skill, idx) => (
						<span
							key={idx}
							className='rounded bg-blue-100 px-2 py-1 text-sm text-blue-700 transition hover:bg-blue-200'
						>
							{skill}
						</span>
					))}
				</div>
			) : (
				<p className='text-sm text-gray-400'>Chưa có</p>
			)}
		</div>
	)
}
