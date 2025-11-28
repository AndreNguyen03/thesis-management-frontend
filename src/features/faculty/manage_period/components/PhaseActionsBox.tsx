import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger
} from '@/components/ui/alert-dialog'
import { phaseLabels, type PendingAction, type PeriodPhase } from '@/models/period-phase.models'
import { cn } from '@/lib/utils'
import {
	FileArchive,
	ArrowRight,
	Bell,
	FileText,
	CheckCircle2,
	Loader2,
	AlertTriangle,
	Info,
	AlertCircle
} from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { SendNotificationModal } from './SendNotificationModal'

interface PhaseActionsBoxProps {
	phase: PeriodPhase
	actions: PendingAction[]
	onActionComplete: (actionId: string) => void
}

const actionIcons = {
	move_to_draft: FileArchive,
	move_to_next_phase: ArrowRight,
	send_reminder: Bell,
	request_documents: FileText
}

const severityStyles = {
	info: {
		badge: 'bg-info/10 text-info border-info/20',
		icon: Info
	},
	warning: {
		badge: 'bg-warning/10 text-warning border-warning/20',
		icon: AlertTriangle
	},
	critical: {
		badge: 'bg-destructive/10 text-destructive border-destructive/20',
		icon: AlertCircle
	}
}

const actionButtonLabels = {
	move_to_draft: 'Chuyển Draft',
	move_to_next_phase: 'Chuyển pha tiếp',
	send_reminder: 'Gửi nhắc nhở',
	request_documents: 'Yêu cầu tài liệu'
}

