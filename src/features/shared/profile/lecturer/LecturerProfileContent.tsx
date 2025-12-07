import type { LecturerProfile } from '@/models'

interface LecturerProfileContentProps {
	lecturer: LecturerProfile
}

export function LecturerProfileContent({ lecturer }: LecturerProfileContentProps) {
	const publications = lecturer.publications ?? []
	const researchInterests = lecturer.researchInterests ?? []
	const areaInterest = lecturer.areaInterest ?? []

	return (
		<div className='grid gap-6 lg:grid-cols-6'>
			{/* Left column */}
			<div className='space-y-5 lg:col-span-4'>
				{/* Bio */}
				<div className='rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md'>
					<h3 className='mb-4 text-2xl font-bold text-gray-900'>Giới thiệu</h3>
					<p className='text-base leading-relaxed text-gray-700'>{lecturer.bio || 'Chưa có'}</p>
				</div>

				{/* Publications */}
				<div className='rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md'>
					<h3 className='mb-4 text-2xl font-bold text-gray-900'>Công trình nghiên cứu</h3>

					{publications.length > 0 ? (
						<ul className='space-y-3 text-sm'>
							{publications.map((pub, idx) => (
								<li key={idx} className='rounded-md border p-3 transition-all hover:bg-gray-100'>
									<div className='flex items-center justify-between'>
										<p className='font-medium text-gray-800'>{pub.title || 'Chưa có tiêu đề'}</p>

										{/* Link bài báo */}
										{pub.link && (
											<a
												href={pub.link}
												target='_blank'
												rel='noopener noreferrer'
												className='flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline'
											>
												Xem bài
												<svg
													xmlns='http://www.w3.org/2000/svg'
													className='h-3 w-3'
													fill='none'
													viewBox='0 0 24 24'
													stroke='currentColor'
													strokeWidth='2'
												>
													<path
														strokeLinecap='round'
														strokeLinejoin='round'
														d='M13 7h6m0 0v6m0-6L10 16'
													/>
												</svg>
											</a>
										)}
									</div>

									<p className='text-xs text-gray-500'>
										{pub.journal || pub.conference || 'Chưa có'} • {pub.year ?? 'N/A'} •{' '}
										{pub.type ?? 'N/A'}
									</p>

									<p className='text-xs text-gray-500'>Citations: {pub.citations ?? 0}</p>
								</li>
							))}
						</ul>
					) : (
						<p className='text-base text-gray-600'>Chưa có công trình nghiên cứu</p>
					)}
				</div>
			</div>

			{/* Right column */}
			<div className='flex flex-col gap-5 lg:col-span-2'>
				{/* Expertise */}
				<div className='rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md'>
					<h3 className='mb-4 text-xl font-semibold text-gray-900'>Chuyên môn</h3>
					<ul className='list-inside list-disc text-base leading-relaxed text-gray-700'>
						{areaInterest.length > 0 ? (
							areaInterest.map((i, idx) => <li key={idx}>{i}</li>)
						) : (
							<li>Chưa có</li>
						)}
					</ul>
				</div>

				{/* Research Interests */}
				<div className='rounded-xl bg-white p-6 shadow-sm transition-all hover:shadow-md'>
					<h3 className='mb-4 text-xl font-semibold text-gray-900'>Quan tâm nghiên cứu</h3>
					<ul className='list-inside list-disc text-base leading-relaxed text-gray-700'>
						{researchInterests.length > 0 ? (
							researchInterests.map((i, idx) => <li key={idx}>{i}</li>)
						) : (
							<li>Chưa có</li>
						)}
					</ul>
				</div>
			</div>
		</div>
	)
}
