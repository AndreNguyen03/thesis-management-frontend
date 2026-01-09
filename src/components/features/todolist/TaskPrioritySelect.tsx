import { TaskPriority } from '@/models/task-detail.model'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateTaskDetailsMutation } from '@/services/todolistApi'
import { useToast } from '@/hooks/use-toast'
import { AlertCircle } from 'lucide-react'

interface TaskPrioritySelectProps {
	taskId: string
	currentPriority: TaskPriority
}

export const TaskPrioritySelect = ({ taskId, currentPriority }: TaskPrioritySelectProps) => {
	const [updateTask, { isLoading }] = useUpdateTaskDetailsMutation()
	const { toast } = useToast()

	const handleChange = async (priority: TaskPriority) => {
		try {
			await updateTask({
				taskId,
				updates: { priority }
			}).unwrap()

			toast({
				title: 'Success',
				description: 'Priority updated successfully'
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update priority',
				variant: 'destructive'
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

	return (
		<Select value={currentPriority} onValueChange={handleChange} disabled={isLoading}>
			<SelectTrigger className='w-full'>
				<SelectValue>
					<div className='flex items-center gap-2'>
						<AlertCircle className={`h-4 w-4 ${getPriorityColor(currentPriority)}`} />
						<span>{currentPriority}</span>
					</div>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				{Object.values(TaskPriority).map((priority) => (
					<SelectItem key={priority} value={priority}>
						<div className='flex items-center gap-2'>
							<AlertCircle className={`h-4 w-4 ${getPriorityColor(priority as TaskPriority)}`} />
							<span>{priority}</span>
						</div>
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	)
}
