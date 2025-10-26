import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Calendar, ChevronDown, ChevronUp, Loader2, Send, Users } from 'lucide-react'
import { useState } from 'react'
import type { CanceledRegisteredTopic, Topic } from 'models'
import { useNavigate } from 'react-router-dom'

export const CancelRegisteredCard: React.FC<{
	topic: CanceledRegisteredTopic
}> = ({ topic }) => {
	const isFullSlot = topic.maxStudents === topic.studentNames.length
	const navigate = useNavigate()
	const [openDetail, setOpenDetail] = useState(false)
	const getStatusBadge = (topic: CanceledRegisteredTopic) => {
		return (
			<>
				<div className='flex gap-2'>
					{isFullSlot ? (
						<Badge variant='destructive'>
							<p className='text-sm'>Đã đủ</p>
						</Badge>
					) : (
						<Badge variant='default'>
							<p className='text-sm'>{topic.maxStudents - topic.studentNames.length} chỗ trống</p>
						</Badge>
					)}
					{topic.isRegistered && (
						<Badge variant='registered'>
							<p className='text-sm'>Đã đăng ký</p>
						</Badge>
					)}

					<Badge variant='destructive' className='h-fit'>
						<p className='text-sm'>Đã hủy</p>
					</Badge>
				</div>
				<p className='font-semibold text-gray-500'>
					{'Hủy lúc: '}
					{new Date(topic.lastestCanceledRegisteredAt).toLocaleString('vi-VN')}
				</p>
			</>
		)
	}
	// const renderDialogActions = () => {
	// 	return (
	// 		<div className='flex flex-1 justify-end gap-2'>
	// 			{!isFullSlot && !topic.isRegistered && (
	// 				<Button disabled={isDisabled} variant='re_register' onClick={() => setConfirmOpen(true)}>
	// 					{topic.isRegistered ? (
	// 						<Loader2 className='mr-2 h-4 w-4 animate-spin' />
	// 					) : (
	// 						<span>Đăng ký lại</span>
	// 					)}
	// 				</Button>
	// 			)}
	// 		</div>
	// 	)
	// }
	const renderDepartmentAndLecturers = (topic: Topic) => {
		return (
			<CardDescription className='mt-1'>
				{topic.lecturerNames.length > 0 ? topic.lecturerNames.join(', ') : 'Chưa có giảng viên phụ trách'} •{' '}
				{topic.major}
			</CardDescription>
		)
	}

	return (
		<Card key={topic._id} className={`border transition-shadow hover:cursor-pointer hover:shadow-lg`}>
			<CardHeader onClick={() => setOpenDetail(!openDetail)}>
				<div className='flex items-start justify-between space-x-4'>
					<div className='flex-1'>
						<CardTitle className='text-lg leading-tight'>{topic.title}</CardTitle>
						{renderDepartmentAndLecturers(topic)}
					</div>
					<div>
						<Button
							variant='outline'
							className='max-w-[100px]'
							onClick={() => navigate(`/detail-topic/${topic._id}`)}
						>
							<p className='text-sm'>Xem chi tiết đề tài</p>
						</Button>
					</div>
					<div className='flex-2 flex flex-col items-end gap-1'>{getStatusBadge(topic)}</div>
				</div>
				<div className='flex items-center gap-1 text-sm text-muted-foreground'>
					<Badge variant='outline' className='h-fit'>
						<Calendar className='mr-1 h-4 w-4' />
						<p className='text-sm'>Hạn đăng ký:</p>
					</Badge>
					<Badge variant='outline' className='h-fit'>
						<p className='text-sm'>{new Date(topic.deadline).toLocaleString('vi-VN')}</p>
					</Badge>
				</div>
				<div className='justify-items-center'>
					<div className='p-0.5 px-5 hover:bg-muted' onClick={() => setOpenDetail(!openDetail)}>
						{openDetail ? <ChevronUp className='h-4 w-4' /> : <ChevronDown className='h-4 w-4' />}
					</div>
				</div>
			</CardHeader>

			{openDetail && (
				<CardContent className={`space-y-4`}>
					<CardDescription className='mt-1 flex gap-1'>
						{topic.fieldNames.map((f) => {
							return (
								<Badge key={f} variant='blue'>
									{f}
								</Badge>
							)
						})}
					</CardDescription>
					<p className='line-clamp-3 text-sm text-muted-foreground'>{topic.description}</p>
					<div className='space-y-2'>
						<div className='flex items-center gap-4 text-sm text-muted-foreground'>
							<div className='flex items-center gap-1'>
								<Users className='h-4 w-4' />
								{topic.studentNames.length}/{topic.maxStudents}
							</div>
						</div>
					</div>

					<div className='flex flex-wrap gap-1'>
						{topic.requirementNames.slice(0, 4).map((req: string) => (
							<Badge key={req} variant='secondary' className='text-xs'>
								{req}
							</Badge>
						))}
						{topic.requirementNames.length > 4 && (
							<Badge variant='outline' className='text-xs'>
								+{topic.requirementNames.length - 4}
							</Badge>
						)}
					</div>
				</CardContent>
			)}
		</Card>
	)
}
