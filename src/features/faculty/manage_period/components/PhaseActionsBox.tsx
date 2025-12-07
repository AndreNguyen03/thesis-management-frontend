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
    onGoProcess: () => void
}

export function PhaseActionsBox({ phase, isResolving, onCompletePhase, resolvePhaseData, onGoProcess }: PhaseActionsBoxProps) {
	const allCompleted = resolvePhaseData ? isResolved(resolvePhaseData) : false

	let phaseContent = null
	if (resolvePhaseData) {
		switch (phase.phase) {
			case 'submit_topic':
				phaseContent = (
					<Phase1Handler data={resolvePhaseData as Phase1Response} onCompletePhase={onCompletePhase} onProcess={onGoProcess}/>
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
		<Card className='animate-slide-up px-0 pt-0 pb-6 shadow-card'>
			<CardHeader>
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
