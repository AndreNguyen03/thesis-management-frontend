import type { MilestoneStatus, Submission } from '@/models/milestone.model'
import type { Task } from '@/models/todolist.model'
import { AlertCircle, CheckCircle2, Circle, Clock, FileText, History } from 'lucide-react'

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
export const calculateProgress = (reqs: Task[]) => {
	// if (!reqs.length) return 0
	// //const completed = reqs.filter((r) => r.isCompleted).length
	// return Math.round((completed / reqs.length) * 100)
}

const getStatusColor = (status: MilestoneStatus) => {
	switch (status) {
		case 'Todo':
			return 'bg-slate-100 text-slate-600 border-slate-200'
		case 'Completed':
			return 'bg-emerald-100 text-emerald-700 border-emerald-200'
		case 'Pending Review':
			return 'bg-yellow-100 text-yellow-700 border-yellow-200'
		case 'In Progress':
			return 'bg-indigo-100 text-indigo-700 border-indigo-200'
		case 'Needs Revision':
			return 'bg-red-100 text-red-700 border-red-200' // Renamed from Returned
		case 'Overdue':
			return 'bg-orange-100 text-orange-700 border-orange-200'
		default:
			return 'bg-slate-100 text-slate-600 border-slate-200'
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
	if (status === 'Completed') Icon = CheckCircle2
	if (status === 'Pending Review' || status === 'In Progress') Icon = Clock
	if (status === 'Needs Revision' || status === 'Overdue') Icon = AlertCircle

	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}
		>
			<Icon className='h-3.5 w-3.5' />
			{label}
		</span>
	)
}
