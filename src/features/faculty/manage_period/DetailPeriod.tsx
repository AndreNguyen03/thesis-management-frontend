import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PhaseStepBar } from './components/PhaseStepBar'
import { PhaseContent } from './components/PhaseContent'
import { Button } from '@/components/ui/button'
import { mockPeriodDetail } from './mockData'
import { usePageBreadcrumb } from '@/hooks'
import type { PeriodPhase, PhaseType } from '@/models/period.model'

// import { useGetPeriodDetailQuery } from '@/services/periodApi'

export default function DetailPeriodPage() {
	const { id } = useParams()
	const navigate = useNavigate()

	// const { data: period, isLoading, error } = useGetPeriodDetailQuery(id!)

	const loading = false
	const error = null
	const period = mockPeriodDetail

	const [currentPhaseId, setCurrentPhaseId] = useState<PhaseType>(period?.currentPhase || 'submit_topic')

	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đợt đăng ký', path: '/manage-period' },
		{ label: period!.name, path: '/period/:id' }
	])

	if (!period) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<div className='text-center'>
					<h2 className='mb-2 text-2xl font-bold'>Không tìm thấy đợt đăng ký</h2>
					<Button onClick={() => navigate('/')}>Quay lại</Button>
				</div>
			</div>
		)
	}

	// Lấy thông tin pha hiện tại
	const currentPhase = period.phases.find((p: PeriodPhase) => p.phase === period.currentPhase)

	return (
		<div className='min-h-screen'>
			<div className='flex w-full'>
				{/* Sidebar - Step Bar */}
				<aside className='sticky top-0 h-screen w-[10%] min-w-[120px] border-r'>
					<PhaseStepBar
						phases={period.phases}
						currentPhase={currentPhaseId}
						onPhaseChange={(phaseType: PhaseType) => {
							setCurrentPhaseId(phaseType)
						}}
					/>
				</aside>

				{/* Main Content */}
				<main className='w-[90%] flex-1'>
					<div className='container mx-auto max-w-7xl'>
						{currentPhase && (
							<PhaseContent
								phase={period.phases.find((p) => p.phase === currentPhaseId)!}
								currentPhase={period.currentPhase}
								periodId={period.id}
							/>
						)}
					</div>
				</main>
			</div>
		</div>
	)
}
