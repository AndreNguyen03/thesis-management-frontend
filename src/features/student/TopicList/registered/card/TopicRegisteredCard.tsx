import { Badge, Card, CardHeader, CardTitle } from '@/components/ui'
import { Eye } from 'lucide-react'
import { useState } from 'react'
import { useDeleteRegistrationMutation } from '../../../../../services/registrationApi'
import { useNavigate } from 'react-router-dom'

import { topicStatusLabels, type Topic } from '@/models'
import { stripHtml } from '@/utils/lower-case-html'

export const TopicRegisteredCard: React.FC<{
	topic: Topic
}> = ({ topic }) => {
	//const [deleteRegistration, { isLoading: isCanceling }] = useDeleteRegistrationMutation()
	const isFullSlot = topic.maxStudents === topic.studentsNum
	//const [confirmOpen, setConfirmOpen] = useState(false)
	const navigate = useNavigate()
	const [openDetail, setOpenDetail] = useState(false)
	const getStatusBadge = (topic: Topic) => {
		return (
			<div className='flex flex-col items-end justify-center gap-2'>
				{/* Trạng thái của đề tài */}
				<Badge className={`${topicStatusLabels[topic.currentStatus as keyof typeof topicStatusLabels].css}`}>
					{'Trạng thái:  '}
					{topicStatusLabels[topic.currentStatus as keyof typeof topicStatusLabels].name}
				</Badge>
				{isFullSlot ? (
					<Badge variant='destructive'>Đã đủ</Badge>
				) : (
					<Badge variant='default' className='max-w-[100px]'>
						{topic.maxStudents - topic.studentsNum} chỗ trống
					</Badge>
				)}
				<p className='text-sm font-semibold text-gray-500'>
					{'Đăng ký lúc: '}
					{new Date(topic.createdAt).toLocaleString('vi-VN')}
				</p>
			</div>
		)
	}

	const renderDepartmentAndLecturers = (topic: Topic) => {
		return (
			<>
				<div className='mt-1'>
					<div className='text-md flex items-end gap-1 text-gray-600'>
						{topic.lecturers.slice(0, 1).map((lec) => {
							return (
								<div className='flex flex-row gap-1' key={lec._id}>
									<span>{`${lec.title} ${lec.fullName}`}</span>
									{/* Render hình ảnh của giảng viên */}
									<div
										title={`${lec.title} ${lec.fullName}`}
										className='relative flex items-center justify-center overflow-hidden rounded-full bg-gray-200 text-lg font-semibold text-gray-600'
									>
										{lec.avatarUrl ? (
											<img
												src={lec.avatarUrl}
												alt={`${lec.title} ${lec.fullName}`}
												className='h-full w-full object-contain'
											/>
										) : (
											<span className='flex h-6 w-6 items-center justify-center text-[10px]'>
												{lec.fullName
													.split(' ')
													.map((n) => n[0])
													.join('')}
											</span>
										)}
									</div>
								</div>
							)
						})}
						{topic.lecturers.length > 1 && (
							<div className='flex items-center gap-1'>
								<span className='gap-1 text-sm text-muted-foreground'>
									và {topic.lecturers.length - 1} giảng viên khác
								</span>
								{topic.lecturers.slice(1, topic.lecturers.length).map((lec) => (
									// Render các hình ảnh của giảng viên khác
									<div
										title={`${lec.title} ${lec.fullName}`}
										className='relative flex w-fit items-center justify-center overflow-hidden rounded-full bg-gray-200 text-lg font-semibold text-gray-600'
									>
										{lec.avatarUrl ? (
											<img
												src={lec.avatarUrl}
												alt={`${lec.title} ${lec.fullName}`}
												className='h-full w-full object-contain'
											/>
										) : (
											<span className='flex h-6 w-6 items-center justify-center text-[10px]'>
												{lec.fullName
													.split(' ')
													.map((n) => n[0])
													.join('')}
											</span>
										)}
									</div>
								))}
							</div>
						)}
					</div>
				</div>
			</>
		)
	}
	return (
		<Card key={topic._id} className={`relative p-2 transition-shadow hover:cursor-pointer hover:shadow-lg`}>
			<CardHeader onClick={() => setOpenDetail(!openDetail)}>
				<div className='flex items-start justify-between space-x-4'>
					<div className='flex flex-col gap-2'>
						<CardTitle className='text-lg leading-tight'>{topic.titleVN}</CardTitle>
						<CardTitle className='text-md font-normal'>{topic.titleEng}</CardTitle>

						{renderDepartmentAndLecturers(topic)}
						<div className='flex gap-2'>
							{/* Lĩnh vực */}
							{topic.fields.map((f) => {
								return (
									<Badge key={f._id} variant='blue'>
										{f.name}
									</Badge>
								)
							})}
						</div>
						<div className='flex flex-wrap gap-1'>
							{topic.requirements.slice(0, 4).map((req) => (
								<Badge key={req._id} variant='secondary' className='text-xs'>
									{req.name}
								</Badge>
							))}
							{topic.requirements.length > 4 && (
								<Badge variant='outline' className='text-xs'>
									+{topic.requirements.length - 4}
								</Badge>
							)}
						</div>
					</div>

					{getStatusBadge(topic)}
				</div>

				<div className='flex items-center justify-center'>
					<div
						className='flex items-center justify-center gap-2 rounded-sm p-0.5 px-2 hover:bg-gray-100'
						onClick={() => navigate(`/detail-topic/${topic._id}`)}
					>
						<Eye className='h-4 w-4' />
						<span className='text-[13px] font-semibold text-gray-600'>Xem chi tiết</span>
					</div>
				</div>
			</CardHeader>
		</Card>
	)
}
