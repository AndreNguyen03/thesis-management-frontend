// PhaseContent.tsx
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/card'
import { StatsCards } from './StatsCards'
import { TopicsTable } from './TopicsTable'
import { motion } from 'framer-motion'
import { PhaseSettingsModal } from './modals/PhaseSettingsModal'
import type { PeriodPhase, PhaseType } from '@/models/period'
import { PhaseInfo } from '@/utils/utils'

interface PhaseContentProps {
	phase: PeriodPhase | null // null nếu phase chưa tạo
	currentPhase: PhaseType
}

export function PhaseContent({ phase, currentPhase }: PhaseContentProps) {
	const [phaseSettingsOpen, setPhaseSettingsOpen] = useState(false)
	const [phaseConfigured, setPhaseConfigured] = useState(false)

	const phaseExists = !!phase
	const stats = {}
	const topics = []
	const phaseName = PhaseInfo[currentPhase].label 

	return (
		<motion.div
			key={currentPhase}
			initial={{ opacity: 0, x: 20 }}
			animate={{ opacity: 1, x: 0 }}
			exit={{ opacity: 0, x: -20 }}
			transition={{ duration: 0.3 }}
			className='space-y-6'
		>
			{!phaseConfigured || !phaseExists ? (
				<Card className='border-dashed border-primary/30 bg-primary/5 p-8 text-center'>
					<div className='mb-4 text-muted-foreground'>
						Pha <strong>{phaseName}</strong> chưa được thiết lập. Vui lòng thiết lập để bắt đầu quản lý.
					</div>
					<Button onClick={() => setPhaseSettingsOpen(true)}>Thiết lập ngay</Button>
				</Card>
			) : (
				<>
					<div className='mb-4 flex items-center justify-between'>
						<h3 className='text-lg font-semibold'>Thống kê tổng quan - {phaseName}</h3>
						<Button onClick={() => setPhaseSettingsOpen(true)} variant='outline' size='sm'>
							Xem / Chỉnh sửa thiết lập
						</Button>
					</div>

					<StatsCards stats={stats} />

					<div>
						<h3 className='mb-4 text-lg font-semibold'>Danh sách đề tài</h3>
						<TopicsTable topics={topics} phase={currentPhase} />
					</div>
				</>
			)}

			<PhaseSettingsModal
				open={phaseSettingsOpen}
				onOpenChange={(open) => {
					setPhaseSettingsOpen(open)
					if (!open) setPhaseConfigured(true)
				}}
				phase={currentPhase}
				status={phase?.status || 'not_started'}
			/>
		</motion.div>
	)
}
