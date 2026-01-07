import React from 'react'
import { useNavigate } from 'react-router-dom'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui'

import {
	Check,
	FileText,
	UserPlus,
	Code,
	Award,
	BookOpen,
	AlertCircle,
	Clock,
	Settings,
	Plus,
	Lock,
	ArrowRight
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { formatDate } from '@/utils/utils'
import type { FacultyDashboardType } from '@/models/period.model'

/* ---------------------------------- Types --------------------------------- */

interface FacultyPeriodCardProps {
	dashboardData: FacultyDashboardType
}

/* --------------------------------- Consts --------------------------------- */

const phases = [
	{ type: 'submit_topic', label: 'Nộp đề tài', shortLabel: 'GV nộp', icon: FileText },
	{ type: 'open_registration', label: 'Đăng ký đề tài', shortLabel: 'Đăng ký', icon: UserPlus },
	{ type: 'execution', label: 'Thực thi đề tài', shortLabel: 'Thực thi', icon: Code },
	{ type: 'completion', label: 'Chấm điểm & Kết thúc', shortLabel: 'Chấm điểm', icon: Award }
]

const phaseOrder = ['empty', 'submit_topic', 'open_registration', 'execution', 'completion']

/* ------------------------------ Component ---------------------------------- */

export function FacultyPeriodCard({ dashboardData }: FacultyPeriodCardProps) {
	const navigate = useNavigate()

	/* --------------------------- State flags --------------------------- */

	const isNoPeriod = !dashboardData || !dashboardData._id
	console.log('dashboardData', dashboardData)

	const isNeedSetupPhase =
		!!dashboardData?._id &&
		(dashboardData.currentPhase === 'empty' || !dashboardData.phases || dashboardData.phases.length === 0)

	const isFinished = dashboardData?.status === 'completed'

	const isActivePeriod = !!dashboardData?._id && !isNeedSetupPhase && !isFinished

	const periodTypeName = dashboardData.type === 'thesis' ? 'Khóa luận' : 'Nghiên cứu khoa học'

	/* ----------------------------- CTA block ---------------------------- */

	const renderAction = () => {
		const baseClasses = 'flex flex-col gap-4 sm:flex-row sm:justify-between rounded-lg p-4'

		// 🔴 Chưa có đợt
		if (isNoPeriod) {
			return (
				<div className={cn(baseClasses, 'border border-dashed bg-muted/30')}>
					<div>
						<h4 className='text-sm font-semibold'>Chưa có đợt đề tài {periodTypeName}</h4>
						<p className='mt-1 text-xs text-muted-foreground'>
							Khoa hiện chưa mở đợt đề tài {periodTypeName} nào. Hãy tạo đợt mới để bắt đầu.
						</p>
					</div>

					<Button onClick={() => navigate('/manage-period')} className='sm:ml-4'>
						<Plus className='h-4 w-4' />
						Tạo đợt đề tài
					</Button>
				</div>
			)
		}

		// 🟡 Chưa thiết lập pha
		if (isNeedSetupPhase) {
			return (
				<div className={cn(baseClasses, 'border border-dashed bg-muted/30')}>
					<div>
						<h4 className='text-sm font-semibold'>Chưa thiết lập pha</h4>
						<p className='mt-1 text-xs text-muted-foreground'>
							Đợt đề tài đã được tạo nhưng chưa cấu hình quy trình thực hiện.
						</p>
					</div>

					<Button onClick={() => navigate(`/period/${dashboardData._id}`)} className='sm:ml-4'>
						<Settings className='mr-2 h-4 w-4' />
						Thiết lập các pha
					</Button>
				</div>
			)
		}

		// ⚫ Đợt đã kết thúc
		if (isFinished) {
			return (
				<div className={cn(baseClasses, 'border bg-muted/20')}>
					<div>
						<h4 className='text-sm font-semibold text-muted-foreground'>Đợt đề tài đã kết thúc</h4>
						<p className='mt-1 text-xs text-muted-foreground'>
							Đợt này đã hoàn thành và không còn thao tác nào khả dụng.
						</p>
					</div>

					<Button disabled className='sm:ml-4'>
						<Lock className='mr-2 h-4 w-4' />
						Đã kết thúc
					</Button>
				</div>
			)
		}

		// 🟢 Đang hoạt động
		return (
			<div className={cn(baseClasses, 'border bg-background')}>
				<div>
					<h4 className='text-sm font-semibold'>Đợt đang hoạt động</h4>
					<p className='mt-1 text-xs text-muted-foreground'>
						Xem chi tiết tiến trình và thao tác quản lý đợt đề tài.
					</p>
				</div>

				<Button onClick={() => navigate(`/period/${dashboardData._id}`)} className='sm:ml-4'>
					<ArrowRight className='h-4 w-4' />
					Xem chi tiết đợt
				</Button>
			</div>
		)
	}

	/* -------------------------- Header content -------------------------- */

	const content = dashboardData?.currentPhaseDetail
		? getStatusContent()
		: {
				title: `Chưa có đợt đề tài ${periodTypeName}`,
				description: `Khoa hiện chưa mở đợt đề tài ${periodTypeName} nào.`,
				icon: <Clock className='h-5 w-5 text-muted-foreground' />,
				badge: <Badge variant='secondary'>Chưa mở</Badge>
			}

	/* -------------------------- Phase helpers --------------------------- */

	const currentIndex = dashboardData?.currentPhaseDetail
		? phaseOrder.indexOf(dashboardData.currentPhaseDetail.phase)
		: -1

	const currentPhaseStatus = dashboardData?.currentPhaseDetail?.status

	const getPhaseStatus = (phaseType: string) => {
		if (currentIndex === -1) return 'pending'

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
			default:
				return (
					<Badge variant='secondary' className='text-xs'>
						Chờ
					</Badge>
				)
		}
	}

	function getStatusContent() {
		switch (dashboardData.currentPhaseDetail.phase) {
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
					badge: <Badge className='border-warning/20 bg-warning/10 text-warning'>Pha đăng ký</Badge>
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
					badge: <Badge className='border-info/20 bg-info/10 text-info'>Chấm điểm & kết thúc</Badge>
				}
			default:
				return {
					title: dashboardData.title,
					description: dashboardData.description,
					icon: <Clock className='h-5 w-5 text-muted-foreground' />,
					badge: <Badge variant='secondary'>Đang trống</Badge>
				}
		}
	}

	const getPhaseTimeNode = (phaseType: string) => {
		const phase = dashboardData?.phases?.find((p) => p.phase === phaseType)
		if (!phase) return <span className='text-muted-foreground'>Chưa thiết lập</span>

		if (phase.startTime && phase.endTime) {
			return (
				<>
					<span>Từ {formatDate(phase.startTime)}</span>
					<br />
					<span>Đến {formatDate(phase.endTime)}</span>
				</>
			)
		}

		return <span className='text-muted-foreground'>Chưa thiết lập</span>
	}

	/* -------------------------------- Render ------------------------------- */

	return (
		<Card className='w-full rounded-xl border-border p-0'>
			<CardHeader className='flex flex-col gap-2 pb-2 sm:flex-row sm:items-center sm:justify-between'>
				<div className='flex items-center gap-3'>
					{content.icon}
					<span className='text-lg font-semibold'>{content.title}</span>
				</div>
				{content.badge}
			</CardHeader>

			<CardContent className='pt-0'>
				<p className='text-sm text-muted-foreground'>{content.description}</p>
			</CardContent>

			{isActivePeriod && (
				<CardContent className='overflow-x-auto py-4'>
					<div className='flex min-w-max items-center gap-4'>
						{phases.map((phase, index) => {
							const status = getPhaseStatus(phase.type)
							const Icon = phase.icon

							return (
								<React.Fragment key={phase.type}>
									<div className='flex min-w-[80px] flex-col items-center gap-1'>
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

										<p className='text-center text-[10px] font-medium'>{phase.shortLabel}</p>
										{getStatusBadge(status)}
										<p className='mt-1 text-center text-[9px] text-muted-foreground'>
											{getPhaseTimeNode(phase.type)}
										</p>
									</div>

									{/* Highlight line giữa các pha */}
									{index < phases.length - 1 && (
										<div
											className={cn(
												'mt-5 h-0.5 flex-1',
												shouldHighlightLine(phase.type) ? 'bg-primary/50' : 'bg-muted'
											)}
										/>
									)}
								</React.Fragment>
							)
						})}
					</div>
				</CardContent>
			)}

			<CardContent>{renderAction()}</CardContent>
		</Card>
	)
}
