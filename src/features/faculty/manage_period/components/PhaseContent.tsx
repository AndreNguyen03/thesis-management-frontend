import { StatsCards } from './StatsCards'
import { getLabelForStatus, getPhaseStats } from '../utils'
import { motion } from 'framer-motion'
import { type PeriodPhase, type ResolvePhaseResponse } from '@/models/period-phase.models'
import { useState, type SetStateAction, type Dispatch, useEffect } from 'react'
import { type TopicStatus } from '@/models'
import type { PhaseType } from '@/models/period.model'
// import { toast } from '@/hooks/use-toast'
import { useLecGetStatsPeriodQuery, useResolvePhaseMutation } from '@/services/periodApi'
import { PhaseHeader } from './PhaseHeader'
import { PhaseActionsBox } from './PhaseActionsBox'
import { TopicsTable } from './TopicsTable'
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
			setResolvePhaseData(res)
		} catch (err) {
			console.error(err)
		}
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

			<StatsCards stats={stats} onClick={setStatusFilter} />

			{/* Phase Actions Box */}
			{resolvePhaseData?.canTriggerNextPhase === true && phaseDetail.phase === currentPhase && (
				<PhaseActionsBox
					resolvePhaseData={resolvePhaseData}
					phase={phaseDetail}
					onCompletePhase={completePhase}
					isResolving={isResolving}
				/>
			)}
			<div className='pb-10'>
				<h3 className='mb-4 text-lg font-semibold'>
					{statusFilter && statusFilter !== 'all'
						? `Danh sách các đề tài ${getLabelForStatus(statusFilter)}`
						: 'Danh sách đề tài đã nộp'}
				</h3>
				<TopicsTable phase={phaseDetail} statFilter={statusFilter} periodId={periodId} />
			</div>
		</motion.div>
	)
}
