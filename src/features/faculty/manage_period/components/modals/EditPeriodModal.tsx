import { Button, Input } from '@/components/ui'
import { Calendar } from '@/components/ui/calendar'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { CalendarIcon } from 'lucide-react'
import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import type { Period } from '@/models/period'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog'

interface EditPeriodModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	period: Period | null
	onSubmit: (data: { id: string; name: string; startDate: Date; endDate: Date }) => void
}

export function EditPeriodModal({ open, onOpenChange, period, onSubmit }: EditPeriodModalProps) {
	const [name, setName] = useState('')
	const [startDate, setStartDate] = useState<Date>()
	const [endDate, setEndDate] = useState<Date>()

	// Khi period thay đổi thì set state
	useEffect(() => {
		if (period) {
			setName(period.name)

			setStartDate(period.startTime ? new Date(period.startTime) : undefined)

			setEndDate(period.endTime ? new Date(period.endTime) : undefined)
		}
	}, [period])
    
	const handleSubmit = () => {
		if (period && name && startDate && endDate) {
			onSubmit({
				id: period.id,
				name,
				startDate,
				endDate
			})
			onOpenChange(false)
		}
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[600px]'>
				<DialogHeader>
					<DialogTitle>Chỉnh sửa đợt đăng ký</DialogTitle>
					<DialogDescription>Chỉ chỉnh sửa được tên, mô tả và thời gian đợt đăng ký</DialogDescription>
				</DialogHeader>

				<div className='space-y-6 py-4'>
					{/* Tên đợt */}
					<div className='space-y-2'>
						<Label htmlFor='name'>Tên đợt đăng ký *</Label>
						<Input id='name' value={name} onChange={(e) => setName(e.target.value)} />
					</div>

					{/* Thời gian */}
					<div className='grid grid-cols-2 gap-4'>
						{/* Ngày bắt đầu */}
						<div className='space-y-2'>
							<Label>Ngày bắt đầu *</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className={cn(
											'w-full justify-start text-left font-normal',
											!startDate && 'text-muted-foreground'
										)}
									>
										<CalendarIcon className='mr-2 h-4 w-4' />
										{startDate ? format(startDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0' align='start'>
									<Calendar mode='single' selected={startDate} onSelect={setStartDate} initialFocus />
								</PopoverContent>
							</Popover>
						</div>

						{/* Ngày kết thúc */}
						<div className='space-y-2'>
							<Label>Ngày kết thúc *</Label>
							<Popover>
								<PopoverTrigger asChild>
									<Button
										variant='outline'
										className={cn(
											'w-full justify-start text-left font-normal',
											!endDate && 'text-muted-foreground'
										)}
									>
										<CalendarIcon className='mr-2 h-4 w-4' />
										{endDate ? format(endDate, 'dd/MM/yyyy', { locale: vi }) : 'Chọn ngày'}
									</Button>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0' align='start'>
									<Calendar
										mode='single'
										selected={endDate}
										onSelect={setEndDate}
										initialFocus
										disabled={(date: Date) => (startDate ? date < startDate : false)}
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
					<Button onClick={handleSubmit} disabled={!name || !startDate || !endDate}>
						Lưu thay đổi
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
