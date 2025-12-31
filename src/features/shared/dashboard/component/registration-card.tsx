import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Clock, FileSearch, AlertCircle, CheckCircle, XCircle, type LucideIcon } from 'lucide-react'
import type { GetDashboardCurrentPeriodType, StudentRegistration } from '@/models/period.model'
import { formatDate } from '@/utils/utils'
import { useNavigate } from 'react-router-dom'


interface RegistrationCardProps {
	period: GetDashboardCurrentPeriodType
	studentRegisStatus?: StudentRegistration[]
}

/* ---------------- Status Config ---------------- */
const STATUS_MAP: Record<
	StudentRegistration['status'],
	{
		label: string
		icon: LucideIcon
		badgeVariant: 'success' | 'warning' | 'destructive'
	}
> = {
	approved: {
		label: 'Đã duyệt',
		icon: CheckCircle,
		badgeVariant: 'success'
	},
	pending: {
		label: 'Đang chờ',
		icon: AlertCircle,
		badgeVariant: 'warning'
	},
	rejected: {
		label: 'Bị từ chối',
		icon: XCircle,
		badgeVariant: 'destructive'
	}
}

export function RegistrationCard({ period, studentRegisStatus = [] }: RegistrationCardProps) {
	const navigate = useNavigate()
	const phase = period.currentPhaseDetail

	/* ---------------- Time ---------------- */
	const now = new Date()
	const end = new Date(period.endTime)
	const remainingDays = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))

	const isExpired = remainingDays <= 0

	const hasNoRegistration = studentRegisStatus.length === 0

	/* ---------------- Header ---------------- */
	const Header = (
		<CardHeader className='pb-3'>
			<div className='flex items-center justify-between'>
				<CardTitle className='flex items-center gap-2 text-lg'>
					<FileSearch className='h-5 w-5 text-primary' />
					Đăng ký đề tài {period.type === 'thesis' ? 'khóa luận' : 'nghiên cứu khoa học'}
				</CardTitle>

				<Badge variant={isExpired ? 'destructive' : 'warning'} className='gap-1'>
					<Clock className='h-3 w-3' />
					{isExpired ? 'Hết hạn' : `Còn ${remainingDays} ngày`}
				</Badge>
			</div>
		</CardHeader>
	)

	/* ---------------- Empty State ---------------- */
	if (hasNoRegistration) {
		return (
			<Card className='rounded-xl border-primary/20 bg-primary/5 p-0'>
				{Header}

				<CardContent className='space-y-4'>
					<div className='flex justify-between rounded-lg border bg-card p-4'>
						<div className='w-fit'>
							<p className='text-sm text-muted-foreground'>Trạng thái</p>
							<p className='mt-1 font-medium'>Chưa đăng ký đề tài</p>
						</div>
						<Button
							size='lg'
							className='rounded-xl'
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

	/* ---------------- Registered State ---------------- */
	return (
		<Card className='rounded-xl border-primary/20 bg-primary/5 p-0'>
			{Header}

			<CardContent className='space-y-4'>
				{/* List */}
				<div className='space-y-3'>
					{studentRegisStatus.map((reg) => {
						const config = STATUS_MAP[reg.status]
						const Icon = config.icon

						return (
							<Card key={reg._id} className='border-border p-0'>
								<CardContent className='space-y-3 p-4'>
									{/* Header */}
									<div className='flex items-start justify-between gap-3'>
										<div>
											<h4 className='text-base font-semibold leading-tight'>
												{reg.topic.titleVN}
											</h4>
											<p className='text-sm text-muted-foreground'>{reg.topic.titleEng}</p>
										</div>

										<Badge variant={config.badgeVariant} className='gap-1'>
											<Icon className='h-3 w-3' />
											{config.label}
										</Badge>
									</div>

									{/* Description */}
									<div
										className='prose prose-sm prose-p:my-1 prose-ul:my-1 prose-li:my-0 max-w-none text-muted-foreground'
										dangerouslySetInnerHTML={{ __html: reg.topic.description }}
									/>

									<div className='grid grid-cols-2 gap-3 border-t pt-2 text-sm'>
										<div>
											<p className='text-xs font-medium text-muted-foreground'>Vai trò</p>
											<p className='text-muted-foreground'>{reg.studentRole}</p>
										</div>

										<div>
											<p className='font-medium'>Ghi chú của bạn</p>
											<p className='text-muted-foreground'>{reg.studentNote}</p>
										</div>
									</div>
									{/* Lecturer Response */}
									{reg.lecturerResponse && (
										<div className='rounded-md border bg-muted/40 p-2'>
											<div className='mb-0.5 flex items-center gap-1.5 text-xs font-medium'>
												<AlertCircle className='h-4 w-4 text-primary' />
												Phản hồi của giảng viên
											</div>

											<p className='text-xs leading-snug text-muted-foreground'>
												{reg.lecturerResponse}
											</p>
										</div>
									)}
								</CardContent>
							</Card>
						)
					})}
				</div>

				{/* CTA */}

				<p className='text-center text-xs text-muted-foreground'>
					Thời hạn đăng ký: {formatDate(phase.startTime)} – {formatDate(phase.endTime)}
				</p>
			</CardContent>
		</Card>
	)
}
