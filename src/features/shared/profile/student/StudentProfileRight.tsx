import type { StudentUser } from '@/models'
import { Badge } from '@/components/ui'
import { Layers, Sparkles } from 'lucide-react'

interface Props {
	student: StudentUser
}

export function StudentProfileRight({ student }: Props) {
	return (
		<div className='space-y-6'>
			{/* Skills */}
			<div className='rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg'>
				<div className='mb-3 flex items-center gap-2'>
					<Layers className='h-5 w-5 text-gray-600' />
					<h3 className='text-lg font-semibold text-gray-900'>Kỹ năng & Công cụ</h3>
				</div>

				{student.skills.length > 0 ? (
					<div className='flex flex-wrap gap-2'>
						{student.skills.map((skill, idx) => (
							<Badge
								key={idx}
								variant='secondary'
								className='cursor-pointer bg-green-50 px-3 py-1 text-sm text-green-700 transition-all duration-150 hover:bg-green-200'
							>
								{skill}
							</Badge>
						))}
					</div>
				) : (
					<p className='text-sm text-gray-400'>Chưa có</p>
				)}
			</div>
			{/* Interests */}
			<div className='rounded-xl border border-gray-100 bg-white p-6 shadow-md transition-shadow duration-200 hover:shadow-lg'>
				<div className='mb-3 flex items-center gap-2'>
					<Sparkles className='h-5 w-5 text-gray-600' />
					<h3 className='text-lg font-semibold text-gray-900'>Hướng nghiên cứu quan tâm</h3>
				</div>

				{student.interests.length > 0 ? (
					<div className='flex flex-wrap gap-2'>
						{student.interests.map((interest, idx) => (
							<Badge
								key={idx}
								variant='secondary'
								className='cursor-pointer bg-blue-50 px-3 py-1 text-sm text-blue-700 transition-all duration-150 hover:bg-blue-200'
							>
								{interest}
							</Badge>
						))}
					</div>
				) : (
					<p className='text-sm text-gray-400'>Chưa có</p>
				)}
			</div>
		</div>
	)
}
