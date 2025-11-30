import { StatsCards } from './StatsCards'
import { getLabelForStatus, getPhaseStats } from '../utils'
import { motion } from 'framer-motion'
import type { PendingAction, PeriodPhase } from '@/models/period-phase.models'
import { useMemo, useState, type SetStateAction , type Dispatch} from 'react'
import { type GeneralTopic, type TopicStatus } from '@/models'
import type { PhaseType } from '@/models/period.model'
// import { toast } from '@/hooks/use-toast'
import { useLecGetStatsPeriodQuery } from '@/services/periodApi'
import { PhaseHeader } from './PhaseHeader'
import { PhaseActionsBox } from './PhaseActionsBox'
import { TopicsTable } from './TopicsTable'
import { useGetTopicsInPhaseQuery } from '@/services/topicApi'
import { PhaseSettingsModal } from './modals/PhaseSettingsModal'
interface PhaseContentProps {
	phaseDetail: PeriodPhase
	currentPhase: PhaseType
	periodId: string
	lecturers?: string[]
    onPhaseSettingOpen: Dispatch<SetStateAction<boolean>>
    phaseSettingOpen: boolean
}

export function PhaseContent({ phaseDetail, currentPhase, periodId, phaseSettingOpen, onPhaseSettingOpen }: PhaseContentProps) {
	// // stats theo phase.phase
	const { data: statsData } = useLecGetStatsPeriodQuery({ periodId, phase: currentPhase })

	const stats = getPhaseStats(statsData, phaseDetail.phase)

	const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all')


	const { data: topicsData } = useGetTopicsInPhaseQuery({
		phaseId: phaseDetail._id,
		queries: {
			page: 1,
			limit: 10,
			search_by: 'titleVN',
			query: '',
			sort_by: 'startDate',
			sort_order: 'desc'
		}
	})

	const now = Date.now()
	const showPending = phaseDetail.endTime && now > new Date(phaseDetail.endTime).getTime()

	const handleActionComplete = (actionId: string) => {
		// In real app, this would refetch data from API
		console.log('Action completed:', actionId)
	}

	const getPendingActions = (phaseType: PhaseType, topics: GeneralTopic[]): PendingAction[] => {
		const submittedTopics = topics.filter((t) => t.currentStatus === 'submitted')
		const registeredTopics = topics.filter((t) => t.currentStatus === 'registered')

		const actions: PendingAction[] = []

		if (phaseType === 'submit_topic') {
			actions.push({
				id: 'remind-teachers',
				type: 'send_reminder',
				label: 'Giảng viên chưa nộp đủ đề tài',
				description: 'Gửi nhắc nhở cho các giảng viên chưa nộp đủ số lượng đề tài yêu cầu',
				count: 12,
				targetIds: ['t1', 't2', 't3'],
				severity: 'warning'
			})
		}

		if (phaseType === 'open_registration') {
			if (submittedTopics.length > 0) {
				actions.push({
					id: 'move-empty-to-draft',
					type: 'move_to_draft',
					label: 'Đề tài không có người đăng ký',
					description: 'Chuyển các đề tài chưa có sinh viên đăng ký về trạng thái Draft',
					count: submittedTopics.length,
					targetIds: submittedTopics.map((t) => t._id),
					severity: 'warning'
				})
			}

			if (registeredTopics.length > 0) {
				actions.push({
					id: 'move-registered-to-execution',
					type: 'move_to_next_phase',
					label: 'Đề tài có người đăng ký',
					description: 'Chuyển các đề tài đã có sinh viên đăng ký sang pha Thực hiện',
					count: registeredTopics.length,
					targetIds: registeredTopics.map((t) => t._id),
					severity: 'info'
				})
				actions.push({
					id: 'remind-students',
					type: 'send_reminder',
					label: 'Nhắc sinh viên chưa đăng ký',
					description: 'Gửi email nhắc nhở sinh viên hoàn thành đăng ký đề tài',
					count: 25,
					targetIds: [],
					severity: 'info'
				})
			}
		}

		if (phaseType === 'execution') {
			actions.push({
				id: 'remind-documents',
				type: 'request_documents',
				label: 'Sinh viên chưa nộp tài liệu cuối',
				description: 'Yêu cầu sinh viên nộp tài liệu còn thiếu',
				count: 5,
				targetIds: ['s1', 's2', 's3', 's4', 's5'],
				severity: 'critical'
			})
			actions.push({
				id: 'remind-submit-docs',
				type: 'send_reminder',
				label: 'Gửi nhắc nhở nộp tài liệu cuối',
				description: 'Nhắc sinh viên hoàn thành việc nộp tài liệu',
				count: 5,
				targetIds: ['s1', 's2', 's3', 's4', 's5'],
				severity: 'warning'
			})
		}

		return actions
	}

	const pendingActions = useMemo(
		() => (topicsData ? getPendingActions(currentPhase, topicsData.data) : []),
		[currentPhase, topicsData]
	)

    console.log(phaseDetail)

	return (
		<motion.div
			key={phaseDetail ? phaseDetail.phase : 'no-phase'}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='h-full space-y-6'
		>
			<PhaseHeader phase={phaseDetail} onViewConfig={() => {
                onPhaseSettingOpen(true)
            }} />

			<StatsCards stats={stats} onClick={setStatusFilter} />

			{/* Phase Actions Box */}
			{showPending && (
				<PhaseActionsBox phase={phaseDetail} actions={pendingActions} onActionComplete={handleActionComplete} />
			)}
			<div className='pb-10'>
				<h3 className='mb-4 text-lg font-semibold'>
					{statusFilter && statusFilter !== 'all'
						? `Danh sách các đề tài ${getLabelForStatus(statusFilter)}`
						: 'Danh sách đề tài đã nộp'}
				</h3>
				<TopicsTable phase={phaseDetail} statFilter={statusFilter} />
			</div>
			
		</motion.div>
	)
}
