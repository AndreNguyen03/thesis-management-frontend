import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Clock, FileSearch, Users, CheckCircle } from 'lucide-react'
import type { DashboardType, LecturerTopicRegisration } from '@/models/period.model'
import { formatDate } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'

interface LecturerRegistrationCardProps {
	dashboardData: DashboardType
}

export function LecturerRegistrationCard({ dashboardData }: LecturerRegistrationCardProps) {
	const navigate = useNavigate()
	const phase = dashboardData.currentPhaseDetail

	/* ---------------- Time ---------------- */
	const now = new Date()
	const end = new Date(phase.endTime)
	const remainingDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
	const isExpired = remainingDays <= 0

	/* ---------------- Topic Stats ---------------- */
	const pendingTopics = (dashboardData.topicData as LecturerTopicRegisration[]).filter(
		(topic) => topic.pendingCount > 0
	)

	const fullTopics = (dashboardData.topicData as LecturerTopicRegisration[]).filter(
		(topic) => topic.approvedCount >= topic.maxStudents
	)

	const hasPending = pendingTopics.length > 0

	return (
		<Card className='rounded-xl border-primary/20 bg-primary/5 p-0'>
			{/* Header */}
			<CardHeader className='pb-3'>
				<div className='flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<FileSearch className='h-5 w-5 text-primary' />
						Xét duyệt đăng ký đề tài
					</CardTitle>

					<Badge variant={isExpired ? 'destructive' : 'warning'} className='gap-1'>
						<Clock className='h-3 w-3' />
						{isExpired ? 'Hết hạn' : `Còn ${remainingDays} ngày`}
					</Badge>
				</div>
			</CardHeader>

			{/* Content */}
			<CardContent className='space-y-4'>
				<div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
					{/* Pending */}
					<div className='flex flex-col gap-2 rounded-lg border bg-card p-4'>
						<div className='flex items-center gap-2'>
							<Users className='h-4 w-4 text-warning' />
							<p className='text-sm text-muted-foreground'>Đề tài chờ xét duyệt</p>
						</div>
						<p className='mt-1 text-2xl font-semibold'>{pendingTopics.length}</p>
					</div>

					{/* Full */}
					<div className='flex flex-col gap-2 rounded-lg border bg-card p-4'>
						<div className='flex items-center gap-2'>
							<CheckCircle className='h-4 w-4 text-success' />
							<p className='text-sm text-muted-foreground'>Đề tài đã đủ SV</p>
						</div>
						<p className='mt-1 text-2xl font-semibold'>{fullTopics.length}</p>
					</div>
				</div>

				<Button
					size='lg'
					className='w-full rounded-xl'
					onClick={() => navigate('/approve-registrations')}
					disabled={!hasPending}
				>
					Xét duyệt ngay
				</Button>

				<p className='text-center text-xs text-muted-foreground'>
					Thời hạn xét duyệt: {formatDate(phase.startTime)} – {formatDate(phase.endTime)}
				</p>
			</CardContent>
		</Card>
	)
}
