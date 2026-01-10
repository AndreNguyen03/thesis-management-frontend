import { TaskPriority } from '@/models/task-detail.model'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateTaskDetailsMutation } from '@/services/todolistApi'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'
import { taskPriorityLabels } from '@/models/todolist.model'
import { toast } from 'sonner'

interface TaskPrioritySelectProps {
	taskId: string
	currentPriority: TaskPriority
}

export const TaskPrioritySelect = ({ taskId, currentPriority }: TaskPrioritySelectProps) => {
	const [updateTask, { isLoading }] = useUpdateTaskDetailsMutation()

	const handleChange = async (priority: TaskPriority) => {
		try {
			await updateTask({
				taskId,
				updates: { priority }
			}).unwrap()

			toast.success('Cập nhật độ ưu tiên', {
				richColors: true,
				description: 'Cập nhật độ ưu tiên thành công'
			})
		} catch (error) {
			toast.error('Cập nhật độ ưu tiên thất bại', {
				richColors: true,
				description: 'Cập nhật độ ưu tiên thất bại'
			})
		}
	}

	const getPriorityColor = (priority: TaskPriority) => {
		switch (priority) {
			case 'Highest':
				return 'text-red-600'
			case 'High':
				return 'text-red-500'
			case 'Medium':
				return 'text-orange-500'
			case 'Low':
				return 'text-green-500'
			case 'Lowest':
				return 'text-green-600'
		}
	}
	console.log('currentPriority', currentPriority)
	return (
		<Select value={currentPriority} onValueChange={handleChange} disabled={isLoading}>
			<SelectTrigger className='w-full'>
				<SelectValue>
					<div className='flex items-center gap-2'>
						<AlertCircle className={`h-4 w-4 ${getPriorityColor(currentPriority)}`} />
						<span>{taskPriorityLabels[currentPriority as keyof typeof taskPriorityLabels].name}</span>
					</div>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{Object.values(TaskPriority).map((priority) => (
					<SelectItem key={priority} value={priority}>
						<div className='flex items-center gap-2'>
							<AlertCircle className={`h-4 w-4 ${getPriorityColor(priority as TaskPriority)}`} />
							<span>{taskPriorityLabels[priority as keyof typeof taskPriorityLabels].name}</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
