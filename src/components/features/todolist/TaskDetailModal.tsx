import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { useGetTaskDetailQuery, useUpdateTaskDetailsMutation } from '@/services/todolistApi'
import { Loader2 } from 'lucide-react'
import { TaskDetailContent } from './TaskDetailContent'

interface TaskDetailModalProps {
	taskId: string
	isOpen: boolean
	onClose: () => void
}

export const TaskDetailModal = ({ taskId, isOpen, onClose }: TaskDetailModalProps) => {
	const { data: task, isLoading, error } = useGetTaskDetailQuery(taskId, { skip: !isOpen })

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-h-[90vh] max-w-[90vw] gap-0 overflow-hidden p-0'>
				{isLoading && (
					<div className='flex h-96 items-center justify-center'>
						<Loader2 className='h-8 w-8 animate-spin text-primary' />
					</div>
				)}

				{error && (
					<div className='flex h-96 items-center justify-center text-destructive'>
						<p>Failed to load task details</p>
					</div>
				)}

				{task && <TaskDetailContent task={task} onClose={onClose} />}
			</DialogContent>
		</Dialog>
	)
}
