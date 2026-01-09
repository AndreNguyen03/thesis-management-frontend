import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUpdateTaskDetailsMutation } from '@/services/todolistApi'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'

interface TaskDueDateProps {
	taskId: string
	dueDate?: Date
}

export const TaskDueDate = ({ taskId, dueDate }: TaskDueDateProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [date, setDate] = useState<Date | undefined>(dueDate ? new Date(dueDate) : undefined)
	const [updateTask, { isLoading }] = useUpdateTaskDetailsMutation()
	const { toast } = useToast()

	const handleSave = async (selectedDate: Date | undefined) => {
		try {
			await updateTask({
				taskId,
				updates: { dueDate: selectedDate ? selectedDate.toISOString() : null }
			}).unwrap()

			setDate(selectedDate)
			setIsOpen(false)
			toast({
				title: 'Success',
				description: selectedDate ? 'Due date updated successfully' : 'Due date removed successfully'
			})
		} catch (error) {
			toast({
				title: 'Error',
				description: 'Failed to update due date',
				variant: 'destructive'
			})
		}
	}

	const handleRemove = async () => {
		await handleSave(undefined)
	}

	const isOverdue = date && new Date(date) < new Date()

	return (
		<div className='space-y-2'>
			{date ? (
				<div className='flex items-center justify-between'>
					<div className={cn('text-sm', isOverdue && 'font-medium text-destructive')}>
						{format(new Date(date), 'PPP')}
						{isOverdue && <span className='ml-2 text-xs'>(Overdue)</span>}
					</div>
					<Button variant='ghost' size='icon' onClick={handleRemove} disabled={isLoading} className='h-6 w-6'>
						<X className='h-3 w-3' />
					</Button>
				</div>
			) : (
				<p className='text-sm italic text-muted-foreground'>No due date</p>
			)}

			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button variant='outline' size='sm' className='w-full' disabled={isLoading}>
						<CalendarIcon className='mr-2 h-4 w-4' />
						{date ? 'Change Date' : 'Set Due Date'}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto p-0' align='start'>
					<Calendar
						mode='single'
						selected={date}
						onSelect={handleSave}
						initialFocus
						disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
					/>
				</PopoverContent>
			</Popover>
		</div>
	)
}
