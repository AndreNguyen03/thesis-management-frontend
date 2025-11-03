import type { LecturerUser } from '@/models'

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
