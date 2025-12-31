import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, FileText, UserPlus, Code, Award, BookOpen, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate, getDashboardPeriodTitle } from '@/utils/utils'
import type { GetDashboardCurrentPeriodType, StudentRegistration } from '@/models/period.model'
import React from 'react'
import { RegistrationCard } from './registration-card'
// import { AISummaryCard } from './ai-summary-card'
import { GradingResultCard } from './grading-result-card'

interface PeriodCardProps {
	period: GetDashboardCurrentPeriodType
	studentRegistration: StudentRegistration[]
}

const phases = [
	{ type: 'submit_topic', label: 'Nộp đề tài', shortLabel: 'GV nộp', icon: FileText },
	{ type: 'open_registration', label: 'Đăng ký đề tài', shortLabel: 'Đăng ký', icon: UserPlus },
	{ type: 'execution', label: 'Thực thi đề tài', shortLabel: 'Thực thi', icon: Code },
	{ type: 'completion', label: 'Chấm điểm & Kết thúc', shortLabel: 'Chấm điểm', icon: Award }
]

const phaseOrder = ['empty', 'submit_topic', 'open_registration', 'execution', 'completion']

export function PeriodCard({ period, studentRegistration }: PeriodCardProps) {
	const currentIndex = phaseOrder.indexOf(period.currentPhaseDetail.phase)

	const currentPhaseStatus = period.currentPhaseDetail.status

	const currentPhase = period.currentPhase

	const getPhaseStatus = (phaseType: string) => {
		const phaseIndex = phaseOrder.indexOf(phaseType) // current index 4, phase index: 5
		if (phaseIndex < currentIndex) return 'completed'
		if (phaseIndex === currentIndex && currentPhaseStatus === 'timeout') return 'timeout'
		if (phaseIndex > currentIndex) return 'pending'
		if (currentPhaseStatus === 'active') return 'active'
		return 'pending'
	}

	const shouldHighlightLine = (phaseId: string) => {
		const status = getPhaseStatus(phaseId)
		return status === 'completed'
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'completed':
				return <Badge className='border-success/20 bg-success/10 text-xs text-success'>Hoàn thành</Badge>
			case 'active':
				return <Badge className='border-primary/20 bg-primary/10 text-xs text-primary'>Đang thực hiện</Badge>
			case 'timeout':
				return <Badge className='border-warning/20 bg-warning/10 text-xs text-warning'>Hết thời gian</Badge>
			case 'pending':
				return (
					<Badge variant='secondary' className='text-xs'>
						Chờ
					</Badge>
				)
		}
	}

	const title = getDashboardPeriodTitle(period)

	const getStatusContent = () => {
		switch (period.currentPhaseDetail.phase) {
			case 'empty':
				return {
					title: 'Chưa bắt đầu đợt khóa luận mới',
					description: 'Ban chủ nhiệm khoa chưa mở đợt đăng ký khóa luận. Vui lòng chờ thông báo.',
					icon: <Clock className='h-5 w-5 text-muted-foreground' />,
					badge: <Badge variant='secondary'>Đang trống</Badge>
				}
			case 'submit_topic':
				return {
					title,
					description:
						'Giảng viên đang trong giai đoạn nộp đề tài. Sinh viên vui lòng chờ giai đoạn đăng ký.',
					icon: <BookOpen className='h-5 w-5 text-primary' />,
					badge: <Badge className='border-info/20 bg-info/10 text-info'>Pha nộp đề tài</Badge>
				}
			case 'open_registration':
				return {
					title,
					description:
						'Giai đoạn đăng ký đề tài đang mở. Sinh viên có thể đăng ký đề tài từ danh sách có sẵn.',
					icon: <AlertCircle className='h-5 w-5 text-warning' />,
					badge: <Badge className='border-warning/20 bg-warning/10 text-warning'>Pha đăng kí</Badge>
				}
			case 'execution':
				return {
					title,
					description: 'Bạn đang trong giai đoạn thực hiện đề tài. Hãy hoàn thành các mục tiêu đã đề ra.',
					icon: <BookOpen className='h-5 w-5 text-primary' />,
					badge: <Badge className='border-primary/20 bg-primary/10 text-primary'>Pha thực thi</Badge>
				}
			case 'completion':
				return {
					title,
					description: 'Đề tài đã được nộp và đang chờ hội đồng chấm điểm.',
					icon: <BookOpen className='h-5 w-5 text-info' />,
					badge: <Badge className='border-info/20 bg-info/10 text-info'>Pha Chấm điểm & kết thúc</Badge>
				}
			// case 'completed':
			// 	return {
			// 		title: 'Đợt Khóa luận Học kỳ 2 - 2024',
			// 		description: 'Khóa luận đã hoàn thành. Đề tài đã được lưu vào thư viện số của trường.',
			// 		icon: <BookOpen className='h-5 w-5 text-success' />,
			// 		badge: <Badge className='border-success/20 bg-success/10 text-success'>Hoàn thành</Badge>
			// 	}
		}
	}

	const content = getStatusContent()

	const getPhaseTimeNode = (phaseType: string) => {
		const phase = period.phases.find((p) => p.phase === phaseType)

		if (!phase) {
			return <span className='text-muted-foreground'>Chưa thiết lập</span>
		}

		if (phase.startTime && phase.endTime) {
			return (
				<>
					<span>Từ {formatDate(phase.startTime)}</span>
					<br />
					<span>Đến {formatDate(phase.endTime)}</span>
				</>
			)
		}

		if (phase.startTime) {
			return (
				<>
					<span>{formatDate(phase.startTime)}</span>
					<span className='text-muted-foreground'>—</span>
				</>
			)
		}

		return <span className='text-muted-foreground'>Chưa thiết lập</span>
	}

	return (
		<Card className='w-full rounded-xl border-border p-0'>
			<CardHeader className='pb-2'>
				<div className='flex items-center justify-between border-border'>
					<div className='flex items-center gap-3'>
						{content.icon}
						<span className='text-lg font-semibold text-foreground'>{content.title}</span>
					</div>
					{content.badge}
				</div>
			</CardHeader>
			<CardContent className='pt-0'>
				<p className='text-sm leading-relaxed text-muted-foreground'>{content.description}</p>
			</CardContent>
			<CardContent className='py-6'>
				<div className='flex w-full items-center'>
					{phases.map((phase, index) => {
						const status = getPhaseStatus(phase.type)
						const Icon = phase.icon
						return (
							<React.Fragment key={phase.type}>
								{/* NODE */}
								<div className='flex flex-col items-center gap-2'>
									<div
										className={cn(
											'flex h-10 w-10 items-center justify-center rounded-full',
											status === 'completed' && 'bg-success/10 text-success',
											status === 'active' && 'bg-primary text-primary-foreground',
											status === 'pending' && 'bg-muted text-muted-foreground',
											status === 'timeout' && 'bg-warning/20 text-warning'
										)}
									>
										{status === 'completed' ? (
											<Check className='h-5 w-5' />
										) : (
											<Icon className='h-5 w-5' />
										)}
									</div>

									<div className='text-center'>
										<p className='text-xs font-medium'>
											<span className='hidden sm:inline'>{phase.label}</span>
											<span className='sm:hidden'>{phase.shortLabel}</span>
										</p>
										<div className='mt-1'>{getStatusBadge(status)}</div>
										{/* TIME */}
										<p className='mt-1 text-[10px] text-muted-foreground'>
											{getPhaseTimeNode(phase.type)}
										</p>
									</div>
								</div>

								{/* LINE (chỉ render nếu không phải item cuối) */}
								{index < phases.length - 1 && (
									<div
										className={cn(
											'mx-2 h-0.5 flex-1',
											shouldHighlightLine(phase.type) ? 'bg-primary/50' : 'bg-muted'
										)}
									/>
								)}
							</React.Fragment>
						)
					})}
				</div>
			</CardContent>
			<CardContent>
				{currentPhase === 'open_registration' && (
					<RegistrationCard period={period} studentRegisStatus={studentRegistration} />
				)}
				{/* {currentPhase === 'execution' && <AISummaryCard />} */}
				{currentPhase === 'completion' &&
					period.topics.map((topic) => {
						return (
							<React.Fragment key={topic.titleVN}>
								<GradingResultCard topic={topic} />
							</React.Fragment>
						)
					})}
			</CardContent>
		</Card>
	)
}
