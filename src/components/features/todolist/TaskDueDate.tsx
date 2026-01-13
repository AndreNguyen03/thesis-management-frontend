import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUpdateTaskDetailsMutation } from '@/services/todolistApi'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { vi as viLocale } from 'date-fns/locale'
import { toast } from 'sonner'

interface TaskDueDateProps {
	taskId: string
	dueDate?: Date
}

export const TaskDueDate = ({ taskId, dueDate }: TaskDueDateProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [date, setDate] = useState<Date | undefined>(dueDate ? new Date(dueDate) : undefined)
	const [updateTask, { isLoading }] = useUpdateTaskDetailsMutation()

	const handleSave = async (selectedDate: Date | undefined) => {
		try {
			await updateTask({
				taskId,
				updates: { dueDate: selectedDate ? selectedDate.toISOString() : null }
			}).unwrap()

			setDate(selectedDate)
			setIsOpen(false)
			toast.success("Cập nhật hạn chót",{
				richColors: true,
				description: selectedDate ? 'Cập nhật hạn chót thành công' : 'Đã xóa hạn chót'
			})
		} catch (error) {
			toast.error("Cập nhật hạn chót thất bại"+ error,{
				richColors: true,
				description: selectedDate ? 'Cập nhật hạn chót thất bại' : 'Xóa hạn chót thất bại'
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
						{format(new Date(date), 'PPP', { locale: viLocale })}
						{isOverdue && <span className='ml-2 text-xs'>(Quá hạn)</span>}
					</div>
					<Button variant='ghost' size='icon' onClick={handleRemove} disabled={isLoading} className='h-6 w-6'>
						<X className='h-3 w-3' />
					</Button>
				</div>
			) : (
				<p className='text-sm italic text-muted-foreground'>Chưa có hạn chót</p>
			)}

			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button variant='outline' size='sm' className='w-full' disabled={isLoading}>
						<CalendarIcon className='mr-2 h-4 w-4' />
						{date ? 'Thay đổi ngày' : 'Đặt hạn chót'}
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
