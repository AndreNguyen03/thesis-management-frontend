import { useState } from 'react'
import { Button, Badge, Card } from '@/components/ui'
import { AlertCircle, ChevronLeft, ChevronRight, Clock, AlertTriangle, Loader2 } from 'lucide-react'
import type { Phase3Response } from '@/models/period-phase.models'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { useMarkPausedTopicMutation } from '@/services/topicApi'
import { toast } from 'sonner'

interface ExecutionPhaseResolveModalProps {
	open: boolean
	onClose: () => void
	data: Phase3Response
	onComplete: () => void
}

type StepType = 'overdue' | 'pausedDelayed' | 'pendingReview'

export function ExecutionPhaseResolveModal({ open, onClose, data, onComplete }: ExecutionPhaseResolveModalProps) {
	const [currentStep, setCurrentStep] = useState<StepType>('overdue')
	const [selectedTopics, setSelectedTopics] = useState<string[]>([])
	const [isMultiSelect, setIsMultiSelect] = useState<boolean>(false)
	const steps: StepType[] = ['overdue', 'pausedDelayed', 'pendingReview']
	const currentStepIndex = steps.indexOf(currentStep)
	//gọi endpoint đánh dấu đề tài tạm dừng
	const [markPausedTopic, { isLoading: isMarkingPaused }] = useMarkPausedTopicMutation()
	const stepConfig = {
		overdue: {
			title: 'Đề tài quá hạn',
			icon: AlertCircle,
			color: 'text-red-600',
			bgColor: 'bg-red-50',
			borderColor: 'border-red-200',
			data: data.overdueTopics || [],
			description: 'Các đề tài đã quá hạn thời gian thực hiện'
		},
		pausedDelayed: {
			title: 'Đề tài tạm dừng / Trì hoãn',
			icon: Clock,
			color: 'text-orange-600',
			bgColor: 'bg-orange-50',
			borderColor: 'border-orange-200',
			data: data.pausedOrDelayedTopics || [],
			description: 'Các đề tài đã bị tạm dừng hoặc trì hoãn'
		},
		pendingReview: {
			title: 'Chờ giảng viên đánh giá',
			icon: AlertTriangle,
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50',
			borderColor: 'border-yellow-200',
			data: data.pendingLecturerReview || [],
			description: 'Các đề tài đang chờ giảng viên đánh giá'
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
	const handleMarkPausedTopics = async () => {
		// Gọi API để đánh dấu các đề tài đã chọn là tạm dừng
		try {
			await markPausedTopic({ topicIds: selectedTopics, phaseId: data.periodId })
			toast.success('Đã đánh dấu đề tài là tạm dừng thành công', {
				richColors: true
			})
			setIsMultiSelect(false)
			setSelectedTopics([])
			// Sau khi thành công, có thể hiển thị thông báo hoặc cập nhật giao diện
		} catch (error) {
			toast.error('Đánh dấu đề tài thất bại', {
				richColors: true
			})
			console.log('error mark paused topics:', error)
		}
		// Sử dụng selectedTopics để lấy danh sách ID đề tài đã chọn
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
					{currentConfig.data.length === 0 ? (
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
									Tổng số: {currentConfig.data.length} đề tài
								</Badge>
								{currentStep === 'overdue' && (
									<>
										{!isMultiSelect ? (
											<Button
												variant='yellow'
												onClick={() => {
													setIsMultiSelect(true)
													setSelectedTopics(currentConfig.data.map((topic: any) => topic._id))
												}}
											>
												Chọn tất cả
											</Button>
										) : (
											<div className='flex gap-2'>
												<Button
													variant='red'
													onClick={() => {
														setIsMultiSelect(false)
														handleMarkPausedTopics()
													}}
													disabled={selectedTopics.length === 0 || isMarkingPaused}
												>
													{isMarkingPaused ? <Loader2 className='animate-spin' /> : null}
													Dừng làm ({selectedTopics.length})
												</Button>
												<Button
													variant='yellow'
													onClick={() => {
														setIsMultiSelect(false)
														setSelectedTopics([])
													}}
												>
													Bỏ chọn
												</Button>
											</div>
										)}
									</>
								)}
							</div>
							{currentConfig.data.map((topic: any, index: number) => (
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
										<div className='flex-1 space-y-1'>
											<h4 className='font-medium text-gray-900'>{topic.titleVN}</h4>
											<p className='text-sm text-gray-500'>{topic.titleEng}</p>
											{topic.lecturers && topic.lecturers.length > 0 && (
												<div className='flex flex-wrap gap-1'>
													{topic.lecturers.map((lec: any) => (
														<Badge key={lec._id} variant='outline' className='text-xs'>
															{lec.fullName}
														</Badge>
													))}
												</div>
											)}
											{topic.submittedAt && (
												<p className='text-xs text-gray-400'>
													Nộp lúc: {new Date(topic.submittedAt).toLocaleDateString('vi-VN')}
												</p>
											)}
											{topic.daysPending !== null && topic.daysPending !== undefined && (
												<Badge variant='destructive' className='text-xs'>
													Chờ {topic.daysPending} ngày
												</Badge>
											)}
										</div>
										{isMultiSelect && currentStep === 'overdue' && (
											<input
												type='checkbox'
												className='mt-2 h-5 w-5 accent-yellow-500'
												checked={selectedTopics.includes(topic._id)}
												onChange={(e) => {
													if (e.target.checked) {
														setSelectedTopics((prev) => [...prev, topic._id])
													} else {
														setSelectedTopics((prev) =>
															prev.filter((id) => id !== topic._id)
														)
													}
												}}
											/>
										)}
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
						{currentStep === 'overdue' && (
							<Badge variant='destructive' className='text-sm'>
								Lưu ý: Đề tài quá hạn cần được xử lý trước khi hoàn thành pha
							</Badge>
						)}
						{currentStep === 'pausedDelayed' && (
							<Badge variant='info' className='text-sm'>
								Chỉ xem:  đề tài tạm dừng/trì hoãn
							</Badge>
						)}
					</div>
					<div className='flex gap-2'>
						<Button variant='outline' onClick={onClose}>
							Đóng
						</Button>
						{data.canTriggerNextPhase && (
							<Button onClick={handleComplete} className='bg-green-600 hover:bg-green-700'>
								Hoàn thành pha
							</Button>
						)}
					</div>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
