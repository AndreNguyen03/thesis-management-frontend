import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Eye, Users, Clock, Tag } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { topicStatusLabels, type GeneralTopic, type Topic } from '@/models'

export const TopicRegisteredCard: React.FC<{
	topic: GeneralTopic
}> = ({ topic }) => {
	const isFullSlot = topic.maxStudents === topic.studentsNum
	const navigate = useNavigate()

	const getStatusBadges = () => (
		<div className='flex flex-col gap-2'>
			<Badge
				className={`text-xs ${topicStatusLabels[topic.currentStatus as keyof typeof topicStatusLabels].css}`}
				variant='outline'
			>
				{topicStatusLabels[topic.currentStatus as keyof typeof topicStatusLabels].name}
			</Badge>
			<Badge variant={isFullSlot ? 'destructive' : 'secondary'} className='justify-center text-xs'>
				{isFullSlot ? 'Đã đủ' : `${topic.maxStudents - topic.studentsNum} chỗ trống`}
			</Badge>
		</div>
	)

	const renderLecturers = () => {
		if (!topic.lecturers || topic.lecturers.length === 0) {
			return (
				<div className='flex items-center gap-2 text-sm text-gray-500'>
					<Users className='h-4 w-4 flex-shrink-0' />
					<span>Không có giảng viên</span>
				</div>
			)
		}

		const mainLecturer = topic.lecturers[0]
		const otherLecturers = topic.lecturers.slice(1)

		return (
			<div className='flex items-center gap-3'>
				<div className='flex items-center gap-2'>
					<div
						className='relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-200'
						title={`${mainLecturer.title || ''} ${mainLecturer.fullName || 'Không xác định'}`}
					>
						{mainLecturer.avatarUrl ? (
							<img
								src={mainLecturer.avatarUrl}
								alt={`${mainLecturer.title || ''} ${mainLecturer.fullName || 'Không xác định'}`}
								className='h-full w-full object-cover'
							/>
						) : (
							<span className='flex h-full w-full items-center justify-center text-xs font-medium text-gray-600'>
								{(mainLecturer.fullName || '')
									.split(' ')
									.map((n) => n[0])
									.join('') || 'N/A'}
							</span>
						)}
					</div>
					<span className='line-clamp-1 text-sm font-medium text-gray-900'>
						{mainLecturer.title || ''}. {mainLecturer.fullName || 'Không xác định'}
					</span>
				</div>
				{otherLecturers.length > 0 && (
					<div className='flex items-center gap-1'>
						<span className='text-xs text-gray-500'>+{otherLecturers.length}</span>
						{otherLecturers.slice(0, 2).map((lec) => (
							<div
								key={lec._id}
								className='relative -mr-1 h-5 w-5 flex-shrink-0 overflow-hidden rounded-full bg-gray-200 ring-1 ring-white'
								title={`${lec.title || ''} ${lec.fullName || 'Không xác định'}`}
							>
								{lec.avatarUrl ? (
									<img
										src={lec.avatarUrl}
										alt={`${lec.title || ''} ${lec.fullName || 'Không xác định'}`}
										className='h-full w-full object-cover'
									/>
								) : (
									<span className='flex h-full w-full items-center justify-center text-[8px] text-gray-600'>
										{(lec.fullName || '')
											.split(' ')
											.map((n) => n[0])
											.join('') || 'N/A'}
									</span>
								)}
							</div>
						))}
					</div>
				)}
			</div>
		)
	}

	const renderFields = () => (
		<div className='flex items-center gap-1'>
			<Tag className='h-3 w-3 flex-shrink-0 text-gray-500' />
			{topic.fields?.slice(0, 2).map((f) => (
				<Badge key={f._id} variant='outline' className='text-xs'>
					{f.name}
				</Badge>
			)) || null}
			{topic.fields && topic.fields.length > 2 && (
				<Badge className='text-xs text-gray-500'>+{topic.fields.length - 2}</Badge>
			)}
		</div>
	)

	const renderRequirements = () => (
		<div className='flex flex-wrap gap-1'>
			{(topic.requirements || []).slice(0, 3).map((req) => (
				<Badge key={req._id} variant='secondary' className='text-xs'>
					{req.name}
				</Badge>
			))}
			{topic.requirements && topic.requirements.length > 3 && (
				<Badge variant='outline' className='text-xs'>
					+{topic.requirements.length - 3}
				</Badge>
			)}
		</div>
	)

	return (
		<Card className='group relative flex h-full flex-col overflow-hidden rounded-lg border border-gray-200 p-2 shadow-sm transition-all hover:border-primary/50 hover:shadow-md'>
			<CardHeader className='flex-1 space-y-3 p-4 pb-3'>
				<div className='flex h-full items-start justify-between gap-3'>
					<div className='flex-1 space-y-2'>
						<CardTitle className='line-clamp-1 text-base font-bold leading-tight text-gray-900'>
							{topic.titleVN || 'Không có tiêu đề'}
						</CardTitle>
						<CardDescription className='line-clamp-1 text-sm text-gray-600'>
							{topic.titleEng || ''}
						</CardDescription>

						{renderLecturers()}
						{renderFields()}
						{renderRequirements()}
					</div>
					{getStatusBadges()}
				</div>
			</CardHeader>

			<CardContent className='mt-auto border-t border-gray-100 p-4 pt-0'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-2 text-xs text-gray-500'>
						<Clock className='h-3 w-3' />
						<span>
							{new Date(topic.createdAt || Date.now()).toLocaleDateString('vi-VN', {
								day: '2-digit',
								month: '2-digit',
								year: 'numeric'
							})}
						</span>
					</div>
					<button
						onClick={() => navigate(`/detail-topic/${topic._id}`)}
						className='inline-flex items-center gap-1 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary/20 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2'
					>
						<Eye className='h-3.5 w-3.5' />
						Xem chi tiết
					</button>
				</div>
			</CardContent>
		</Card>
	)
}
