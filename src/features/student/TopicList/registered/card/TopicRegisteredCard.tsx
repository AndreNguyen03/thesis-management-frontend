import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Dialog } from '@/components/ui/Dialog'
import { ChevronDown, ChevronUp, Eye, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import { useDeleteRegistrationMutation } from '../../../../../services/registrationApi'
import { ConfirmCancelRegistration } from '../ConfirmCancelRegistration'
import { useNavigate } from 'react-router-dom'

import { topicStatusLabels, type Topic } from '@/models'
import { toast } from '@/hooks/use-toast'
import DOMPurify from 'dompurify'
import { stripHtml } from '@/utils/lower-case-html'

export const TopicRegisteredCard: React.FC<{
	topic: Topic
}> = ({ topic }) => {
	const [deleteRegistration, { isLoading: isCanceling }] = useDeleteRegistrationMutation()
	const isFullSlot = topic.maxStudents === topic.studentsNum
	const [confirmOpen, setConfirmOpen] = useState(false)
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

	const handleUnRegister = async () => {
		await deleteRegistration({ topicId: topic._id })
		setConfirmOpen(false)

		navigate('/topics/registered/canceled')

		toast({
			title: 'Thành công',
			description: 'Hủy đăng ký đề tài thành công'
		})
	}

	const renderDialogActions = () => {
		return (
			<div className='flex flex-1 justify-end gap-2'>
				<Button variant='delete' onClick={() => setConfirmOpen(true)}>
					<>
						<Trash2 className='mr-2 h-4 w-4' />
						Hủy đăng ký
					</>
				</Button>
			</div>
		)
	}
	const renderDepartmentAndLecturers = (topic: Topic) => {
		return (
			<>
				<div className='mt-1'>
					<div>
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
							<span className='text-sm text-muted-foreground'>
								và {topic.lecturers.length - 1} giảng viên khác
								{topic.lecturers.slice(2, topic.lecturers.length).map((lec) => (
									// Render các hình ảnh của giảng viên khác
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
								))}
							</span>
						)}
					</div>
				</div>
			</>
		)
	}
	//Xử lý render description
	const plainTextDescription = stripHtml(topic.description || '')

	//
	return (
		<Card key={topic._id} className={`relative p-2 transition-shadow hover:cursor-pointer hover:shadow-lg`}>
			<CardHeader onClick={() => setOpenDetail(!openDetail)}>
				<div className='flex items-start justify-between space-x-4'>
					<div className='flex flex-col gap-1'>
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
					<div className='p-0.5 px-5 hover:bg-muted' onClick={() => setOpenDetail(!openDetail)}>
						{openDetail ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
					</div>
					<div
						className='flex items-center justify-center gap-2 rounded-sm p-0.5 px-2 hover:bg-gray-100'
						onClick={() => navigate(`/detail-topic/${topic._id}`)}
					>
						<Eye className='h-4 w-4' />
						<span className='text-[13px] font-semibold text-gray-600'>Xem chi tiết</span>
					</div>
				</div>
			</CardHeader>

			{openDetail && (
				<CardContent className={`absolute space-y-4`} onBlur={() => setOpenDetail(false)}>
					<div className='prose line-clamp-5 max-w-none truncate text-wrap rounded-lg bg-gray-50 p-4 text-[13px] text-gray-700'>
						{plainTextDescription}
					</div>

					<div className='flex gap-2'>{renderDialogActions()}</div>
					{/* dialog xác nhận */}
					<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<ConfirmCancelRegistration
							isCanceling={isCanceling}
							onUnRegister={() => handleUnRegister()}
							onClose={() => setConfirmOpen(false)}
						/>
					</Dialog>
				</CardContent>
			)}
		</Card>
	)
}
