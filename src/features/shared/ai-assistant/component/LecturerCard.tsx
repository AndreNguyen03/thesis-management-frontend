import type { LecturerSnapshot } from '@/models/chatbot-conversation.model'
import { BookOpen, Lightbulb, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

// LecturerCard Component
export const LecturerCard: React.FC<{ lecturer: LecturerSnapshot }> = ({ lecturer }) => {
	const navigate = useNavigate()
	return (
		<div
			className='mb-3 cursor-pointer rounded-lg border border-green-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md'
			onClick={() => navigate(`/profile/lecturer/${lecturer._id}`)}
		>
			<div className='mb-2 flex items-start justify-between'>
				<div className='flex-1'>
					<h3 className='text-base font-semibold leading-snug text-gray-800'>
						{lecturer.title} {lecturer.fullName}
					</h3>
					<p className='text-sm text-gray-500'>{lecturer.email}</p>
				</div>
				<span className='ml-2 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-700'>
					{(lecturer.similarityScore ? lecturer.similarityScore * 100 : 0).toFixed(2)}% phù hợp
				</span>
			</div>

			{lecturer.bio && <p className='mb-3 line-clamp-2 text-sm text-gray-600'>{lecturer.bio}</p>}

			<div className='space-y-2 text-xs'>
				<div className='flex items-start gap-2'>
					<Tag className='h-4 w-4 flex-shrink-0 text-blue-500' />
					<div>
						<span className='font-medium text-gray-700'>Khoa:</span>
						<span className='ml-1 text-gray-600'>{lecturer.faculty?.name || 'N/A'}</span>
						{lecturer.faculty?.urlDirection && (
							<a
								href={lecturer.faculty.urlDirection}
								target='_blank'
								rel='noopener noreferrer'
								className='ml-2 text-blue-600 underline hover:text-blue-800'
							>
								Trang khoa
							</a>
						)}
					</div>
				</div>

                <div className='flex items-start gap-2'>
                    <Lightbulb className='h-4 w-4 flex-shrink-0 text-yellow-500' />
                    <div>
                        <span className='font-medium text-gray-700'>Lĩnh vực nghiên cứu:</span>
                        <span className='ml-1 text-gray-600'>
                            {lecturer.researchInterests && lecturer.researchInterests.length > 0
                                ? lecturer.researchInterests.join(', ')
                                : 'Chưa cập nhật'}
                        </span>
                    </div>
                </div>

                <div className='flex items-start gap-2'>
                    <BookOpen className='h-4 w-4 flex-shrink-0 text-purple-500' />
                    <div>
                        <span className='font-medium text-gray-700'>Công trình:</span>
                        <span className='ml-1 text-gray-600'>
                            {lecturer.publications && lecturer.publications.length > 0
                                ? `${lecturer.publications.length} bài`
                                : 'Chưa cập nhật'}
                        </span>
                    </div>
                </div>
			</div>
		</div>
	)
}
