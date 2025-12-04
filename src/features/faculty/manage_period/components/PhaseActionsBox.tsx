// PhaseActionsBox.tsx
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, Loader2 } from 'lucide-react'
// import { toast } from '@/hooks/use-toast'
import { Phase1Handler } from './Phase1Handler'
import { Phase2Handler } from './Phase2Handler'
import { Phase3Handler } from './Phase3Handler'
import {
	phaseLabels,
	type PeriodPhase,
	type Phase1Response,
	type Phase2Response,
	type Phase3Response,
	type ResolvePhaseResponse,
	isResolved
} from '@/models/period-phase.models'
// import { SendNotificationModal } from './modals/SendNotificationModal'

interface PhaseActionsBoxProps {
	resolvePhaseData: ResolvePhaseResponse
	phase: PeriodPhase
	onCompletePhase: () => void
	isResolving: boolean
}

export function PhaseActionsBox({ phase, isResolving, onCompletePhase, resolvePhaseData }: PhaseActionsBoxProps) {
	// const [notificationModalOpen, setNotificationModalOpen] = useState(false)
	// const [selectedNotificationAction, setSelectedNotificationAction] = useState<any>(null)

	const allCompleted = resolvePhaseData ? isResolved(resolvePhaseData) : false

	// const handleOpenNotificationModal = (action: any) => {
	// 	setSelectedNotificationAction(action)
	// 	setNotificationModalOpen(true)
	// }

	// const handleSendNotification = async () => {
	// 	if (!selectedNotificationAction) return
	// 	await new Promise((resolve) => setTimeout(resolve, 1500))
	// 	toast({
	// 		title: 'Thành công!',
	// 		description: `Đã gửi thông báo tới ${selectedNotificationAction.count} người`
	// 	})
	// 	setNotificationModalOpen(false)
	// }

	let phaseContent = null
	if (resolvePhaseData) {
		switch (phase.phase) {
			case 'submit_topic':
				phaseContent = (
					<Phase1Handler data={resolvePhaseData as Phase1Response} onCompletePhase={onCompletePhase} />
				)
				break
			case 'open_registration':
				phaseContent = (
					<Phase2Handler data={resolvePhaseData as Phase2Response} onCompletePhase={onCompletePhase} />
				)
				break
			case 'execution':
				phaseContent = (
					<Phase3Handler data={resolvePhaseData as Phase3Response} onCompletePhase={onCompletePhase} />
				)
				break
		}
	}

	return (
		<Card className='animate-slide-up p-0 shadow-card'>
			<CardHeader className='pb-4'>
				<div className='flex items-center justify-between'>
					<div>
						<CardTitle className='text-lg font-semibold'>Xử lý tồn đọng</CardTitle>
						<CardDescription>Pha: {phaseLabels[phase.phase]}</CardDescription>
					</div>
					{allCompleted && (
						<Badge variant='outline' className='border-success/20 bg-success/10 text-success'>
							<CheckCircle2 className='mr-1 h-3 w-3' />
							Đã xử lý xong
						</Badge>
					)}
				</div>
			</CardHeader>

			{isResolving ? (
				<div className='flex flex-col items-center justify-center py-8'>
					<Loader2 className='mb-4 h-8 w-8 animate-spin text-primary' />
					<p className='text-center text-lg font-medium'>Đang xử lý pha...</p>
				</div>
			) : (
				<div className='mt-4'>{phaseContent}</div>
			)}

			{/* {selectedNotificationAction && (
				<SendNotificationModal
					open={notificationModalOpen}
					onOpenChange={setNotificationModalOpen}
					action={selectedNotificationAction}
					phaseType={phase.phase}
					onSend={handleSendNotification}
				/>
			)} */}
		</Card>
	)
}
