import { useState } from 'react'
import { Button, Badge, Card } from '@/components/ui'
import { ChevronLeft, ChevronRight, FileText, CheckCircle } from 'lucide-react'
import type { Phase2Response } from '@/models/period-phase.models'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'

interface OpenRegistrationPhaseResolveModalProps {
	open: boolean
	onClose: () => void
	data: Phase2Response
	onComplete: () => void
}

type StepType = 'draft' | 'executing'

export function OpenRegistrationPhaseResolveModal({
	open,
	onClose,
	data,
	onComplete
}: OpenRegistrationPhaseResolveModalProps) {
	const [currentStep, setCurrentStep] = useState<StepType>('draft')

	const steps: StepType[] = ['draft', 'executing']
	const currentStepIndex = steps.indexOf(currentStep)

	const stepConfig = {
		draft: {
			title: 'Đề tài ở trạng thái nháp',
			icon: FileText,
			color: 'text-yellow-600',
			bgColor: 'bg-yellow-50',
			borderColor: 'border-yellow-200',
			data: data.resolveTopics.draft || [],
			description: 'Các đề tài vẫn đang ở trạng thái nháp cần được xử lý'
		},
		executing: {
			title: 'Đề tài đã chuyển sang thực hiện',
			icon: CheckCircle,
			color: 'text-green-600',
			bgColor: 'bg-green-50',
			borderColor: 'border-green-200',
			data: data.resolveTopics.executing || [],
			description: 'Các đề tài đã chuyển sang trạng thái thực hiện'
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
							</div>
							{currentConfig.data.map((topic: any, index: number) => (
								<Card
									key={topic.topicId}
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
											<h4 className='font-medium text-gray-900'>{topic.title}</h4>
											<p className='text-xs text-gray-500'>ID: {topic.topicId}</p>
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
						{currentStep === 'draft' && data.resolveTopics.draft.length > 0 && (
							<Badge variant='destructive' className='text-sm'>
								Lưu ý: Đề tài ở trạng thái nháp cần được xử lý trước khi chuyển pha
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
