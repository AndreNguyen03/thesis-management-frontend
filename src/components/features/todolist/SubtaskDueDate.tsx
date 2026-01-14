import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useUpdateSubtaskMutation } from '@/services/todolistApi'
import { format } from 'date-fns'
import { Calendar as CalendarIcon, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { vi as viLocale } from 'date-fns/locale'
import { toast } from 'sonner'

interface SubtaskDueDateProps {
	taskId: string
	columnId: string
	subtaskId: string
	dueDate?: Date
}

export const SubtaskDueDate = ({ taskId, columnId, subtaskId, dueDate }: SubtaskDueDateProps) => {
	const [isOpen, setIsOpen] = useState(false)
	const [date, setDate] = useState<Date | undefined>(dueDate ? new Date(dueDate) : undefined)
	const [time, setTime] = useState<string>(() => {
		if (dueDate) {
			const d = new Date(dueDate)
			return d.toTimeString().slice(0, 5)
		}
		return '00:00'
	})
	const [updateSubtask, { isLoading }] = useUpdateSubtaskMutation()

	const handleSave = async (selectedDate: Date | undefined, selectedTime?: string) => {
		let finalDate: Date | undefined = selectedDate
		if (selectedDate && (selectedTime || time)) {
			const [h, m] = (selectedTime || time).split(':')
			finalDate = new Date(selectedDate)
			finalDate.setHours(Number(h))
			finalDate.setMinutes(Number(m))
			finalDate.setSeconds(0)
			finalDate.setMilliseconds(0)
		}
		try {
			await updateSubtask({
				taskId,
				columnId,
				subtaskId,
				updates: { dueDate: finalDate ? finalDate.toISOString() : null }
			}).unwrap()
			setDate(finalDate)
			setIsOpen(false)
			toast.success('Cập nhật hạn chót', {
				richColors: true,
				description: finalDate ? 'Cập nhật hạn chót thành công' : 'Đã xóa hạn chót'
			})
		} catch (error) {
			toast.error('Cập nhật hạn chót thất bại' + error, {
				richColors: true,
				description: selectedDate ? 'Cập nhật hạn chót thất bại' : 'Xóa hạn chót thất bại'
			})
		}
	}

	const handleRemove = async () => {
		await handleSave(undefined)
		setTime('00:00')
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
						{date ? 'Thay đổi ngày/giờ' : 'Đặt hạn chót'}
					</Button>
				</PopoverTrigger>
				<PopoverContent className='w-auto space-y-2 p-4' align='start'>
					<Calendar
						mode='single'
						selected={date}
						onSelect={(d) => {
							if (d) setDate(d)
						}}
						initialFocus
						disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
					/>
					<div className='flex items-center gap-2'>
						<Input
							type='time'
							value={time}
							onChange={(e) => setTime(e.target.value)}
							className='w-28'
							step='60'
							min='00:00'
							max='23:59'
						/>
						<Button
							size='sm'
							onClick={async () => {
								if (date) await handleSave(date, time)
							}}
							disabled={!date || isLoading}
						>
							Lưu
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
