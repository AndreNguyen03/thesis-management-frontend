import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Calendar, ChevronDown, ChevronUp, Eye, Loader2, Send, Star, Trash2, Users } from 'lucide-react'
import { useState } from 'react'
import type { Topic } from '@/models'
import { useDeleteRegistrationMutation } from '@/services/registrationApi'
import { ConfirmCancelRegistration } from '../ConfirmCancelRegistration'
import { useNavigate } from 'react-router-dom'
import { toast } from '@/hooks/use-toast'

export const TopicRegisteredCard: React.FC<{
	topic: Topic
}> = ({ topic }) => {
	const [deleteRegistration, { isLoading: isCanceling }] = useDeleteRegistrationMutation()
	const isFullSlot = topic.maxStudents === topic.studentNames.length
	const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
	const [confirmOpen, setConfirmOpen] = useState(false)
	const navigate = useNavigate()
	const [openDetail, setOpenDetail] = useState(false)
	const getStatusBadge = (topic: Topic) => {
		return (
			<div className='flex flex-col items-end justify-center gap-2'>
				{isFullSlot ? (
					<Badge variant='destructive'>Đã đủ</Badge>
				) : (
					<Badge variant='default' className='max-w-[100px]'>
						{topic.maxStudents - topic.studentNames.length} chỗ trống
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
			<CardDescription className='mt-1'>
				{topic.lecturerNames.length > 0
					? topic.lecturerNames
							.map((lec) => {
								return lec
							})
							.join(', ')
					: 'Chưa có giảng viên'}
				• {topic.major}
			</CardDescription>
		)
	}

	return (
		<Card key={topic._id} className={`transition-shadow hover:cursor-pointer hover:shadow-lg`}>
			<CardHeader onClick={() => setOpenDetail(!openDetail)}>
				<div className='flex items-start justify-between space-x-4'>
					<div>
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
					{getStatusBadge(topic)}
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

					<div className='flex gap-2'>
						{/* dialog xác nhận */}
						<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
							<ConfirmCancelRegistration
								isCanceling={isCanceling}
								onUnRegister={() => handleUnRegister()}
								onClose={() => setConfirmOpen(false)}
							/>
						</Dialog>
						{renderDialogActions()}
					</div>
				</CardContent>
			)}
		</Card>
	)
}
