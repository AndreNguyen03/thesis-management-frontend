import { useState } from 'react'
import { Button, Badge, Card } from '@/components/ui'
import { AlertCircle, ChevronLeft, ChevronRight, CheckCircle, XCircle, Loader2 } from 'lucide-react'
import type { Phase1Response } from '@/models/period-phase.models'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import DOMPurify from 'dompurify'
import { topicStatusLabels } from '@/models'
import { useFacuBoardApproveTopicMutation, useFacuBoardRejectTopicMutation } from '@/services/topicApi'
import { toast } from 'sonner'

interface SubmissionPhaseResolveModalProps {
	open: boolean
	onClose: () => void
	data: Phase1Response
	onComplete: () => void
	phaseId?: string
}

type StepType = 'notTimeout' | 'pendingTopics' | 'lecturerMissing'

export function SubmissionPhaseResolveModal({
	open,
	onClose,
	data,
	onComplete,
	phaseId
}: SubmissionPhaseResolveModalProps) {
	const [currentStep, setCurrentStep] = useState<StepType>('notTimeout')
	const [approveTopic, { isLoading: isLoadingApprove }] = useFacuBoardApproveTopicMutation()
	const [rejectTopic, { isLoading: isLoadingReject }] = useFacuBoardRejectTopicMutation()

	const steps: StepType[] = ['notTimeout', 'pendingTopics', 'lecturerMissing']
	const currentStepIndex = steps.indexOf(currentStep)
	const stepConfig = {
		notTimeout: {
			title: 'Pha chưa kết thúc',
			description: 'Pha Nộp đề tài chưa đến thời gian kết thúc, không thể hoàn thành pha',
			color: 'text-red-600',
			data: undefined,
			bgColor: 'bg-red-50',
			borderColor: 'border-red-200',
			icon: AlertCircle,
			isTimeout: false
		},
		pendingTopics: {
			title: 'Các đề tài chưa xét duyệt',
			icon: AlertCircle,
			color: 'text-red-600',
			bgColor: 'bg-red-50',
			borderColor: 'border-red-200',
			data: data.pendingTopics || [],
			description: 'Danh sách các đề tài chưa được xét duyệt'
		},
		lecturerMissing: {
			title: 'Giảng viên chưa nộp đủ đề tài',
			icon: AlertCircle,
			color: 'text-red-600',
			bgColor: 'bg-red-50',
			borderColor: 'border-red-200',
			data: data.missingTopics || [],
			description: 'Danh sách giảng viên chưa đạt số lượng đề tài tối thiểu yêu cầu'
		}
	}

	const currentConfig = stepConfig[currentStep]
	const Icon = currentConfig.icon

	const handleNext = () => {
		if (currentStepIndex < steps.length - 1) {
			setCurrentStep(steps[currentStepIndex + 1])
		}
	}

	const handlePrevious = () => {
		if (currentStepIndex > 0) {
			setCurrentStep(steps[currentStepIndex - 1])
		}
	}

	const handleComplete = () => {
		onComplete()
		onClose()
	}

	const handleApprove = async (topicId: string) => {
		if (!phaseId) {
			toast.error('Không tìm thấy thông tin phase')
			return
		}
		try {
			await approveTopic({ topicId, phaseId, periodId: data.periodId }).unwrap()
			toast.success('Duyệt đề tài thành công', { richColors: true })
		} catch (err) {
			toast.error('Duyệt đề tài thất bại', { richColors: true })
			console.error(err)
		}
	}

	const handleReject = async (topicId: string) => {
		if (!phaseId) {
			toast.error('Không tìm thấy thông tin phase')
			return
		}
		try {
			await rejectTopic({ topicId, phaseId, periodId: data.periodId }).unwrap()
			toast.success('Từ chối đề tài thành công', { richColors: true })
		} catch (err) {
			toast.error('Từ chối đề tài thất bại', { richColors: true })
			console.error(err)
		}
	}
	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-h-[85vh] max-w-3xl overflow-hidden'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-xl'>
						<Icon className={`h-6 w-6 ${currentConfig.color}`} />
						{currentConfig.title}
					</DialogTitle>
					<p className='text-sm text-gray-500'>{currentConfig.description}</p>
				</DialogHeader>

				{/* Progress indicator */}
				<div className='flex items-center justify-center gap-2'>
					{steps.map((step, index) => (
						<div
							key={step}
							className={`h-2 w-16 rounded-full transition-all ${
								index === currentStepIndex ? 'bg-primary' : 'bg-gray-200'
							}`}
						/>
					))}
				</div>

				{/* Content */}
				<div className='max-h-[400px] space-y-3 overflow-y-auto'>
					{currentConfig.data?.length === 0 ? (
						<Card
							className={`border p-8 text-center ${currentConfig.borderColor} ${currentConfig.bgColor}`}
						>
							<Icon className={`mx-auto mb-2 h-12 w-12 ${currentConfig.color} opacity-50`} />
							<p className='text-gray-600'>Không có đề tài nào trong danh sách này</p>
						</Card>
					) : (
						<>
							<div className='mb-2 flex items-center justify-between'>
								<Badge variant='secondary' className='text-sm'>
									Tổng số: {currentConfig.data?.length}{' '}
									{currentStep === 'pendingTopics' ? 'đề tài' : 'giảng viên'}
								</Badge>
							</div>
							{currentStep === 'pendingTopics'
								? // Render pending topics
									currentConfig.data?.map((topic: any, index: number) => (
										<Card
											key={topic._id}
											className={`border p-4 transition-all hover:shadow-md ${currentConfig.borderColor}`}
										>
											<div className='flex items-start gap-3'>
												<div
													className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${currentConfig.bgColor}`}
												>
													<span className={`text-sm font-semibold ${currentConfig.color}`}>
														{index + 1}
													</span>
												</div>
												<div className='flex-1 space-y-2'>
													<div className='flex items-center justify-between'>
														<h4 className='font-medium text-gray-900'>{topic.titleVN}</h4>
														<Badge variant='outline' className='text-xs'>
															{
																topicStatusLabels[
																	topic.currentStatus as keyof typeof topicStatusLabels
																].name
															}
														</Badge>
													</div>
													<p className='text-sm text-gray-500'>{topic.titleEng}</p>
													{topic.description && (
														<div
															className='prose max-w-none rounded-lg bg-gray-50 p-4 text-sm text-gray-700'
															// Sử dụng DOMPurify để đảm bảo an toàn, tránh XSS
															dangerouslySetInnerHTML={{
																__html: DOMPurify.sanitize(
																	topic.description || '<p>Chưa có mô tả</p>'
																)
															}}
														/>
													)}
													{topic.currentStatus === 'submitted' && (
														<div className='mt-3 flex gap-2'>
															<Button
																size='sm'
																variant='outline'
																disabled={isLoadingApprove}
																className='gap-1 border-green-500 text-green-600 hover:bg-green-50'
																onClick={() => handleApprove(topic._id)}
															>
																{isLoadingApprove ? (
																	<Loader2 className='h-4 w-4 animate-spin' />
																) : (
																	<CheckCircle className='h-4 w-4' />
																)}
																Duyệt
															</Button>
															<Button
																size='sm'
																variant='outline'
																disabled={isLoadingReject}
																className='gap-1 border-red-500 text-red-600 hover:bg-red-50'
																onClick={() => handleReject(topic._id)}
															>
																{isLoadingReject ? (
																	<Loader2 className='h-4 w-4 animate-spin' />
																) : (
																	<XCircle className='h-4 w-4' />
																)}
																Từ chối
															</Button>
														</div>
													)}
												</div>
											</div>
										</Card>
									))
								: // Render missing lecturers
									currentConfig.data?.map((lecturer: any, index: number) => (
										<Card
											key={lecturer.userId}
											className={`border p-4 transition-all hover:shadow-md ${currentConfig.borderColor}`}
										>
											<div className='flex items-start gap-3'>
												<div
													className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full ${currentConfig.bgColor}`}
												>
													<span className={`text-sm font-semibold ${currentConfig.color}`}>
														{index + 1}
													</span>
												</div>
												<div className='flex-1 space-y-2'>
													<div className='flex items-center justify-between'>
														<h4 className='font-medium text-gray-900'>
															{lecturer.lecturerName}
														</h4>
														<Badge variant='destructive'>
															Thiếu {lecturer.missingTopicsCount} đề tài
														</Badge>
													</div>
													<p className='text-sm text-gray-500'>{lecturer.lecturerEmail}</p>
													<div className='flex gap-4 text-xs text-gray-600'>
														<span>
															Yêu cầu: <strong>{lecturer.minTopicsRequired}</strong> đề
															tài
														</span>
														<span>
															Đã duyệt: <strong>{lecturer.approvalTopicsCount}</strong> đề
															tài
														</span>
													</div>
												</div>
											</div>
										</Card>
									))}
						</>
					)}
				</div>

				<DialogFooter className='flex items-center justify-between sm:justify-between'>
					<div className='flex gap-2'>
						<Button
							variant='outline'
							onClick={handlePrevious}
							disabled={currentStepIndex === 0}
							className='gap-1'
						>
							<ChevronLeft className='h-4 w-4' />
							Trước
						</Button>
						<Button
							variant='outline'
							onClick={handleNext}
							disabled={currentStepIndex === steps.length - 1}
							className='gap-1'
						>
							Sau
							<ChevronRight className='h-4 w-4' />
						</Button>
						{currentStep === 'pendingTopics' && data.pendingTopics.length > 0 && (
							<Badge variant='destructive' className='text-sm'>
								Lưu ý: Các đề tài chưa xét duyệt cần được xử lý
							</Badge>
						)}
						{currentStep === 'lecturerMissing' && data.missingTopics.length > 0 && (
							<Badge variant='destructive' className='text-sm'>
								Lưu ý: Cần đủ giảng viên nộp đủ đề tài mới có thể chuyển sang pha tiếp theo
							</Badge>
						)}
					</div>
					<div className='flex gap-2'>
						<Button variant='outline' onClick={onClose}>
							Đóng
						</Button>
						{
							<Button
								onClick={handleComplete}
								disabled={!data.canTriggerNextPhase}
								className='bg-green-600 hover:bg-green-700'
							>
								Hoàn thành pha
							</Button>
						}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
