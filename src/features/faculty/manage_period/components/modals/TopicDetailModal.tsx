import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Badge, type BadgeVariant } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import type { Topic } from '@/models/topic'
import { Calendar, User, FileText, GraduationCap, TrendingUp, Folder } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { TopicStatus } from '@/models/topic'

interface TopicDetailModalProps {
	open: boolean
	onOpenChange: (open: boolean) => void
	topic: Topic | null
}

export function TopicDetailModal({ open, onOpenChange, topic }: TopicDetailModalProps) {
	if (!topic) return null

	// ------------------------------
	// 🔰 Status Badge Mapping (chuẩn topic.status)
	// ------------------------------
	const TOPIC_STATUS_BADGE_CONFIG: Record<TopicStatus, { label: string; variant: BadgeVariant }> = {
		// Phase 1
		draft: { label: 'Bản nháp', variant: 'secondary' },
		submitted: { label: 'Đã nộp', variant: 'default' },
		under_review: { label: 'Đang xét duyệt', variant: 'warning' },
		approved: { label: 'Phê duyệt', variant: 'success' },
		rejected: { label: 'Từ chối', variant: 'destructive' },

		// Phase 2
		pending_registration: { label: 'Chờ đăng ký', variant: 'secondary' },
		registered: { label: 'Đã đăng ký', variant: 'registered' },
		full: { label: 'Đủ số lượng', variant: 'warning' },
		cancelled: { label: 'Đã hủy', variant: 'destructive' },

		// Phase 3
		in_progress: { label: 'Đang thực hiện', variant: 'blue' },
		delayed: { label: 'Trễ tiến độ', variant: 'warning' },
		paused: { label: 'Tạm dừng', variant: 'gray' },
		submitted_for_review: { label: 'Chờ duyệt báo cáo', variant: 'lightBlue' },
		awaiting_evaluation: { label: 'Chờ chấm điểm', variant: 'warning' },

		// Phase 4
		graded: { label: 'Đã chấm điểm', variant: 'success' },
		reviewed: { label: 'Đã đánh giá', variant: 'success' },
		archived: { label: 'Lưu trữ', variant: 'graybold' },
		rejected_final: { label: 'Từ chối cuối', variant: 'destructive' }
	}

	const StatusBadge = ({ status }: { status: TopicStatus }) => {
		const config = TOPIC_STATUS_BADGE_CONFIG[status]

		// fallback (type-safe)
		if (!config) {
			return <Badge variant='default'>{status}</Badge>
		}

		return <Badge variant={config.variant}>{config.label}</Badge>
	}

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className='sm:max-w-[700px]'>
				<DialogHeader>
					<DialogTitle className='text-xl'>Chi tiết đề tài</DialogTitle>
				</DialogHeader>

				<ScrollArea className='max-h-[600px] pr-4'>
					<div className='space-y-6 py-4'>
						{/* Title + Status */}
						<div className='flex items-start justify-between gap-4'>
							<h3 className='text-lg font-semibold leading-tight'>{topic.titleVN}</h3>
							<StatusBadge status={topic.currentStatus} />
						</div>

						<Separator />

						{/* Giảng viên */}
						{topic.lecturers && topic.lecturers.length > 0 && (
							<Section
								icon={<User className='h-4 w-4' />}
								label='Giảng viên hướng dẫn'
								content={topic.lecturers.map((l) => l.fullName).join(', ')}
							/>
						)}

						{/* Sinh viên */}
						{topic.students && topic.students.length > 0 && (
							<Section
								icon={<GraduationCap className='h-4 w-4' />}
								label='Sinh viên thực hiện'
								content={topic.students.map((s) => s.fullName).join(', ')}
							/>
						)}

						{/* Điểm */}
						{topic.grade?.averageScore != null && (
							<Section
								icon={<TrendingUp className='h-4 w-4' />}
								label='Điểm trung bình'
								content={`${topic.grade.averageScore}/10`}
								bold
							/>
						)}

						{/* File đính kèm */}
						{topic.fileIds?.length > 0 && (
							<Section
								icon={<Folder className='h-4 w-4' />}
								label='File đính kèm'
								content={
									<div className='space-y-1'>
										{topic.fileIds.map((f) => (
											<div key={f} className='flex items-center gap-2 text-sm text-primary'>
												<FileText className='h-4 w-4' />
												<span>{f}</span>
											</div>
										))}
									</div>
								}
							/>
						)}

						{/* Mô tả */}
						<Section
							icon={<FileText className='h-4 w-4' />}
							label='Mô tả đề tài'
							content={topic.description || 'Chưa có mô tả.'}
							muted
						/>

						{/* Phase hiện tại */}
						<Section
							icon={<Calendar className='h-4 w-4' />}
							label='Giai đoạn hiện tại'
							content={topic.currentPhase}
						/>
					</div>
				</ScrollArea>
			</DialogContent>
		</Dialog>
	)
}

/* ——————————————— */
/*  Small UI helpers */
/* ——————————————— */
const Section = ({
	icon,
	label,
	content,
	bold,
	muted
}: {
	icon: React.ReactNode
	label: string
	content: React.ReactNode
	bold?: boolean
	muted?: boolean
}) => {
	if (!content) return null

	return (
		<div className='space-y-2'>
			<div className='flex items-center gap-2 text-sm font-medium'>
				{icon}
				<span>{label}</span>
			</div>
			<div
				className={cn(
					'pl-6 text-sm',
					bold ? 'text-lg font-semibold' : '',
					muted ? 'leading-relaxed text-muted-foreground' : 'text-foreground'
				)}
			>
				{content}
			</div>
		</div>
	)
}
