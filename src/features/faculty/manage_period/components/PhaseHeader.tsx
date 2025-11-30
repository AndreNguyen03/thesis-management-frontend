import { useState, useEffect } from 'react'
import { PeriodPhaseStatus, phaseLabels, type PendingAction, type PeriodPhase } from '@/models/period-phase.models'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { CalendarDays, Clock, Settings, Eye, Bell } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { SendNotificationModal } from './modals/SendNotificationModal'

interface PhaseHeader {
	phase: PeriodPhase
	onViewConfig?: () => void
	onEditConfig?: () => void
}

const statusLabels: Record<PeriodPhaseStatus, string> = {
	not_started: 'Sắp tới',
	ongoing: 'Đang diễn ra',
	completed: 'Đã hoàn thành'
}

const statusBadgeStyles: Record<PeriodPhaseStatus, string> = {
	not_started: 'bg-muted text-muted-foreground',
	ongoing: 'bg-primary/10 text-primary border-primary/20',
	completed: 'bg-success/10 text-success border-success/20'
}

const calculateTimeRemaining = (endDate: string) => {
	const now = new Date()
	const end = new Date(endDate)
	const diff = end.getTime() - now.getTime()

	if (diff <= 0) {
		return { expired: true, days: 0, hours: 0, minutes: 0, seconds: 0 }
	}

	const days = Math.floor(diff / (1000 * 60 * 60 * 24))
	const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
	const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
	const seconds = Math.floor((diff % (1000 * 60)) / 1000)

	return { expired: false, days, hours, minutes, seconds }
}

export function PhaseHeader({ phase, onViewConfig, onEditConfig }: PhaseHeader) {
	const [currentTime, setCurrentTime] = useState(new Date())
	const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(phase.endTime))

	const [notifyTarget, setNotifyTarget] = useState<'student' | 'lecturer' | null>(null)

	// Số lượng người nhận mock (ví dụ)
	const pendingAction: PendingAction = { label: '', count: 10 }

	const handleNotifyClick = (target: 'student' | 'lecturer') => {
		setNotifyTarget(target)
	}

	const handleCloseModal = () => setNotifyTarget(null)

	const handleSendNotification = async () => {
		// TODO: gọi API gửi thông báo cho nhóm notifyTarget
		console.log('Gửi thông báo cho', notifyTarget)
		// Ví dụ giả lập delay
		await new Promise((resolve) => setTimeout(resolve, 1000))
	}

	useEffect(() => {
		const interval = setInterval(() => {
			setCurrentTime(new Date())
			setTimeRemaining(calculateTimeRemaining(phase.endTime))
		}, 1000)

		return () => clearInterval(interval)
	}, [phase.endTime])

	return (
		<div className='animate-fade-in rounded-lg border bg-card p-6 shadow-sm'>
			{/* Header Row */}
			<div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between'>
				<div className='flex-1'>
					<div className='flex items-center gap-3'>
						<h1 className='text-xl font-bold tracking-tight text-foreground sm:text-2xl'>
							Pha {phaseLabels[phase.phase]}
						</h1>
						<Badge variant='outline' className={statusBadgeStyles[phase.status]}>
							{statusLabels[phase.status]}
						</Badge>
					</div>
				</div>

				{/* Action Buttons */}
				<div className='flex items-center gap-2'>
					{/* Cấu hình */}

					<Button variant='outline' size='sm' onClick={onViewConfig}>
						Thiết lập
						<Settings className='h-4 w-4' />
					</Button>

					{/* Gửi thông báo */}
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant='outline' size='sm'>
								Thông báo
								<Bell className='h-4 w-4' />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent align='end'>
							<DropdownMenuItem onClick={() => handleNotifyClick('student')}>
								Thông báo sinh viên
							</DropdownMenuItem>
							<DropdownMenuItem onClick={() => handleNotifyClick('lecturer')}>
								Thông báo giảng viên
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				</div>
			</div>

			{/* Time Information Grid */}
			<div className='mb-4 grid grid-cols-1 gap-4 md:grid-cols-2'>
				<div className='flex items-center gap-2 text-sm'>
					<CalendarDays className='h-4 w-4 text-muted-foreground' />
					<span className='text-muted-foreground'>Thời gian:</span>
					<span className='font-medium text-foreground'>
						{new Date(phase.startTime).toLocaleString('vi-VN')} -{' '}
						{new Date(phase.endTime).toLocaleString('vi-VN')}
					</span>
				</div>
			</div>

			{/* Real-time Clock & Countdown */}
			<div className='flex flex-col gap-4 border-t pt-4 sm:flex-row sm:items-center'>
				<div className='flex items-center gap-2 text-sm'>
					<Clock className='h-4 w-4 text-primary' />
					<span className='text-muted-foreground'>Thời gian hiện tại:</span>
					<span className='font-mono font-medium text-foreground'>
						{currentTime.toLocaleString('vi-VN')}
					</span>
				</div>

				<div className='flex items-center gap-2 text-sm'>
					<span className='text-muted-foreground'>—</span>
					{timeRemaining.expired ? (
						<span className='font-medium text-destructive'>
							🔴 Pha đã kết thúc lúc {new Date(phase.endTime).toLocaleString('vi-VN')}
						</span>
					) : (
						<>
							<span className='text-muted-foreground'>Còn lại:</span>
							<span className='font-mono font-medium text-primary'>
								{timeRemaining.days} ngày {timeRemaining.hours.toString().padStart(2, '0')}h{' '}
								{timeRemaining.minutes.toString().padStart(2, '0')}m{' '}
								{timeRemaining.seconds.toString().padStart(2, '0')}s
							</span>
						</>
					)}
				</div>
			</div>
			{/* Modal gửi thông báo */}
			{notifyTarget && (
				<SendNotificationModal
					open={!!notifyTarget}
					onOpenChange={handleCloseModal}
					action={{ ...pendingAction, label: `Gửi thông báo cho ${notifyTarget}` }}
					phaseType={phase.phase}
					onSend={handleSendNotification}
				/>
			)}
		</div>
	)
}
