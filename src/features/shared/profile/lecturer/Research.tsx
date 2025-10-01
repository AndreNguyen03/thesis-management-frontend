import type { LecturerUser } from 'models'

export function Research({ lecturer }: { lecturer: LecturerUser }) {
	return (
		<div className='grid gap-6 lg:grid-cols-6'>
			<div className='space-y-4 rounded-lg bg-white p-6 shadow-md lg:col-span-3'>
				<h3 className='mb-4 text-xl font-bold text-gray-900'>Công trình nghiên cứu</h3>
				<ul className='space-y-2 text-sm'>
					{lecturer.publications.map((pub, idx) => (
						<li key={idx} className='rounded border p-2 hover:bg-gray-100'>
							<p className='font-medium'>{pub.title}</p>
							<p className='text-xs text-gray-500'>
								{pub.journal || pub.conference} • {pub.year} • {pub.type}
							</p>
							<p className='text-xs text-gray-500'>Citations: {pub.citations}</p>
						</li>
					))}
				</ul>
			</div>

			<div className='space-y-4 rounded-lg bg-white p-6 shadow-md lg:col-span-3'>
				<h3 className='mb-4 text-xl font-bold text-gray-900'>Dự án nghiên cứu</h3>
				<ul className='space-y-2 text-sm'>
					{lecturer.projects.map((proj, idx) => (
						<li key={idx} className='rounded border p-2 hover:bg-gray-100'>
							<p className='font-medium'>{proj.title}</p>
							<p className='text-xs text-gray-500'>Thời gian: {proj.duration}</p>
							<p className='text-xs text-gray-500'>Vai trò: {proj.role}</p>
							<p className='text-xs text-gray-500'>Tài trợ: {proj.funding}</p>
						</li>
					))}
				</ul>
			</div>
		</div>
	)
}
