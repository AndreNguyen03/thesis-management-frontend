import { StatsCards } from './StatsCards'
import { getLabelForStatus, getPhaseStats } from '../utils'
import { motion } from 'framer-motion'
import { type PeriodPhase, type ResolvePhaseResponse } from '@/models/period-phase.models'
import { useState, type SetStateAction, type Dispatch, useEffect, useRef } from 'react'
import { type PaginationTopicsQueryParams, type TopicStatus } from '@/models'
import type { PhaseType } from '@/models/period.model'
// import { toast } from '@/hooks/use-toast'
import { useLecGetStatsPeriodQuery, useResolvePhaseMutation } from '@/services/periodApi'
import { PhaseHeader } from './PhaseHeader'
import { PhaseActionsBox } from './PhaseActionsBox'
import PhaseDataTable from './DataTable'
import { useGetTopicsInPhaseQuery } from '@/services/topicApi'
import { useDebounce } from '@/hooks/useDebounce'
import { Card, Input } from '@/components/ui'
import { CustomPagination } from '@/components/PaginationBar'
// import { TopicsTable } from './TopicsTable'
interface PhaseContentProps {
	phaseDetail: PeriodPhase
	currentPhase: PhaseType
	periodId: string
	lecturers?: string[]
	onPhaseSettingOpen: Dispatch<SetStateAction<boolean>>
	completePhase: () => void
}

export function PhaseContent({
	phaseDetail,
	currentPhase,
	periodId,
	onPhaseSettingOpen,
	completePhase
}: PhaseContentProps) {
	// // stats theo phase.phase
	const { data: statsData } = useLecGetStatsPeriodQuery({ periodId, phase: currentPhase })

	const stats = getPhaseStats(statsData, phaseDetail.phase)

	const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all')

	const [resolvePhase, { isLoading: isResolving }] = useResolvePhaseMutation()

	const [resolvePhaseData, setResolvePhaseData] = useState<ResolvePhaseResponse | null>(null)

	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueryParams((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}
	const [queryParams, setQueryParams] = useState<PaginationTopicsQueryParams>({
		limit: 10,
		page: 1,
		search_by: ['titleVN', 'titleEng', 'lecturers.fullName', 'periodName'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		phase: phaseDetail.phase,
		status: statusFilter
	})
	const {
		data: topicInPhaseData,
		isLoading,
		error,
		refetch
	} = useGetTopicsInPhaseQuery(
		{
			periodId,
			queries: queryParams
		},
		{ skip: !periodId }
	)
	useEffect(() => {
		if (!phaseDetail) return

		// Nếu pha chưa cấu hình (không endTime) → vẫn resolve ngay
		if (!phaseDetail.endTime) {
			handleResolve()
			return
		}

		const end = new Date(phaseDetail.endTime).getTime()
		const now = Date.now()
		const delay = end - now

		// Pha đã kết thúc → resolve ngay
		if (delay <= 0) {
			handleResolve()
			return
		}

		// Chưa kết thúc → chờ đến endTime
		const timer = setTimeout(() => handleResolve(), delay)
		return () => clearTimeout(timer)
	}, [phaseDetail?.endTime])

	const handleResolve = async () => {
		try {
			const res = await resolvePhase({ periodId, phase: phaseDetail.phase }).unwrap()
			console.log('resovle phase :::', res)
			setResolvePhaseData(res)
		} catch (err) {
			console.error(err)
		}
	}

	const topicsRef = useRef<HTMLDivElement>(null)

	const scrollToTopics = () => {
		setTimeout(() => {
			topicsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
		}, 200)
	}

	const handleGoProcess = () => {
		setStatusFilter('submitted')
		scrollToTopics()
	}

	return (
		<motion.div
			key={phaseDetail ? phaseDetail.phase : 'no-phase'}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='h-full space-y-6'
		>
			<PhaseHeader
				phase={phaseDetail}
				onViewConfig={() => {
					onPhaseSettingOpen(true)
				}}
			/>

			<StatsCards stats={stats} onClick={(status) => setQueryParams((prev) => ({ ...prev, status }))} />

			{/* Phase Actions Box */}
			{resolvePhaseData && phaseDetail.phase === currentPhase && (
				<PhaseActionsBox
					resolvePhaseData={resolvePhaseData}
					phase={phaseDetail}
					onCompletePhase={completePhase}
					isResolving={isResolving}
					onGoProcess={handleGoProcess}
				/>
			)}
			<div className='pb-10' ref={topicsRef}>
				<h3 className='mb-4 text-lg font-semibold'>
					{statusFilter && statusFilter !== 'all'
						? `Danh sách các đề tài ${getLabelForStatus(statusFilter)}`
						: 'Danh sách đề tài đã nộp'}
				</h3>
				{/* <TopicsTable
					phase={phaseDetail}
					statFilter={statusFilter}
					periodId={periodId}
					queryParams={queryParams}
					setQueryParams={setQueryParams}
				/> */}
				<Card className='space-y-2 rounded-xl border border-gray-200 bg-white p-6 shadow-md'>
					<h2 className='mb-1 text-xl font-bold text-gray-900'>Lịch Sử Đăng Ký Đề Tài</h2>
					<p className='mb-6 text-sm text-gray-500'>Tổng quan về tất cả các đợt bạn đã tham gia.</p>
					<div className='mb-4 flex flex-col gap-4 sm:flex-row sm:items-center'>
						<Input
							placeholder='Tìm kiếm theo Đợt, Đề tài, hoặc Giảng viên...'
							value={searchTerm}
							onChange={(e) => onEdit(e.target.value)}
							className='sm:w-[350px]'
						/>
					</div>
					<PhaseDataTable data={topicInPhaseData} refetch={refetch} phaseId={phaseDetail._id} />
					{topicInPhaseData?.meta && topicInPhaseData?.meta.totalPages > 1 && (
						<CustomPagination
							meta={topicInPhaseData?.meta}
							onPageChange={(p) => setQueryParams((prev) => ({ ...prev, page: p }))}
						/>
					)}
				</Card>
			</div>
		</motion.div>
	)
}
