import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/Dialog'
import { Bookmark, Calendar, Eye, Loader2, Send, Star, Users } from 'lucide-react'
import { useState } from 'react'
import { ConfirmRegistration } from './ConfirmRegistration'
import type { Topic } from 'models'
import { useCreateRegistrationMutation } from '../../../services/registrationApi'
import { notifyError, notifySuccess } from '@/components/ui/Toast'
import { getErrorMessage } from '@/utils/catch-error'
import { useNavigate } from 'react-router-dom'
import { useLazyGetTopicByIdQuery, useSaveTopicMutation, useUnsaveTopicMutation } from '../../../services/topicApi'
import { current } from '@reduxjs/toolkit'
type TopicCardMode = 'all' | 'saved'

export const TopicCard: React.FC<{
	topic: Topic
	mode?: TopicCardMode
	updateAfterAction?: (topic: Topic) => void
}> = ({ topic, mode = 'all', updateAfterAction }) => {
	const isFullSlot = topic.status == 'full'
	const isDisabled = isFullSlot
	const [confirmOpen, setConfirmOpen] = useState(false)
	const [currentTopic, setCurrentTopic] = useState<Topic>(topic)
	const navigate = useNavigate()
	const [fetchTopicById] = useLazyGetTopicByIdQuery()
	const [createRegistration, { isLoading: isRegistering, isError: isRegisterError, isSuccess: isRegisterSuccess }] =
		useCreateRegistrationMutation()
	const [saveTopic, { isLoading: isSaving, isSuccess: isSuccessSave, isError: isSaveError }] = useSaveTopicMutation()
	const [unsaveTopic, { isLoading: isUnsaving, isSuccess: isSuccessUnsave, isError: isUnsaveError }] =
		useUnsaveTopicMutation()

	const getStatusBadge = () => {
		return (
			<div className='flex min-w-[80px] flex-col gap-1'>
				{isFullSlot ? (
					<Badge variant='destructive'>Đã đủ</Badge>
				) : (
					<Badge variant='default'>
						{currentTopic.maxStudents - currentTopic.studentNames.length} chỗ trống
					</Badge>
				)}
				{currentTopic.isRegistered && <Badge variant='registered'>Đã đăng ký</Badge>}
			</div>
		)
	}
	const reloadTopic = async () => {
		const topicData = await fetchTopicById({ id: currentTopic._id }).unwrap()
		setCurrentTopic(topicData)
		await new Promise((resolve) => setTimeout(resolve, 200))
		updateAfterAction?.(topicData)
	}
	const handleRegister = async () => {
		await new Promise((resolve) => setTimeout(resolve, 500))
		try {
			await createRegistration({ topicId: currentTopic._id }).unwrap()
			notifySuccess('Đăng ký đề tài thành công!')
			setConfirmOpen(false)
			await new Promise((resolve) => setTimeout(resolve, 100))
			reloadTopic()
		} catch (err) {
			setConfirmOpen(false)
			const errorMessage = getErrorMessage(err)
			notifyError(errorMessage)
		}
	}
	const handleToggleSave = async () => {
		if (isSaving || isUnsaving) return
		if (currentTopic.isSaved) {
			console.log('Unsave topic with ID:', currentTopic._id)
			await unsaveTopic({ topicId: currentTopic._id })
			reloadTopic()
		} else {
			await saveTopic({ topicId: currentTopic._id })
			reloadTopic()
		}
	}
	const renderDialogActions = () => {
		switch (mode) {
			case 'saved':
				return (
					<div className='flex-2 flex justify-end gap-2'>
						<div
							onClick={() => handleToggleSave()}
							className='flex items-center justify-center rounded-full pl-1 pr-1 hover:cursor-pointer hover:bg-slate-100'
						>
							<Bookmark
								className={`h-6 w-6 border-gray-200 ${currentTopic.isSaved ? 'fill-yellow-400' : 'text-muted-foreground'}`}
							/>
						</div>
					</div>
				)
			default:
				return (
					<div className='flex flex-1 justify-end gap-2'>
						<>
							{!currentTopic.isRegistered && (
								<Button
									disabled={isDisabled}
									variant={isRegisterSuccess ? 'success' : 'delete'}
									onClick={() => setConfirmOpen(true)}
								>
									{isRegistering ? (
										<>
											<Loader2 className='mr-2 h-8 w-8 animate-spin' />
											Đang đăng kí...
										</>
									) : isRegisterSuccess ? (
										'Đã đăng ký'
									) : (
										<>
											<Send className='mr-2 h-4 w-4' />
											Đăng ký
										</>
									)}
								</Button>
							)}
							<div
								onClick={() => handleToggleSave()}
								className='flex items-center justify-center rounded-full pl-1 pr-1 hover:cursor-pointer hover:bg-slate-100'
							>
								<Bookmark
									className={`h-6 w-6 border-gray-200 ${currentTopic.isSaved ? 'fill-yellow-400' : 'text-muted-foreground'}`}
								/>
							</div>
						</>
					</div>
				)
		}
	}
	return (
		<Card key={topic._id} className='transition-shadow hover:shadow-lg'>
			<CardHeader>
				<div className='flex items-start justify-between space-x-4'>
					<div>
						<CardTitle className='text-lg leading-tight'>{currentTopic.title}</CardTitle>
						<CardDescription className='mt-1'>
							{currentTopic.lecturerNames.length > 0
								? currentTopic.lecturerNames.join(', ')
								: 'Chưa có giảng viên'}{' '}
							• {currentTopic.major}
						</CardDescription>
						<CardDescription className='mt-1 flex gap-1'>
							{currentTopic.fieldNames.map((f) => {
								return (
									<Badge key={f} variant='blue'>
										{f}
									</Badge>
								)
							})}
						</CardDescription>
					</div>
					{getStatusBadge()}
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				<p className='line-clamp-3 text-sm text-muted-foreground'>{currentTopic.description}</p>
				<div className='space-y-2'>
					<div className='flex items-center gap-4 text-sm text-muted-foreground'>
						<div className='flex items-center gap-1'>
							<Users className='h-4 w-4' />
							{currentTopic.studentNames.length}/{currentTopic.maxStudents}
						</div>
					</div>

					<div className='flex items-center gap-1 text-sm text-muted-foreground'>
						<Badge variant='outline' className='h-fit'>
							<Calendar className='mr-1 h-4 w-4' />
							<p className='text-sm'>Hạn đăng ký:</p>
						</Badge>
						<Badge variant='outline' className='h-fit'>
							<p className='text-sm'>{new Date(currentTopic.deadline).toLocaleString()}</p>
						</Badge>
					</div>
				</div>

				<div className='flex flex-wrap gap-1'>
					{currentTopic.requirementNames.slice(0, 4).map((req: string) => (
						<Badge key={req} variant='secondary' className='text-xs'>
							{req}
						</Badge>
					))}
					{currentTopic.requirementNames.length > 4 && (
						<Badge variant='outline' className='text-xs'>
							+{currentTopic.requirementNames.length - 4}
						</Badge>
					)}
				</div>

				<div className='flex flex-col gap-2 sm:flex-row'>
					<Button onClick={() => navigate(topic._id)} className='flex-1' variant='outline' size='sm'>
						<Eye className='mr-2 h-4 w-4' />
						Chi tiết
					</Button>
					{/* nút đăng ký nhanh */}
					{renderDialogActions()}
					{/* dialog xác nhận */}
					<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
						<ConfirmRegistration
							isRegistering={isRegistering}
							onRegister={() => handleRegister()}
							onClose={() => setConfirmOpen(false)}
						/>
					</Dialog>
				</div>
			</CardContent>
		</Card>
	)
}
