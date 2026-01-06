import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, FileText, UserPlus, Code, Award, BookOpen, AlertCircle, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/utils'
import type { DashboardType, StudentTopicDashboard } from '@/models/period.model'
import React from 'react'
import { RegistrationCard } from './StudentRegistrationCard'
import { GradingResultCard } from './grading-result-card'
import { TopicExecutionCard } from './TopicExecutionCard'

interface StudentPeriodCardProps {
	dashboardData: DashboardType
}

const phases = [
	{ type: 'submit_topic', label: 'Nộp đề tài', shortLabel: 'GV nộp', icon: FileText },
	{ type: 'open_registration', label: 'Đăng ký đề tài', shortLabel: 'Đăng ký', icon: UserPlus },
	{ type: 'execution', label: 'Thực thi đề tài', shortLabel: 'Thực thi', icon: Code },
	{ type: 'completion', label: 'Chấm điểm & Kết thúc', shortLabel: 'Chấm điểm', icon: Award }
]

const phaseOrder = ['empty', 'submit_topic', 'open_registration', 'execution', 'completion']

export function StudentPeriodCard({ dashboardData }: StudentPeriodCardProps) {
	const hasNoPeriod =
		!dashboardData.currentPhase ||
		!dashboardData.currentPhaseDetail ||
		!dashboardData.phases ||
		dashboardData.phases.length === 0

	const periodTypeLabel = dashboardData.type === 'thesis' ? 'Đợt Khóa luận' : 'Đợt Nghiên cứu khoa học'

	if (hasNoPeriod) {
		return (
			<Card className='w-full rounded-xl border-border p-0'>
				<CardHeader>
					<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
						<div className='flex items-center gap-3'>
							<Clock className='h-5 w-5 text-muted-foreground' />
							<span className='text-lg font-semibold text-foreground'>
								{dashboardData.title ?? `${periodTypeLabel} chưa có đợt`}
							</span>
						</div>
						<Badge variant='secondary'>{periodTypeLabel}</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<p className='text-sm text-muted-foreground'>
						{dashboardData.description ??
							`Hiện tại khoa chưa mở ${periodTypeLabel.toLowerCase()}. Vui lòng quay lại sau.`}
					</p>
					<div className='mt-4'>
						<Badge variant='secondary'>Chưa mở đợt</Badge>
					</div>
				</CardContent>
			</Card>
		)
	}

	const currentIndex = phaseOrder.indexOf(dashboardData.currentPhaseDetail.phase)
	const currentPhaseStatus = dashboardData.currentPhaseDetail.status
	const currentPhase = dashboardData.currentPhase

	const getPhaseStatus = (phaseType: string) => {
		const phaseIndex = phaseOrder.indexOf(phaseType)
		if (phaseIndex < currentIndex) return 'completed'
		if (phaseIndex === currentIndex && currentPhaseStatus === 'timeout') return 'timeout'
		if (phaseIndex > currentIndex) return 'pending'
		if (currentPhaseStatus === 'active') return 'active'
		return 'pending'
	}

	const shouldHighlightLine = (phaseId: string) => getPhaseStatus(phaseId) === 'completed'

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

	const getStatusContent = () => {
		switch (dashboardData.currentPhaseDetail.phase) {
			case 'empty':
				return {
					title: dashboardData.title,
					description: dashboardData.description,
					icon: <Clock className='h-5 w-5 text-muted-foreground' />,
					badge: <Badge variant='secondary'>Đang trống</Badge>
				}
			case 'submit_topic':
				return {
					title: dashboardData.title,
					description: dashboardData.description,
					icon: <BookOpen className='h-5 w-5 text-primary' />,
					badge: <Badge className='border-info/20 bg-info/10 text-info'>Pha nộp đề tài</Badge>
				}
			case 'open_registration':
				return {
					title: dashboardData.title,
					description: dashboardData.description,
					icon: <AlertCircle className='h-5 w-5 text-warning' />,
					badge: <Badge className='border-warning/20 bg-warning/10 text-warning'>Pha đăng kí</Badge>
				}
			case 'execution':
				return {
					title: dashboardData.title,
					description: dashboardData.description,
					icon: <BookOpen className='h-5 w-5 text-primary' />,
					badge: <Badge className='border-primary/20 bg-primary/10 text-primary'>Pha thực thi</Badge>
				}
			case 'completion':
				return {
					title: dashboardData.title,
					description: dashboardData.description,
					icon: <BookOpen className='h-5 w-5 text-info' />,
					badge: <Badge className='border-info/20 bg-info/10 text-info'>Pha Chấm điểm & kết thúc</Badge>
				}
		}
	}

	const content = getStatusContent()

	const getPhaseTimeNode = (phaseType: string) => {
		const phase = dashboardData.phases.find((p) => p.phase === phaseType)
		if (!phase) return <span className='text-muted-foreground'>Chưa thiết lập</span>
		if (phase.startTime && phase.endTime)
			return (
				<>
					Từ {formatDate(phase.startTime)}
					<br />
					Đến {formatDate(phase.endTime)}
				</>
			)
		if (phase.startTime)
			return (
				<>
					{formatDate(phase.startTime)} <span className='text-muted-foreground'>—</span>
				</>
			)
		return <span className='text-muted-foreground'>Chưa thiết lập</span>
	}

	return (
		<Card className='w-full rounded-xl border-border p-0'>
			<CardHeader className='pb-2'>
				<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
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

			<CardContent className='overflow-x-auto py-6'>
				<div className='flex w-full min-w-max items-center gap-2'>
					{phases.map((phase, index) => {
						const status = getPhaseStatus(phase.type)
						const Icon = phase.icon
						return (
							<React.Fragment key={phase.type}>
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
										<p className='mt-1 text-[10px] text-muted-foreground'>
											{getPhaseTimeNode(phase.type)}
										</p>
									</div>
								</div>
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
				{currentPhase === 'open_registration' && <RegistrationCard dashboardData={dashboardData} />}
				{currentPhase === 'execution' && <TopicExecutionCard dashboardData={dashboardData} />}
				{currentPhase === 'completion' &&
					(dashboardData.topicData as StudentTopicDashboard[]).map((topic) => (
						<GradingResultCard key={topic.titleVN} topic={topic} />
					))}
			</CardContent>
		</Card>
	)
}
