import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { StatsCards } from './StatsCards'
import { TopicsTable } from './TopicsTable'
import { getPhaseStats, mockTopicsPhase1, mockTopicsPhase2, mockTopicsPhase3, mockTopicsPhase4 } from '../mockData'
import { Settings, Eye } from 'lucide-react'
import { motion } from 'framer-motion'
import { PhaseSettingsModal } from './modals/PhaseSettingsModal'
import type { PeriodPhase, PhaseType } from '@/models/period'
import { PhaseInfo } from '@/utils/utils'
interface PhaseContentProps {
	phase: PeriodPhase
	currentPhase: PhaseType
	periodId: string
	lecturers?: string[]
}

export function PhaseContent({ phase, currentPhase, periodId, lecturers = [] }: PhaseContentProps) {
	const [phaseSettingsOpen, setPhaseSettingsOpen] = useState(false)
	const [phaseConfigured, setPhaseConfigured] = useState(false)

	// stats theo phase.phase
	const stats = getPhaseStats(phase.phase)

	const getTopicsForPhase = () => {
		switch (phase.phase) {
			case 'submit_topic':
				return mockTopicsPhase1
			case 'open_registration':
				return mockTopicsPhase2
			case 'execution':
				return mockTopicsPhase3
			case 'completion':
				return mockTopicsPhase4
			default:
				return []
		}
	}

	return (
		<motion.div
			key={phase.phase}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-6'
		>
			{!phaseConfigured ? (
				<Card className='border-dashed border-primary/30 bg-primary/5 p-8 text-center'>
					<div className='mb-4 text-muted-foreground'>
						Pha '{PhaseInfo[phase.phase].label}' chưa được thiết lập. Vui lòng thiết lập để bắt đầu quản lý.
					</div>
					<Button onClick={() => setPhaseSettingsOpen(true)}>
						<Settings className='mr-2 h-4 w-4' /> Thiết lập ngay
					</Button>
				</Card>
			) : (
				<>
					<div className='mb-4 flex items-center justify-between'>
						<h3 className='text-lg font-semibold'>Thống kê tổng quan - {PhaseInfo[phase.phase].label}</h3>
						<Button onClick={() => setPhaseSettingsOpen(true)} variant='outline' size='sm'>
							<Eye className='mr-2 h-4 w-4' />
							Xem / Chỉnh sửa thiết lập
						</Button>
					</div>
					<StatsCards stats={stats} />

					<div>
						<h3 className='mb-4 text-lg font-semibold'>Danh sách đề tài</h3>
						<TopicsTable topics={getTopicsForPhase()} phase={phase.phase} />
					</div>
				</>
			)}

			<PhaseSettingsModal
				open={phaseSettingsOpen}
				onOpenChange={(open) => {
					setPhaseSettingsOpen(open)
					if (!open) setPhaseConfigured(true)
				}}
				phase={phase.phase}
				status={phase.status}
				lecturers={lecturers}
			/>
		</motion.div>
	)
}
