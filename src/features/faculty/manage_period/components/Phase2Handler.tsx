// Phase2Handler.tsx
import { Button } from '@/components/ui'
import { CheckCircle2 } from 'lucide-react'
import type { Phase2Response } from '@/models/period-phase.models'

export function Phase2Handler({ onCompletePhase }: { data: Phase2Response; onCompletePhase: () => void }) {
	return (
		<div className='flex flex-col items-center py-8 text-center'>
			<div className='mb-4 rounded-full bg-success/10 p-4'>
				<CheckCircle2 className='h-8 w-8 text-success' />
			</div>
			<p className='text-lg font-medium'>Pha hiện tại đã xử lý xong</p>
			<Button onClick={onCompletePhase} className='mt-4'>
				Chuyển pha tiếp theo
			</Button>
		</div>
	)
}
