import {
	Avatar,
	Badge,
	Button,
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle
} from '@/components/ui'

import { Bookmark, Calendar, Eye, Loader2, Send, Star, Users } from 'lucide-react'
import { useState } from 'react'
import { ConfirmRegistration } from './ConfirmRegistration'
import { useCreateRegistrationMutation } from '../../../services/registrationApi'
import { getErrorMessage } from '@/utils/catch-error'
import { useNavigate } from 'react-router-dom'
import { useLazyGetTopicByIdQuery, useSaveTopicMutation, useUnsaveTopicMutation } from '../../../services/topicApi'

import { topicStatusLabels, type GetRequirementNameReponseDto, type Topic } from '@/models'
import { toast } from '@/hooks/use-toast'
import { Dialog } from '@radix-ui/react-dialog'
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
				<Badge variant='outline'>{currentTopic.type}</Badge>
				{currentTopic.isRegistered && <Badge variant='registered'>Đã đăng ký</Badge>}
			</div>
		)
	}
	const reloadTopic = async () => {
		const topicData = await fetchTopicById({ id: currentTopic._id }).unwrap()
		setCurrentTopic(topicData)
		updateAfterAction?.(topicData)
	}
	const handleRegister = async () => {
		await new Promise((resolve) => setTimeout(resolve, 500))
		try {
			await createRegistration({ topicId: currentTopic._id }).unwrap()
			toast({
				title: 'Thành công',
				description: 'Đăng ký đề tài thành công'
			})
			setConfirmOpen(false)
			await new Promise((resolve) => setTimeout(resolve, 100))
			reloadTopic()
		} catch (err) {
			setConfirmOpen(false)
			const errorMessage = getErrorMessage(err)
			toast({
				title: 'Lỗi',
				description: errorMessage,
				variant: 'destructive'
			})
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
		<Card key={topic._id} className='p-1 pb-0 transition-shadow hover:shadow-lg'>
			<CardHeader>
				<div className='flex items-start justify-between space-x-4'>
					<div>
						<CardTitle className='text-lg leading-tight'>{currentTopic.titleVN}</CardTitle>
						<CardTitle className='text-md font-normal'>{currentTopic.titleEng}</CardTitle>
						{/* Trạng thái của đề tài */}
						<Badge variant='status'>
							{'Trạng thái:  '}
							{topicStatusLabels[currentTopic.currentStatus as keyof typeof topicStatusLabels]}
						</Badge>
						<CardTitle className='text-md mt-2 font-semibold'>{currentTopic.major.name}</CardTitle>
						<CardDescription className='mt-1 space-y-2'>
							<div>
								{currentTopic.lecturers.slice(0, 1).map((lec) => {
									return (
										<div key={lec._id} className='flex flex-row gap-1'>
											<span>{`${lec.lecturerInfo.title} ${lec.fullName}`}</span>
											{/* Render hình ảnh của giảng viên */}
											<div
												title={`${lec.lecturerInfo.title} ${lec.fullName}`}
												className='relative flex items-center justify-center overflow-hidden rounded-full bg-gray-200 text-lg font-semibold text-gray-600'
											>
												{lec.avatarUrl ? (
													<img
														src={lec.avatarUrl}
														alt={`${lec.lecturerInfo.title} ${lec.fullName}`}
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
								{currentTopic.lecturers.length > 1 && (
									<span className='text-sm text-muted-foreground'>
										và {currentTopic.lecturers.length - 1} giảng viên khác
										{currentTopic.lecturers.slice(2, currentTopic.lecturers.length).map((lec) => (
											// Render các hình ảnh của giảng viên khác
											<div
												title={`${lec.lecturerInfo.title} ${lec.fullName}`}
												className='relative flex items-center justify-center overflow-hidden rounded-full bg-gray-200 text-lg font-semibold text-gray-600'
											>
												{lec.avatarUrl ? (
													<img
														src={lec.avatarUrl}
														alt={`${lec.lecturerInfo.title} ${lec.fullName}`}
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
							<div className='flex flex-row gap-2'>
								{currentTopic.fields.map((f) => {
									return (
										<Badge key={f.name} variant='blue'>
											{f.name}
										</Badge>
									)
								})}
							</div>
						</CardDescription>
					</div>
					{getStatusBadge()}
				</div>
			</CardHeader>
			<CardContent className='space-y-2'>
				<p className='line-clamp-3 text-sm text-muted-foreground'>{currentTopic.description}</p>
				<div className='space-y-2'>
					<div className='flex items-center gap-4 text-sm text-muted-foreground'>
						<div className='flex items-center gap-1'>
							<Users className='h-4 w-4' />
							{currentTopic.students.length}/{currentTopic.maxStudents}
						</div>
						{isFullSlot ? (
							<Badge variant='destructive'>Đã đủ</Badge>
						) : (
							<Badge variant='default'>
								{currentTopic.maxStudents - currentTopic.students.length} chỗ trống
							</Badge>
						)}
					</div>
				</div>
				<div className='space-y-1'>
					<h1 className='font-medium'>Yêu cầu</h1>
					<div className='flex flex-wrap gap-1'>
						{currentTopic.requirements.slice(0, 4).map((req: GetRequirementNameReponseDto) => (
							<Badge key={req._id} variant='secondary' className='text-xs'>
								{req.name}
							</Badge>
						))}
						{currentTopic.requirements.length > 4 && (
							<Badge variant='outline' className='text-xs'>
								+{currentTopic.requirements.length - 4}
							</Badge>
						)}
					</div>
				</div>

				<div className='flex flex-col gap-2 sm:flex-row'>
					<Button
						onClick={() => navigate(`/detail-topic/${currentTopic._id}`)}
						className='flex-1'
						variant='outline'
						size='sm'
					>
						<Eye className='mr-2 h-4 w-4' />
						Chi tiết
					</Button>
					{/* nút đăng ký nhanh */}
					{renderDialogActions()}
					{/* dialog xác nhận */}
				</div>
				<Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
					<ConfirmRegistration
						isRegistering={isRegistering}
						onRegister={() => handleRegister()}
						onClose={() => setConfirmOpen(false)}
					/>
				</Dialog>
			</CardContent>
			<CardFooter className='flex flex-row justify-between'>
				<span className='text-[12px] font-medium text-gray-500'>{`Được tạo bởi  ${currentTopic.createByInfo.fullName}`}</span>
				<span className='text-[12px] font-medium text-gray-500'>{`Cập nhật lúc ${new Date(currentTopic.createdAt).toLocaleString('vi-VN')}`}</span>
			</CardFooter>
		</Card>
	)
}
