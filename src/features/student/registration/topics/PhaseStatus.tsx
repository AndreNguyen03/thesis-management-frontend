import type { RegistrationPeriod } from '../types'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Clock, CalendarClock, Lock, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'

interface PhaseStatusProps {
	period: RegistrationPeriod
}

export function PhaseStatus({ period }: PhaseStatusProps) {
	const { phase, startDate, endDate, name } = period

	const phaseConfig = {
		before: {
			icon: CalendarClock,
			label: 'Sắp mở',
			color: 'text-warning',
			bgColor: 'bg-warning/10',
			borderColor: 'border-warning/30',
			description: `Pha đăng ký sẽ mở vào ${format(startDate, "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })}`
		},
		open: {
			icon: CheckCircle2,
			label: 'Đang mở',
			color: 'text-success',
			bgColor: 'bg-success/10',
			borderColor: 'border-success/30',
			description: `Còn ${formatDistanceToNow(endDate, { locale: vi })} để đăng ký`
		},
		closed: {
			icon: Lock,
			label: 'Đã đóng',
			color: 'text-muted-foreground',
			bgColor: 'bg-muted',
			borderColor: 'border-border',
			description: `Pha đăng ký đã kết thúc vào ${format(endDate, "HH:mm 'ngày' dd/MM/yyyy", { locale: vi })}`
		}
	}

	const config = phaseConfig[phase]
	const Icon = config.icon

	return (
		<Card className={cn('border', config.borderColor, config.bgColor)}>
			<CardContent className='p-4 md:p-6'>
				<div className='flex items-start gap-4 md:items-center'>
					<div className={cn('rounded-full p-3', config.bgColor)}>
						<Icon className={cn('h-6 w-6', config.color)} />
					</div>
					<div className='min-w-0 flex-1'>
						<div className='mb-1 flex flex-col gap-2 md:flex-row md:items-center'>
							<h3 className='font-semibold text-foreground'>{name}</h3>
							<Badge
								variant='secondary'
								className={cn('w-fit font-medium', config.bgColor, config.color)}
							>
								{config.label}
							</Badge>
						</div>
						<p className='text-sm text-muted-foreground'>{config.description}</p>
						<div className='mt-2 flex items-center gap-2 text-xs text-muted-foreground'>
							<Clock className='h-3.5 w-3.5' />
							<span>
								{format(startDate, 'dd/MM/yyyy HH:mm', { locale: vi })} -{' '}
								{format(endDate, 'dd/MM/yyyy HH:mm', { locale: vi })}
							</span>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	)
}
