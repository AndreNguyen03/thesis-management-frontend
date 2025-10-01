import { Mail, Phone, GraduationCap } from 'lucide-react'
import type { StudentUser } from 'models'

export const BasicInfo = ({ student }: { student: StudentUser }) => {
	return (
		<div className='rounded-lg bg-white p-4 shadow'>
			{/* Header */}
			<div className='mb-4 flex items-center gap-4'>
				<div className='relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gray-200 text-lg font-semibold text-gray-600'>
					{student.avatar ? (
						<img src={student.avatar} alt={student.fullName} className='h-full w-full object-cover' />
					) : student.fullName ? (
						student.fullName
							.split(' ')
							.map((n) => n[0])
							.join('')
					) : (
						'Chưa có'
					)}
				</div>
				<div>
					<h2 className='text-2xl font-bold'>{student.fullName || 'Chưa có'}</h2>
					<div className='mt-2 flex items-center gap-2 text-gray-500'>
						<GraduationCap className='h-4 w-4' />
						<span>
							{student.class || 'Chưa có'} - {student.major || 'Chưa có'}
						</span>
					</div>
				</div>
			</div>

			{/* Contact Info */}
			<div className='grid gap-3 md:grid-cols-2'>
				<div className='flex items-center gap-2'>
					<Mail className='h-4 w-4 text-gray-500' />
					<span className='text-sm'>{student.email || 'Chưa có'}</span>
				</div>
				<div className='flex items-center gap-2'>
					<Phone className='h-4 w-4 text-gray-500' />
					<span className='text-sm'>{student.phone || 'Chưa có'}</span>
				</div>
			</div>
		</div>
	)
}
