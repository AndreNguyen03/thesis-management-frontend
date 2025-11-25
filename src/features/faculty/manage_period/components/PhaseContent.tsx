import { StatsCards } from './StatsCards'
import { TopicsTable } from './TopicsTable'
import { getPhaseStats } from '../utils'
import { motion } from 'framer-motion'
import type { PeriodPhase } from '@/models/period-phase.models'
import { useState } from 'react'
import type { PaginationTopicsQueryParams } from '@/models'
import {
	useFacuBoardApproveTopicMutation,
	useFacuBoardRejectTopicMutation,
	useGetTopicsOfPeriodQuery,
	useGetTopicsQuery
} from '@/services/topicApi'
import { set } from 'zod'
import type { PhaseStats } from '@/models/period.model'
import { toast } from '@/hooks/use-toast'
import { CustomPagination } from '@/components/PaginationBar'
import { useDebounce } from '@/hooks/useDebounce'
import { useLecGetStatsPeriodQuery } from '@/services/periodApi'
interface PhaseContentProps {
	phaseDetail: PeriodPhase
	currentPhase: string
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
	return (
		<motion.div
			key={phaseDetail ? phaseDetail.phase : 'no-phase'}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='h-full space-y-6'
		>
			<StatsCards stats={stats} onClick={setChosenLabel} />

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
