import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { Loader2 } from 'lucide-react'
import { useGetSubtaskDetailQuery } from '@/services/todolistApi'
import { SubtaskDetailContent } from './SubtaskDetailContent'

interface SubtaskDetailModalProps {
	subtaskId: string
	taskId: string
	columnId: string
	onClose: () => void
	groupId: string
}

export const SubtaskDetailModal = ({
	subtaskId,
	taskId,
	columnId,
	onClose,
	groupId,
}: SubtaskDetailModalProps) => {
	// Fetch subtask detail from API
	const { data: subtask, isLoading, error } = useGetSubtaskDetailQuery({ taskId, columnId, subtaskId })
	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className='max-h-[90vh] max-w-[70vw] gap-0 overflow-hidden bg-white p-0' hideClose>
				{isLoading && (
					<div className='flex h-96 items-center justify-center'>
						<Loader2 className='h-8 w-8 animate-spin text-primary' />
					</div>
				)}

				{error && (
					<div className='flex h-96 items-center justify-center text-destructive'>
						<p>Failed to load subtask details</p>
					</div>
				)}

				{subtask && (
					<SubtaskDetailContent
						subtask={subtask}
						taskId={taskId}
						columnId={columnId}
						onClose={onClose}
						groupId={groupId}
					/>
				)}
			</DialogContent>
		</Dialog>
	)
}
