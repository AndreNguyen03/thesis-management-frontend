import { Badge } from '@/components/ui'
import type { LecturerUser } from 'models'

export function About({ lecturer }: { lecturer: LecturerUser }) {
	return (
		<div className='grid gap-6 lg:grid-cols-6'>
			<div className='space-y-4 lg:col-span-4'>
				<div className='rounded-lg bg-white p-4 shadow'>
					<h3 className='mb-4 text-xl font-bold text-gray-900'>Giới thiệu</h3>
					<p className='text-sm leading-relaxed text-gray-600'>{lecturer.bio || 'Chưa có'}</p>
				</div>
			</div>
			<div className='flex flex-col space-y-4 lg:col-span-2'>
				<div className='rounded-lg bg-white p-4 shadow'>
					<h3 className='mb-4 text-xl font-bold text-gray-900'>Học vấn</h3>

					<div className='space-y-6'>
						{lecturer.education.length ? (
							lecturer.education.map((edu, idx) => (
								<div key={idx} className='border-l-2 border-primary/20 pl-4'>
									<h4 className='font-semibold'>{edu.degree}</h4>
									<p className='mb-1 text-sm text-muted-foreground'>
										{edu.university} ({edu.year})
									</p>
									<div className='flex flex-wrap gap-1'>
										<Badge variant='secondary' className='text-xs'>
											{edu.specialization}
										</Badge>
									</div>
								</div>
							))
						) : (
							<p className='text-sm text-gray-400'>Chưa có thông tin học vấn</p>
						)}
					</div>
				</div>

				<div className='rounded-lg bg-white p-4 shadow'>
					<h3 className='mb-4 text-xl font-bold text-gray-900'>Quan tâm nghiên cứu</h3>
					<ul className='list-inside list-disc text-sm leading-relaxed'>
						{lecturer.researchInterests.map((i, idx) => (
							<li key={idx}>{i}</li>
						))}
					</ul>
				</div>
			</div>
		</div>
	)
}
