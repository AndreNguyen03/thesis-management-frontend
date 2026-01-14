import { Dialog, DialogContent } from '@/components/ui/Dialog'
import { useGetTaskDetailQuery } from '@/services/todolistApi'
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
			<DialogContent className='max-h-[90vh] max-w-[70vw] gap-0 overflow-hidden bg-white p-0' hideClose>
				{isLoading && (
					<div className='flex h-96 items-center justify-center'>
						<Loader2 className='h-8 w-8 animate-spin text-primary' />
					</div>
				)}

				{error && (
					<div className='flex h-96 items-center justify-center text-destructive'>
						<p>Lỗi khi tải chi tiết công việc</p>
					</div>
				)}

				{task && <TaskDetailContent task={task} onClose={onClose} />}
			</DialogContent>
		</Dialog>
	)
}
