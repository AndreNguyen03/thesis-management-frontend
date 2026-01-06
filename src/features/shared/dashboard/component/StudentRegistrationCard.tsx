import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Clock, FileSearch, AlertCircle, CheckCircle, XCircle, type LucideIcon } from 'lucide-react'
import type { DashboardType, StudentTopicDashboard } from '@/models/period.model'
import { formatDate } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'

interface RegistrationCardProps {
	dashboardData: DashboardType
}

const STATUS_MAP: Record<
	string,
	{
		label: string
		icon: LucideIcon
		variant: 'success' | 'warning' | 'destructive'
	}
> = {
	approved: {
		label: 'Đã duyệt',
		icon: CheckCircle,
		variant: 'success'
	},
	pending: {
		label: 'Đang chờ',
		icon: AlertCircle,
		variant: 'warning'
	},
	rejected: {
		label: 'Bị từ chối',
		icon: XCircle,
		variant: 'destructive'
	}
}

export function RegistrationCard({ dashboardData }: RegistrationCardProps) {
	const navigate = useNavigate()
	const phase = dashboardData.currentPhaseDetail

	/* ---------------- Narrow ---------------- */
	const topics = dashboardData.topicData as StudentTopicDashboard[]

	/* ---------------- Time ---------------- */
	const now = new Date()
	const end = new Date(phase.endTime)
	const remainingDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
	const isExpired = remainingDays <= 0

	const hasNoRegistration = topics.length === 0

	/* ---------------- Header ---------------- */
	const Header = (
		<CardHeader className='pb-3'>
			<div className='flex items-center justify-between'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<FileSearch className='h-5 w-5 text-primary' />
					Đăng ký đề tài
				</CardTitle>

				<Badge variant={isExpired ? 'destructive' : 'warning'} className='gap-1'>
					<Clock className='h-3 w-3' />
					{isExpired ? 'Hết hạn' : `Còn ${remainingDays} ngày`}
				</Badge>
			</div>
		</CardHeader>
	)

	/* ---------------- Empty ---------------- */
	if (hasNoRegistration) {
		return (
			<Card className='rounded-xl border-primary/20 bg-primary/5 p-0'>
				{Header}

				<CardContent className='space-y-4'>
					<div className='flex items-center justify-between rounded-lg border bg-card p-4'>
						<div>
							<p className='text-sm text-muted-foreground'>Trạng thái</p>
							<p className='mt-1 font-medium'>Chưa đăng ký đề tài</p>
						</div>

						<Button
							size='lg'
							className='w-full rounded-xl sm:w-auto'
							onClick={() => navigate('/registration')}
							disabled={isExpired}
						>
							Đăng ký ngay
						</Button>
					</div>

					<p className='text-center text-xs text-muted-foreground'>
						Thời hạn đăng ký: {formatDate(phase.startTime)} – {formatDate(phase.endTime)}
					</p>
				</CardContent>
			</Card>
		)
	}

	/* ---------------- Registered ---------------- */
	return (
		<Card className='rounded-xl border-primary/20 bg-primary/5 p-0'>
			{Header}

			<CardContent className='space-y-4 sm:space-y-3 md:space-y-4'>
				{topics.map((topic) => {
					const statusConfig = STATUS_MAP[topic.studentRegistration.status]
					const Icon = statusConfig.icon

					return (
						<div key={topic._id} className='space-y-2 rounded-lg border bg-card sm:p-3 md:p-4 lg:p-6'>
							<div className='flex items-start justify-between gap-3'>
								<div>
									<p className='font-medium leading-tight'>{topic.titleVN}</p>
									<p className='text-sm text-muted-foreground'>
										GVHD: {topic.lecturer.title} {topic.lecturer.fullName}
									</p>
								</div>

								<Badge variant={statusConfig.variant} className='gap-1'>
									<Icon className='h-3 w-3' />
									{statusConfig.label}
								</Badge>
							</div>

							{/* Lecturer response (quick glance) */}
							{topic.studentRegistration.lecturerResponse && (
								<div className='rounded-md bg-muted/40 p-2 text-xs text-muted-foreground'>
									<span className='font-medium'>Phản hồi GV:</span>{' '}
									{topic.studentRegistration.lecturerResponse}
								</div>
							)}
						</div>
					)
				})}

				<p className='pt-2 text-center text-xs text-muted-foreground'>
					Thời hạn đăng ký: {formatDate(phase.startTime)} – {formatDate(phase.endTime)}
				</p>
			</CardContent>
		</Card>
	)
}
