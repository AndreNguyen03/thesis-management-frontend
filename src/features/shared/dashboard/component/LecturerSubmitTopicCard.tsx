import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Clock, FilePlus, FileText, AlertCircle } from 'lucide-react'
import type { DashboardType, LecturerTopicSubmit } from '@/models/period.model'
import { formatDate } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'
import { useAppSelector } from '@/store'
import type { LecturerProfile } from '@/models'

interface LecturerSubmitTopicCardProps {
	dashboardData: DashboardType
}

const STATUS_MAP: Record<
	LecturerTopicSubmit['currentStatus'],
	{ label: string; variant: 'success' | 'warning' | 'destructive' | 'secondary' }
> = {
	pending: {
		label: 'Chờ duyệt',
		variant: 'warning'
	},
	approved: {
		label: 'Đã duyệt',
		variant: 'success'
	},
	rejected: {
		label: 'Bị từ chối',
		variant: 'destructive'
	},
	draft: {
		label: 'Bản nháp',
		variant: 'secondary'
	}
}

export function LecturerSubmitTopicCard({ dashboardData }: LecturerSubmitTopicCardProps) {
	const navigate = useNavigate()
	const user = useAppSelector((state) => state.auth.user) as LecturerProfile
	const phase = dashboardData.currentPhaseDetail

	const topics = dashboardData.topicData as LecturerTopicSubmit[]

	/* ---------------- Permission ---------------- */
	const requiredLecturers = phase.requiredLecturers ?? []
	const isRequiredLecturer = requiredLecturers.some((lecturer) => lecturer._id === user.userId)

	/* ---------------- Time ---------------- */
	const now = new Date()
	const end = new Date(phase.endTime)
	const remainingDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
	const isExpired = remainingDays <= 0

	/* ---------------- Not Required ---------------- */
	if (!isRequiredLecturer) {
		return (
			<Card className='rounded-xl border-border bg-muted/30'>
				<CardContent className='flex items-center gap-3 p-6'>
					<AlertCircle className='h-5 w-5 text-muted-foreground' />
					<p className='text-sm text-muted-foreground'>Không thuộc danh sách giảng viên cần nộp đề tài</p>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className='rounded-xl border-primary/20 bg-primary/5 p-0'>
			{/* ---------------- Header ---------------- */}
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2 text-lg'>
						<FileText className='h-5 w-5 text-primary' />
						Đề tài đã nộp
					</CardTitle>

					<Badge variant={isExpired ? 'destructive' : 'warning'} className='gap-1'>
						<Clock className='h-3 w-3' />
						{isExpired ? 'Hết hạn' : `Còn ${remainingDays} ngày`}
					</Badge>
				</div>
			</CardHeader>

			{/* ---------------- Content ---------------- */}
			<CardContent className='space-y-4'>
				{/* -------- List Topics -------- */}
				{topics.length > 0 ? (
					<div className='space-y-3'>
						{topics.map((topic) => {
							const status = STATUS_MAP[topic.currentStatus]

							return (
								<div
									key={topic._id}
									className='flex items-start justify-between rounded-lg border bg-card p-3'
								>
									<div>
										<p className='font-medium leading-tight'>{topic.titleVN}</p>
										<p className='text-xs text-muted-foreground'>
											Số SV tối đa: {topic.maxStudents}
										</p>
									</div>

									<Badge variant={status?.variant ?? 'secondary'}>
										{status?.label ?? topic.currentStatus}
									</Badge>
								</div>
							)
						})}
					</div>
				) : (
					<p className='text-sm text-muted-foreground'>Bạn chưa nộp đề tài nào trong đợt này.</p>
				)}

				{/* -------- CTA -------- */}
				<Button
					size='lg'
					className='w-full rounded-xl'
					onClick={() => navigate(topics.length > 0 ? '/lecturer/my-topics' : '/lecturer/submit-topic')}
					disabled={isExpired}
				>
					{topics.length > 0 ? (
						<>
							<FileText className='mr-2 h-4 w-4' />
							Quản lý đề tài
						</>
					) : (
						<>
							<FilePlus className='mr-2 h-4 w-4' />
							Nộp đề tài ngay
						</>
					)}
				</Button>

				<p className='text-center text-xs text-muted-foreground'>
					Thời hạn nộp đề tài: {formatDate(phase.startTime)} – {formatDate(phase.endTime)}
				</p>
			</CardContent>
		</Card>
	)
}
