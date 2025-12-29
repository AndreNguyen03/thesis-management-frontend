import type { Phase3Response } from '@/models/period-phase.models'
import { Button } from '@/components/ui/Button'
import { ActionCard } from './ActionCard'
import { ExecutionPhaseResolveModal } from './ExecutionPhaseResolveModal'
import { useState } from 'react'

export function Phase3Handler({ data, onCompletePhase }: { data: Phase3Response; onCompletePhase: () => void }) {
	const [modalOpen, setModalOpen] = useState(true)
	return (
		<div className='space-y-4'>
			<ExecutionPhaseResolveModal
				data={data}
				open={modalOpen}
				onClose={() => setModalOpen(false)}
				onComplete={onCompletePhase}
			/>

			{/* Nút chuyển pha - luôn hiển thị */}
			{data.canTriggerNextPhase ? (
				<Button className='ml-5' onClick={onCompletePhase}>Chuyển sang pha tiếp theo</Button>
			) : (
				<Button
					onClick={() => {
						setModalOpen(true)
					}}
				>
					Xem danh sách các tồn đọng
				</Button>
			)}
		</div>
	)
}