export function PhaseActionsBox({ phase, actions, onActionComplete }: PhaseActionsBoxProps) {
	const [processingAction, setProcessingAction] = useState<string | null>(null)
	const [completedActions, setCompletedActions] = useState<Set<string>>(new Set())
	const [notificationModalOpen, setNotificationModalOpen] = useState(false)
	const [selectedNotificationAction, setSelectedNotificationAction] = useState<PendingAction | null>(null)

	const handleOpenNotificationModal = (action: PendingAction) => {
		setSelectedNotificationAction(action)
		setNotificationModalOpen(true)
	}

	const handleSendNotification = async () => {
		if (!selectedNotificationAction) return

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500))

		setCompletedActions((prev) => new Set([...prev, selectedNotificationAction.id]))
		onActionComplete(selectedNotificationAction.id)

		toast({
			title: 'Thành công!',
			description: `Đã gửi thông báo tới ${selectedNotificationAction.count} người`
		})
	}

	const handleConfirmAction = async (action: PendingAction) => {
		setProcessingAction(action.id)

		// Simulate API call
		await new Promise((resolve) => setTimeout(resolve, 1500))

		setProcessingAction(null)
		setCompletedActions((prev) => new Set([...prev, action.id]))
		onActionComplete(action.id)

		const messages = {
			move_to_draft: `Đã chuyển ${action.count} đề tài về Draft`,
			move_to_next_phase: `Đã chuyển ${action.count} đề tài sang pha tiếp theo`,
			send_reminder: `Đã gửi nhắc nhở tới ${action.count} người`,
			request_documents: `Đã gửi yêu cầu tài liệu tới ${action.count} sinh viên`
		}

		toast({
			title: 'Thành công!',
			description: messages[action.type]
		})
	}

	const activeActions = actions.filter((a) => !completedActions.has(a.id))
	const allCompleted = activeActions.length === 0 && actions.length > 0

	if (actions.length === 0) {
		return null
	}

	return (
		<Card className='animate-slide-up p-0 shadow-card'>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-lg font-semibold'>Xử lý tồn đọng</CardTitle>
						<CardDescription>Pha : {phaseLabels[phase.phase]}</CardDescription>
					</div>
					{allCompleted && (
						<Badge variant='outline' className='border-success/20 bg-success/10 text-success'>
							<CheckCircle2 className='mr-1 h-3 w-3' />
							Đã xử lý xong
						</Badge>
					)}
				</div>
			</CardHeader>

			<CardContent className='space-y-4'>
				{allCompleted ? (
					<div className='animate-scale-in flex flex-col items-center justify-center py-8 text-center'>
						<div className='mb-4 rounded-full bg-success/10 p-4'>
							<CheckCircle2 className='h-8 w-8 text-success' />
						</div>
						<p className='text-lg font-medium text-foreground'>Tất cả tồn đọng đã được xử lý</p>
						<p className='mt-1 text-sm text-muted-foreground'>Bạn có thể chuyển sang pha tiếp theo</p>
						<Button className='mt-4' variant='default'>
							<ArrowRight className='mr-2 h-4 w-4' />
							Chuyển pha tiếp theo
						</Button>
					</div>
				) : (
					activeActions.map((action) => {
						const ActionIcon = actionIcons[action.type]
						const SeverityIcon = severityStyles[action.severity].icon
						const isProcessing = processingAction === action.id
						const isDisabled = processingAction !== null && !isProcessing

						return (
							<div
								key={action.id}
								className={cn(
									'flex items-center justify-between rounded-lg border p-4 transition-all duration-200',
									'hover:shadow-sm',
									isDisabled && 'opacity-50'
								)}
							>
								<div className='flex items-center gap-4'>
									<div className={cn('rounded-lg p-2.5', severityStyles[action.severity].badge)}>
										<ActionIcon className='h-5 w-5' />
									</div>
									<div>
										<div className='flex items-center gap-2'>
											<p className='font-medium text-foreground'>{action.label}</p>
											<Badge variant='secondary' className='font-mono'>
												{action.count}
											</Badge>
										</div>
										<p className='mt-0.5 text-sm text-muted-foreground'>{action.description}</p>
									</div>
								</div>

								{action.type === 'send_reminder' ? (
									<Button
										variant='outline'
										size='sm'
										disabled={isDisabled}
										className='min-w-[120px]'
										onClick={() => handleOpenNotificationModal(action)}
									>
										{actionButtonLabels[action.type]}
									</Button>
								) : (
									<AlertDialog>
										<AlertDialogTrigger asChild>
											<Button
												variant='default'
												size='sm'
												disabled={isDisabled}
												className='min-w-[120px]'
											>
												{isProcessing ? (
													<>
														<Loader2 className='mr-2 h-4 w-4 animate-spin' />
														Đang xử lý...
													</>
												) : (
													actionButtonLabels[action.type]
												)}
											</Button>
										</AlertDialogTrigger>
										<AlertDialogContent className='animate-scale-in'>
											<AlertDialogHeader>
												<AlertDialogTitle className='flex items-center gap-2'>
													<SeverityIcon
														className={cn(
															'h-5 w-5',
															action.severity === 'critical' && 'text-destructive',
															action.severity === 'warning' && 'text-warning',
															action.severity === 'info' && 'text-info'
														)}
													/>
													Xác nhận hành động
												</AlertDialogTitle>
												<AlertDialogDescription className='text-left'>
													<span className='mb-2 block'>
														Bạn sắp thực hiện: <strong>{action.label}</strong>
													</span>
													<span className='mb-2 block'>
														Số lượng: <strong>{action.count}</strong>{' '}
														{action.type.includes('reminder') ? 'người' : 'đề tài'}
													</span>
													<span className='block text-muted-foreground'>
														{action.description}
													</span>
												</AlertDialogDescription>
											</AlertDialogHeader>
											<AlertDialogFooter>
												<AlertDialogCancel>Hủy</AlertDialogCancel>
												<AlertDialogAction onClick={() => handleConfirmAction(action)}>
													Xác nhận
												</AlertDialogAction>
											</AlertDialogFooter>
										</AlertDialogContent>
									</AlertDialog>
								)}
							</div>
						)
					})
				)}
			</CardContent>

			{selectedNotificationAction && (
				<SendNotificationModal
					open={notificationModalOpen}
					onOpenChange={setNotificationModalOpen}
					action={selectedNotificationAction}
					phaseType={phase.phase}
					onSend={handleSendNotification}
				/>
			)}
		</Card>
	)
}
