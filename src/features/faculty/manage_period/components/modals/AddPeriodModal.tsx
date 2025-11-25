import { useState } from 'react'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/Dialog'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { ApiError } from '@/models'
import { useCreatePeriodMutation } from '@/services/periodApi'
import { LoadingState } from '@/components/ui/LoadingState'

interface AddPeriodModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function AddPeriodModal({ open, onOpenChange }: AddPeriodModalProps) {
	const [name, setName] = useState('')
	const [startTime, setStartTime] = useState<Date>()
	const [endTime, setEndTime] = useState<Date>()

	const [createPeriod, { isLoading }] = useCreatePeriodMutation()

	const resetForm = () => {
		setName('')
		setStartTime(undefined)
		setEndTime(undefined)
		onOpenChange(false)
	}

	const handleAddPeriod = async () => {
		if (name && startTime && endTime) {
			const payload = { name, startTime, endTime }
			try {
				const response = await createPeriod(payload).unwrap()
				resetForm()
				toast({
					title: 'Thành công',
					description: response.message
				})
			} catch (error) {
				toast({
					title: 'Lỗi',
					description: (error as ApiError).data?.message,
					variant: 'destructive'
				})
			}
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[600px]'>
				{isLoading ? (
					<LoadingState message='Đang tạo đợt đăng ký...' />
				) : (
					<>
						<DialogHeader>
							<DialogTitle>Thêm đợt đăng ký mới</DialogTitle>
							<DialogDescription>Tạo một đợt đăng ký đề tài tốt nghiệp mới</DialogDescription>
						</DialogHeader>

						<div className='space-y-6 py-4'>
							{/* Name */}
							<div className='space-y-2'>
								<Label htmlFor='name'>Tên đợt đăng ký *</Label>
								<Input
									id='name'
									placeholder='VD: Đợt đăng ký học kỳ I năm 2024-2025'
									value={name}
									onChange={(e) => setName(e.target.value)}
								/>
							</div>

							{/* Date Range */}
							<div className='grid grid-cols-2 gap-4'>
								{/* Start Date */}
								<div className='space-y-2'>
									<Label>Ngày bắt đầu *</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={cn(
													'w-full justify-start text-left font-normal',
													!startTime && 'text-muted-foreground'
												)}
											>
												<CalendarIcon className='mr-2 h-4 w-4' />
												{startTime
													? format(startTime, 'dd/MM/yyyy', { locale: vi })
													: 'Chọn ngày'}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0' align='start'>
											<Calendar
												mode='single'
												selected={startTime}
												onSelect={setStartTime}
												initialFocus
											/>
										</PopoverContent>
									</Popover>
								</div>

								{/* End Date */}
								<div className='space-y-2'>
									<Label>Ngày kết thúc *</Label>
									<Popover>
										<PopoverTrigger asChild>
											<Button
												variant='outline'
												className={cn(
													'w-full justify-start text-left font-normal',
													!endTime && 'text-muted-foreground'
												)}
											>
												<CalendarIcon className='mr-2 h-4 w-4' />
												{endTime ? format(endTime, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
											</Button>
										</PopoverTrigger>
										<PopoverContent className='w-auto p-0' align='start'>
											<Calendar
												mode='single'
												selected={endTime}
												onSelect={setEndTime}
												initialFocus
												disabled={(date: Date) => (startTime ? date < startTime : false)}
											/>
										</PopoverContent>
									</Popover>
								</div>
							</div>
						</div>

						<DialogFooter>
							<Button variant='outline' onClick={() => onOpenChange(false)}>
								Hủy
							</Button>
							<Button onClick={handleAddPeriod} disabled={!name || !startTime || !endTime}>
								Tạo đợt mới
							</Button>
						</DialogFooter>
					</>
				)}
			</DialogContent>
		</Dialog>
	)
}
