'use client'
import { useState } from 'react'
import { RegistrationCard } from './component/registration-card'
import { AISummaryCard } from './component/ai-summary-card'
import { GradingResultCard } from './component/grading-result-card'
import { SchedulePanel } from './component/schedule-panel'
import { DevToolbar } from './component/DevToolbar'
import { useGetDashboardCurrentPeriodQuery } from '@/services/periodApi'
import { PeriodCard } from './component/PeriodCard'
import { PeriodCardSkeleton } from './component/skeleton/PeriodSkeleton'
import { AISummaryCardSkeleton } from './component/skeleton/AISummarySkeleton'
import { SidebarSkeleton } from './component/skeleton/RightSidebarSkeleton'

export type ThesisPhase = 'not_started' | 'topic_submission' | 'registration' | 'execution' | 'grading' | 'completed'

export function StudentDashboard() {
	const [isDevMode, setIsDevMode] = useState(false)
	const [devPhase, setDevPhase] = useState<ThesisPhase>('execution')

	// Phase thật (sau này lấy từ API)

	const { data, isLoading } = useGetDashboardCurrentPeriodQuery()

	const currentThesisPeriod = data?.thesisDashboard
	const currentResearchPeriod = data?.researchDashboard
	const realPhase: ThesisPhase = 'execution'

	// Phase dùng để render
	const currentPhase = isDevMode ? devPhase : realPhase

	const isRegistered = currentPhase === 'execution' || currentPhase === 'grading' || currentPhase === 'completed'
	const showGrading = currentPhase === 'grading' || currentPhase === 'completed'

	if (isLoading) {
		return (
			<div className='min-h-screen w-full bg-background'>
				<main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
					<div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
						<div className='space-y-6'>
							<PeriodCardSkeleton />
							<PeriodCardSkeleton />
							<AISummaryCardSkeleton />
						</div>

						<SidebarSkeleton />
					</div>
				</main>
			</div>
		)
	}

	if (!currentThesisPeriod) return <div>không có đợt đề tài</div>
	if (!currentResearchPeriod) return <div>không có đợt đề tài</div>

	return (
		<div className='min-h-screen w-full bg-background'>
			<main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
				<div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
					{/* Main Content */}
					<div className='space-y-6'>
						<DevToolbar
							isDevMode={isDevMode}
							onToggle={setIsDevMode}
							currentPhase={currentPhase}
							onPhaseChange={setDevPhase}
						/>

						<PeriodCard period={currentThesisPeriod} />
						<PeriodCard period={currentResearchPeriod} />

						{currentPhase === 'registration' && <RegistrationCard />}

						{isRegistered && <AISummaryCard />}

						{showGrading && <GradingResultCard isCompleted={currentPhase === 'completed'} />}
					</div>

					{/* Right Sidebar */}
					<div className='space-y-6'>
						<SchedulePanel currentPhase={currentPhase} />
					</div>
				</div>
			</main>
		</div>
	)
}
