import { StatsCards } from './StatsCards'
import { TopicsTable } from './TopicsTable'
import { getPhaseStats } from '../utils'
import { motion } from 'framer-motion'
import type { PendingAction, PeriodPhase } from '@/models/period-phase.models'
import { useMemo, useState } from 'react'
import type { GeneralTopic, PaginationTopicsQueryParams, Topic } from '@/models'
import {
	useFacuBoardApproveTopicMutation,
	useFacuBoardRejectTopicMutation,
	useGetTopicsOfPeriodQuery,
	useGetTopicsQuery
} from '@/services/topicApi'
import { set } from 'zod'
import type { PhaseStats, PhaseType } from '@/models/period.model'
import { toast } from '@/hooks/use-toast'
import { CustomPagination } from '@/components/PaginationBar'
import { useDebounce } from '@/hooks/useDebounce'
import { useLecGetStatsPeriodQuery } from '@/services/periodApi'
import { PhaseHeader } from './PhaseHeader'
import { PhaseActionsBox } from './PhaseActionsBox'
interface PhaseContentProps {
	phaseDetail: PeriodPhase
	currentPhase: PhaseType
	periodId: string
	lecturers?: string[]
	isConfigured: boolean
}

export function PhaseContent({ phaseDetail, currentPhase, periodId, isConfigured }: PhaseContentProps) {
	// // stats theo phase.phase
	const { data: statsData } = useLecGetStatsPeriodQuery({ periodId, phase: currentPhase })
	console.log('Stats Data in PhaseContent:', statsData)
	const stats = getPhaseStats(statsData, phaseDetail.phase)

	const [queries, setQueries] = useState<PaginationTopicsQueryParams>({
		page: 1,
		limit: 10,
		search_by: 'titleVN,titleEng,lecturers.fullName',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		phase: currentPhase,
		status: 'all'
	})

	//cal api
	const {
		data: topicsData,
		isLoading,
		isFetching,
		refetch: refetchTopicsData
	} = useGetTopicsOfPeriodQuery({ periodId, queries })

	//duyệt đề tài
	const [approveTopic, { isSuccess: isApprovedSuccess }] = useFacuBoardApproveTopicMutation()
	const [rejectTopic, { isSuccess: isRejectSuccess }] = useFacuBoardRejectTopicMutation()
	const [chosenLabel, setChosenLabelStats] = useState<string | null>('đã nộp')
	const setChosenLabel = (val: PhaseStats) => {
		setQueries((prev) => ({ ...prev, status: val.status, page: 1 }))
		setChosenLabelStats(val.label)
	}

	//Các hành động có thể xảy ra bên trong datatable
	//duyệt đề tài
	const handleApproveTopic = async (topicId: string) => {
		//Gọi API duyệt đề tài
		const res = await approveTopic({ topicId })
		refetchTopicsData()
		if (res) {
			toast({
				title: 'Duyệt đề tài thành công!',
				variant: 'success'
			})
		} else {
			toast({
				title: 'Duyệt đề tài thất bại!',
				variant: 'destructive'
			})
		}
	}

	const handleRejectTopic = async (topicId: string) => {
		//Gọi API từ chối đề tài
		const res = await rejectTopic({ topicId })
		refetchTopicsData()
		if (res) {
			toast({
				title: 'Từ chối đề tài thành công!',
				variant: 'success'
			})
		}
	}

	// tìm kiếm đề tài
	const debouncedOnChange = useDebounce({
		onChange: (val: string) => {
			setQueries((prev) => ({ ...prev, query: val, page: 1 }))
		},
		duration: 400
	})

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
	return (
		<motion.div
			key={phaseDetail ? phaseDetail.phase : 'no-phase'}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='h-full space-y-6'
		>
			<PhaseHeader phase={phaseDetail} />

			<StatsCards stats={stats} onClick={setChosenLabel} />

			{/* Phase Actions Box */}
			<PhaseActionsBox phase={phaseDetail} actions={pendingActions} onActionComplete={handleActionComplete} />
			<div className='pb-10'>
				<h3 className='mb-4 text-lg font-semibold'>
					{queries.status ? `Danh sách các đề tài ${chosenLabel?.toLowerCase()}` : 'Danh sách đề tài đã nộp'}
				</h3>
				<TopicsTable
					topics={topicsData?.data}
					phase={phaseDetail.phase}
					actions={{
						onApproveTopic: handleApproveTopic,
						onRejectTopic: handleRejectTopic,
						onSearchTopics: (val: string) => {
							debouncedOnChange(val)
						}
					}}
				/>
				{topicsData?.meta && topicsData.meta.totalPages > 1 && (
					<CustomPagination
						meta={topicsData.meta}
						onPageChange={(p) => setQueries((prev) => ({ ...prev, page: p }))}
					/>
				)}
			</div>
		</motion.div>
	)
}
