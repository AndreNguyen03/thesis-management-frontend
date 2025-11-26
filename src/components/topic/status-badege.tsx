import { Badge } from '@/components/ui/badge'
import type { TopicStatus } from '@/models/period.model';

interface StatusBadgeProps {
	status: TopicStatus
}

const statusConfig: Record<
	TopicStatus,
	{ label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
	// Phase 1
	draft: { label: 'Bản nháp', variant: 'secondary' },
	submitted: { label: 'Đã nộp', variant: 'default' },
	under_review: { label: 'Đang xét duyệt', variant: 'warning' },
	approved: { label: 'Đã phê duyệt', variant: 'success' },
	rejected: { label: 'Bị từ chối', variant: 'destructive' },
	// Phase 2
	pending_registration: { label: 'Chờ đăng ký', variant: 'secondary' },
	registered: { label: 'Đã đăng ký', variant: 'success' },
	full: { label: 'Đã đủ', variant: 'default' },
	cancelled: { label: 'Đã hủy', variant: 'destructive' },
	// Phase 3
	in_progress: { label: 'Đang thực hiện', variant: 'default' },
	delayed: { label: 'Trễ tiến độ', variant: 'warning' },
	paused: { label: 'Tạm dừng', variant: 'secondary' },
	submitted_for_review: { label: 'Đã nộp xét duyệt', variant: 'default' },
	awaiting_evaluation: { label: 'Chờ đánh giá', variant: 'warning' },
	// Phase 4
	graded: { label: 'Đã chấm điểm', variant: 'success' },
	reviewed: { label: 'Đã nhận xét', variant: 'success' },
	archived: { label: 'Lưu trữ', variant: 'secondary' },
	rejected_final: { label: 'Không đạt', variant: 'destructive' }
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
	const config = statusConfig[status]

	return (
		<Badge variant={config.variant as any} className='font-medium'>
			{config.label}
		</Badge>
	)
}
