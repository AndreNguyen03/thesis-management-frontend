import { useState, useEffect } from 'react'
import { PeriodPhaseStatus, phaseLabels, type PeriodPhase } from '@/models/period-phase.models'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { CalendarDays, Clock, Settings, Bell } from 'lucide-react'
import { SendNotificationModal } from '@/components/NotificationModal'
import type { ResponseMiniLecturerDto } from '@/models'

const MOCK_TOTAL_STUDENTS = 150
const MOCK_TOTAL_INSTRUCTORS = 25
const MOCK_AVAILABLE_INSTRUCTORS: ResponseMiniLecturerDto[] = [
	{
		_id: 'gv1',
		fullName: 'Nguyễn Văn An',
		email: 'an.nv@hcmut.edu.vn',
		phone: '0901xxx',
		avatarUrl: '',
		avatarName: '',
		title: 'ThS',
		facultyName: 'Công nghệ Thông tin',
		roleInTopic: 'Supervisor'
	},
	{
		_id: 'gv2',
		fullName: 'Lê Thị Bình',
		email: 'binh.lt@hcmut.edu.vn',
		phone: '0902xxx',
		avatarUrl: '',
		avatarName: '',
		title: 'TS',
		facultyName: 'Kỹ thuật Máy tính',
		roleInTopic: 'Reviewer'
	},
	{
		_id: 'gv3',
		fullName: 'Trần Văn Cường',
		email: 'cuong.tv@hcmut.edu.vn',
		phone: '0903xxx',
		avatarUrl: '',
		avatarName: '',
		title: 'PGS.TS',
		facultyName: 'Khoa học Máy tính',
		roleInTopic: 'Supervisor'
	}
]
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

export function PhaseHeader({ phase, onViewConfig }: PhaseHeader) {
	const [currentTime, setCurrentTime] = useState(new Date())
	const [timeRemaining, setTimeRemaining] = useState(calculateTimeRemaining(phase.endTime))

	const [isModalOpen, setIsModalOpen] = useState(false)

	const handleOpenModal = () => setIsModalOpen(true)
	const handleCloseModal = () => setIsModalOpen(false)

	const handleSendNotification = async (data: any) => {
		console.log('Gửi Thông báo Thủ công Data:', data)
		// TODO: Gọi API POST /api/v1/notifications/send với data JSON
		await new Promise((resolve) => setTimeout(resolve, 1000)) // Giả lập delay
		handleCloseModal() // Đóng sau khi gửi thành công
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

					<Button variant='outline' size='sm' onClick={handleOpenModal}>
						Thông báo
						<Bell className='h-4 w-4' />
					</Button>
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
					<span className='font-mono font-medium text-foreground'>{currentTime.toLocaleString('vi-VN')}</span>
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
			<SendNotificationModal
				isOpen={isModalOpen}
				onClose={handleCloseModal} // Hàm đóng modal
				onSubmit={handleSendNotification} // Hàm xử lý gửi data
				totalStudents={MOCK_TOTAL_STUDENTS}
				totalLecturers={MOCK_TOTAL_INSTRUCTORS}
				availableLecturers={MOCK_AVAILABLE_INSTRUCTORS} // Truyền data giảng viên
			/>
		</div>
	)
}
