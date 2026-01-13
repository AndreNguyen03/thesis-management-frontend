import type { MilestoneStatus } from '@/models/milestone.model'
import { AlertCircle, CheckCircle2, Circle, Clock  } from 'lucide-react'

const getStatusLabel = (status: MilestoneStatus) => {
	const map: Record<MilestoneStatus, string> = {
		Todo: 'Mới',
		'In Progress': 'Đang làm',
		'Pending Review': 'Chờ duyệt',
		Completed: 'Hoàn thành',
		'Needs Revision': 'Cần sửa lại', // Renamed
		Overdue: 'Quá hạn'
	}
	return map[status]
}

const getStatusColor = (status: MilestoneStatus) => {
	switch (status) {
		case 'Todo':
			return 'bg-slate-100 border-slate-200'
		case 'Completed':
			return 'bg-emerald-100 border-emerald-200'
		case 'Pending Review':
			return 'bg-yellow-100 border-yellow-200'
		case 'In Progress':
			return 'bg-indigo-100 border-indigo-200'
		case 'Needs Revision':
			return 'bg-red-100 border-red-200'
		case 'Overdue':
			return 'bg-orange-100 border-orange-200'
		default:
			return 'bg-slate-100 border-slate-200'
	}
}

export const ProgressBar = ({ progress, className = '' }: { progress: number; className?: string }) => (
	<div className={`h-2 w-full overflow-hidden rounded-full bg-slate-100 ${className}`}>
		<div
			className={`h-full transition-all duration-500 ease-out ${
				progress === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
			}`}
			style={{ width: `${progress}%` }}
		/>
	</div>
)

export const StatusBadge = ({ status }: { status: MilestoneStatus }) => {
	const styles = getStatusColor(status)
	const label = getStatusLabel(status)

	let Icon = Circle
	let iconColor = 'text-slate-500'
	let textColor = 'text-slate-700'

	switch (status) {
		case 'Completed':
			Icon = CheckCircle2
			iconColor = 'text-emerald-600'
			textColor = 'text-emerald-800'
			break

		case 'In Progress':
		case 'Pending Review':
			Icon = Clock
			iconColor = 'text-indigo-600'
			textColor = 'text-indigo-800'
			break

		case 'Needs Revision':
			Icon = AlertCircle
			iconColor = 'text-red-600'
			textColor = 'text-red-800'
			break

		case 'Overdue':
			Icon = AlertCircle
			iconColor = 'text-orange-600'
			textColor = 'text-orange-800'
			break
	}

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles} ${textColor} `}
		>
			<Icon className={`h-3.5 w-3.5 ${iconColor}`} />
			{label}
		</span>
	)
}
