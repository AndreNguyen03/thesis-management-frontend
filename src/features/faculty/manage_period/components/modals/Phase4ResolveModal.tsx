import { Button, Badge, Card } from '@/components/ui'
import { CheckCircle } from 'lucide-react'
import type { Phase4Response } from '@/models/period-phase.models'
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'

interface CompletionPhaseResolveModalProps {
	open: boolean
	onClose: () => void
	data: Phase4Response
	onComplete: () => void
}

export function CompletionPhaseResolveModal({ open, onClose, data, onComplete }: CompletionPhaseResolveModalProps) {
	const Icon = CheckCircle

	const handleComplete = () => {
		onComplete()
		onClose()
	}

	return (
		<Dialog open={open} onOpenChange={onClose}>
			<DialogContent className='max-h-[85vh] max-w-3xl overflow-hidden'>
				<DialogHeader>
					<DialogTitle className='flex items-center gap-2 text-xl'>
						<Icon className='h-6 w-6 text-green-600' />
						Pha hoàn thành
					</DialogTitle>
					<p className='text-sm text-gray-500'>Xem lại thông tin trước khi hoàn thành kỳ khóa luận</p>
				</DialogHeader>

				{/* Content */}
				<div className='max-h-[400px] space-y-3 overflow-y-auto'>
					<Card className='border border-green-200 bg-green-50 p-8 text-center'>
						<Icon className='mx-auto mb-2 h-12 w-12 text-green-600 opacity-50' />
						<p className='text-gray-600'>
							Tất cả các đề tài đã được hoàn thành. Sẵn sàng chuyển sang pha hoàn thành.
						</p>
					</Card>
				</div>

				<DialogFooter className='flex items-center justify-between sm:justify-between'>
					<div className='flex gap-2'>
						<Badge variant='default' className='bg-green-600 text-sm'>
							✓ Sẵn sàng hoàn thành pha
						</Badge>
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
