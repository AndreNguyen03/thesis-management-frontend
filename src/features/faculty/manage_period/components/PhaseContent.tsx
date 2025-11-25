// PhaseContent.tsx
import { useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/card'
import { StatsCards } from './StatsCards'
import { TopicsTable } from './TopicsTable'
import { motion } from 'framer-motion'
import { PhaseSettingsModal } from './modals/PhaseSettingsModal'
import type { PeriodPhase, PhaseType } from '@/models/period'
import { PhaseInfo } from '@/utils/utils'
import { phaseConfig } from '../phase-config'
import { useGetTopicsInPhaseQuery } from '@/services/periodApi'

interface PhaseContentProps {
	phase: PeriodPhase  // phase có thể null
	currentPhase: PhaseType
}

export function PhaseContent({ phase, currentPhase }: PhaseContentProps) {
	const [phaseSettingsOpen, setPhaseSettingsOpen] = useState(false)

	const config = phaseConfig[currentPhase]

	const useStatsQuery = config.useStatsQuery
	const { data: statsData } = useStatsQuery(phase._id)

	const statsLabels = config.statsLabels || []

	// Map DTO → array số theo đúng thứ tự labels
	const stats: number[] = useMemo(() => {
		if (!statsData) return []

		return statsLabels.map((labelKey: string, index: number) => {
			// Extract value based on the "order" you defined
			// We assume statsData fields are in correct order for this phase
			const values = Object.values(statsData).filter((v) => typeof v === 'number')
			return values[index] ?? 0
		})
	}, [statsData])


	// Nếu chưa có phase trong DB → early return
	if (!phase) {
		const phaseName = PhaseInfo?.[currentPhase ?? 'empty']?.label ?? 'Pha không xác định'

		return (
			<motion.div
				key={currentPhase}
				initial={{ opacity: 0, x: 20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.3 }}
				className='space-y-6'
			>
				<Card className='border-dashed border-primary/30 bg-primary/5 p-8 text-center'>
					<div className='mb-4 text-muted-foreground'>
						Pha <strong>{phaseName}</strong> chưa được thiết lập.
					</div>
					<Button onClick={() => setPhaseSettingsOpen(true)}>Thiết lập ngay</Button>
				</Card>

				<PhaseSettingsModal
					open={phaseSettingsOpen}
					onOpenChange={setPhaseSettingsOpen}
					phase={currentPhase}
					status='not_started'
				/>
			</motion.div>
		)
	}

	const phaseName = PhaseInfo[currentPhase].label

	return (
		<motion.div
			key={currentPhase}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			transition={{ duration: 0.3 }}
			className='space-y-6'
		>
			<div className='mb-4 flex items-center justify-between'>
				<h3 className='text-lg font-semibold'>Thống kê tổng quan – {phaseName}</h3>

				<Button onClick={() => setPhaseSettingsOpen(true)} variant='outline' size='sm'>
					Xem / Chỉnh sửa thiết lập
				</Button>
			</div>

			<StatsCards stats={stats} />

			<div>
				<h3 className='mb-4 text-lg font-semibold'>Danh sách đề tài</h3>
				<TopicsTable  phase={currentPhase!} />
			</div>

			<PhaseSettingsModal
				open={phaseSettingsOpen}
				onOpenChange={setPhaseSettingsOpen}
				phase={currentPhase!}
				status={phase.status}
			/>
		</motion.div>
	)
}
