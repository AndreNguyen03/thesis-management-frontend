import { useState } from 'react'
import { X, Calendar } from 'lucide-react'
import type { ResponseMilestone } from '@/models/milestone.model'
import { MilestoneSelector } from '../MilestoneSelector'

interface EditMilestoneModalProps {
	isOpen: boolean
	onClose: () => void
	currentMilestoneId?: string
	milestones: ResponseMilestone[]
	onSave: (milestoneId: string | undefined) => void
	taskTitle: string
}

export const EditMilestoneModal = ({
	isOpen,
	onClose,
	currentMilestoneId,
	milestones,
	onSave,
	taskTitle
}: EditMilestoneModalProps) => {
	const [selectedMilestoneId, setSelectedMilestoneId] = useState<string | undefined>(currentMilestoneId)

	if (!isOpen) return null

	const handleSave = () => {
		onSave(selectedMilestoneId)
		onClose()
	}

	return (
		<>
			{/* Overlay */}
			<div className='fixed inset-0 z-50 bg-black/50' onClick={onClose} />

			{/* Modal */}
			<div className='fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-6 shadow-xl'>
				{/* Header */}
				<div className='mb-4 flex items-center justify-between'>
					<div>
						<h3 className='text-lg font-semibold text-foreground'>Liên kết Milestone</h3>
						<p className='mt-1 text-sm text-muted-foreground'>Cho công việc: "{taskTitle}"</p>
					</div>
					<button onClick={onClose} className='rounded-lg p-2 transition-colors hover:bg-secondary'>
						<X className='h-5 w-5 text-muted-foreground' />
					</button>
				</div>

				{/* Content */}
				<div className='space-y-4'>
					<div>
						<label className='mb-2 flex items-center gap-2 text-sm font-medium text-foreground'>
							<Calendar className='h-4 w-4 text-primary' />
							Chọn Milestone
						</label>
						<MilestoneSelector
							milestones={milestones}
							selectedMilestoneId={selectedMilestoneId}
							onSelect={setSelectedMilestoneId}
							placeholder='Không liên kết với milestone nào'
						/>
					</div>

					{/* Info Text */}
					<div className='rounded-lg bg-info/10 p-3 text-xs text-info'>
						💡 Liên kết task với milestone giúp bạn theo dõi tiến độ dự án tốt hơn. Bạn có thể bỏ liên kết
						bất cứ lúc nào.
					</div>
				</div>

				{/* Actions */}
				<div className='mt-6 flex justify-end gap-2'>
					<button
						onClick={onClose}
						className='rounded-lg border border-border bg-secondary px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80'
					>
						Hủy
					</button>
					<button
						onClick={handleSave}
						className='rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90'
					>
						Lưu thay đổi
					</button>
				</div>
			</div>
		</>
	)
}
