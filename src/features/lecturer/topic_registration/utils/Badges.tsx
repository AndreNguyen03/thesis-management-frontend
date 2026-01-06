import { Badge } from '@/components/ui/badge'
import { Settings2, Users } from 'lucide-react'
import type { Status } from '../types'

export const StatusBadge = ({ status }: { status: Status }) => {
	switch (status) {
		case 'receiving':
			return <Badge className='border-amber-200 bg-amber-50 text-amber-700'>Đang nhận đăng ký</Badge>
		case 'full':
			return <Badge className='border-emerald-200 bg-emerald-50 text-emerald-700'>Đã đủ sinh viên</Badge>
		case 'locked':
			return <Badge className='border-slate-200 bg-slate-100 text-slate-600'>Đã khóa</Badge>
	}
}

export const ModeBadge = ({ allowApprovalManual }: { allowApprovalManual: boolean }) => {
	return !allowApprovalManual ? (
		<Badge className='flex gap-1 bg-blue-50 text-blue-600'>
			<Settings2 className='h-3 w-3' /> Tự động xét duyệt
		</Badge>
	) : (
		<Badge className='flex gap-1 bg-violet-50 text-violet-600'>
			<Users className='h-3 w-3' /> Giảng viên xét duyệt
		</Badge>
	)
}
