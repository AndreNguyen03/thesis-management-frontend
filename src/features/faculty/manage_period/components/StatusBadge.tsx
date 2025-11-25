import { Badge, type BadgeVariant } from '@/components/ui/badge'
import type { TopicStatus } from '@/models/topic'

interface StatusBadgeProps {
	status: TopicStatus
}

const statusConfig: Record<TopicStatus, { label: string; variant: BadgeVariant }> = {
	// Phase 1
	draft: { label: 'Bản nháp', variant: 'gray' },
	submitted: { label: 'Đã nộp', variant: 'blue' },
	under_review: { label: 'Đang xét duyệt', variant: 'lightBlue' },
	approved: { label: 'Đã phê duyệt', variant: 'success' },
	rejected: { label: 'Bị từ chối', variant: 'destructive' },

	// Phase 2
	pending_registration: { label: 'Chờ đăng ký', variant: 'gray' },
	registered: { label: 'Đã đăng ký', variant: 'registered' },
	full: { label: 'Đã đủ', variant: 'outline' }, // hoặc 'graybold' nếu bạn muốn đậm hơn
	cancelled: { label: 'Đã hủy', variant: 'destructive' },

	// Phase 3
	in_progress: { label: 'Đang thực hiện', variant: 'blue' },
	delayed: { label: 'Trễ tiến độ', variant: 'warning' }, // warning bạn đang dùng ở StatusBadge
	paused: { label: 'Tạm dừng', variant: 'secondary' },
	submitted_for_review: { label: 'Đã nộp xét duyệt', variant: 'lightBlue' },
	awaiting_evaluation: { label: 'Chờ đánh giá', variant: 'warning' },

	// Phase 4
	graded: { label: 'Đã chấm điểm', variant: 'success' },
	reviewed: { label: 'Đã nhận xét', variant: 'success' },
	archived: { label: 'Lưu trữ', variant: 'graybold' },
	rejected_final: { label: 'Không đạt', variant: 'destructive' }
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
	const config = statusConfig[status]

	return (
		<Badge variant={config.variant} className='font-medium'>
			{config.label}
		</Badge>
	)
}
