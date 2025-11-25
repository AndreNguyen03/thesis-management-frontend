import { Badge } from '@/components/ui/badge'
import type { PeriodPhaseName } from '@/models/topic'

interface PhaseBadgeProps {
	phase: PeriodPhaseName
}

const phaseConfig: Record<PeriodPhaseName, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
	empty: { label: 'Chưa bắt đầu', variant: 'secondary' },
	submit_topic: { label: 'Nộp đề tài', variant: 'default' },
	open_registration: { label: 'Đăng ký', variant: 'default' },
	execution: { label: 'Thực hiện', variant: 'default' },
	completion: { label: 'Hoàn thành', variant: 'default' }
}

export const PhaseBadge = ({ phase }: PhaseBadgeProps) => {
	const config = phaseConfig[phase]

	return (
		<Badge variant={config.variant} className='font-medium'>
			{config.label}
		</Badge>
	)
}
