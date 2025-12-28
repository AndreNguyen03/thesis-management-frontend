import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, Pause } from 'lucide-react'
import type { OverdueTopic, PausedOrDelayedTopic, PendingLecturerReviewTopic } from '@/models/period-phase.models'

type ActionCardType = 'overdue' | 'paused-delayed' | 'pending-review'   

type ActionCardItem = OverdueTopic | PausedOrDelayedTopic | PendingLecturerReviewTopic

interface ActionCardProps {
	type: ActionCardType
	count: number
	items: ActionCardItem[]
}

const cardConfig = {
	overdue: {
		titleVN: 'Đề tài chưa nộp báo cáo cuối kỳ',
		titleEng: 'Topics overdue for final report submission',
		icon: AlertCircle,
		iconColor: 'text-red-500',
		badgeVariant: 'destructive' as const,
		bgColor: 'bg-red-50',
		borderColor: 'border-red-200'
	},
	'paused-delayed': {
		titleVN: 'Đề tài tạm dừng/bị delay',
		titleEng: 'Topics paused or delayed',
		icon: Pause,
		iconColor: 'text-orange-500',
		badgeVariant: 'warning' as const,
		bgColor: 'bg-orange-50',
		borderColor: 'border-orange-200'
	},
	'pending-review': {
		titleVN: 'Đề tài chờ giảng viên đánh giá',
		titleEng: 'Topics pending lecturer review',
		icon: Clock,
		iconColor: 'text-blue-500',
		badgeVariant: 'default' as const,
		bgColor: 'bg-blue-50',
		borderColor: 'border-blue-200'
	}
}

export function ActionCard({ type, count, items }: ActionCardProps) {
	const config = cardConfig[type]
	const Icon = config.icon

	return (
		<Card className={`${config.bgColor} ${config.borderColor} border-2`}>
			<div className='p-4'>
				{/* Header */}
				<div className='mb-4 flex items-center justify-between'>
					<div className='flex items-center gap-2'>
						<Icon className={`h-5 w-5 ${config.iconColor}`} />
						<h3 className='text-lg font-semibold'>{config.titleVN}</h3>
						<h3 className='text-lg font-semibold'>{config.titleEng}</h3>
					</div>
					<Badge variant={config.badgeVariant}>{count} đề tài</Badge>
				</div>

				{/* Items List */}
				<div className='space-y-3'>
					{items.map((item, index) => (
						<div key={item.topicId} className='rounded-lg border border-gray-200 bg-white p-3 shadow-sm'>
							<div className='flex items-start justify-between gap-3'>
								<div className='min-w-0 flex-1'>
									<div className='mb-2 flex items-center gap-2'>
										<span className='text-sm font-medium text-gray-500'>#{index + 1}</span>
										<h4 className='truncate font-medium text-gray-900'>{item.titleVN}</h4>
										<h4 className='truncate font-medium text-gray-900'>{item.titleEng}</h4>
									</div>

									<div className='space-y-1 text-sm text-gray-600'>
										<div>
											<span className='font-medium'>ID:</span> {item.topicId}
										</div>
										<div>
											<span className='font-medium'>Giảng viên:</span> {item.lecturerEmail}
										</div>
										{item.studentIds && item.studentIds.length > 0 && (
											<div>
												<span className='font-medium'>Sinh viên:</span> {item.studentIds.length}{' '}
												sinh viên
											</div>
										)}
										{'studentEmails' in item &&
											item.studentEmails &&
											item.studentEmails.length > 0 && (
												<div className='mt-1 text-xs text-gray-500'>
													{item.studentEmails.join(', ')}
												</div>
											)}
										{type === 'paused-delayed' && 'status' in item && (
											<div>
												<Badge variant={item.status === 'paused' ? 'secondary' : 'outline'}>
													{item.status === 'paused' ? 'Tạm dừng' : 'Delay'}
												</Badge>
												{item.reason && (
													<span className='ml-2 text-xs italic'>Lý do: {item.reason}</span>
												)}
											</div>
										)}
										{type === 'pending-review' && 'daysPending' in item && (
											<div>
												<span className='font-medium'>Chờ đợi:</span>{' '}
												<span
													className={item.daysPending > 7 ? 'font-semibold text-red-600' : ''}
												>
													{item.daysPending} ngày
												</span>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>
					))}
				</div>

				{items.length === 0 && <div className='py-4 text-center text-gray-500'>Không có đề tài nào</div>}
			</div>
		</Card>
	)
}
