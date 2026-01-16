import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Download, X } from 'lucide-react'
import { ComprehensiveScoreView } from './ComprehensiveScoreView'
import type { TopicAssignment } from '@/models/defenseCouncil.model'

interface ScoreViewModalProps {
	isOpen: boolean
	onClose: () => void
	topic: TopicAssignment
	canEdit: boolean
	onEdit?: () => void
}

export function ScoreViewModal({ isOpen, onClose, topic, canEdit, onEdit }: ScoreViewModalProps) {
	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-h-[90vh] max-w-5xl overflow-y-auto' hideClose>
				<DialogHeader>
					<div className='flex items-center justify-between'>
						<DialogTitle className='text-2xl font-bold'>
							Chi tiết điểm đánh giá - STT {topic.defenseOrder}
						</DialogTitle>
						<Button variant='ghost' size='icon' onClick={onClose}>
							<X className='h-4 w-4' />
						</Button>
					</div>
				</DialogHeader>

				<ComprehensiveScoreView topic={topic} />

				<div className='flex gap-2 border-t pt-4'>
					{canEdit && onEdit && (
						<Button onClick={onEdit} className='flex-1'>
							Chỉnh sửa điểm
						</Button>
					)}
					<Button variant='outline' className='flex-1'>
						<Download className='mr-2 h-4 w-4' />
						Xuất phiếu điểm
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
