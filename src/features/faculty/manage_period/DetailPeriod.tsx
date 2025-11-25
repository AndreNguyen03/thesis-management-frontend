import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PhaseStepBar } from './components/PhaseStepBar'
import { PhaseContent } from './components/PhaseContent'
import { Button } from '@/components/ui/Button'
import { usePageBreadcrumb } from '@/hooks'
import type { PhaseType } from '@/models/period'
import { useGetPeriodDetailQuery } from '@/services/periodApi'
import { LoadingState } from '@/components/ui/LoadingState'

export default function DetailPeriodPage() {
	const { id } = useParams()
	const navigate = useNavigate()

	const { data: period, isLoading } = useGetPeriodDetailQuery(id!)
	const [currentPhase, setCurrentPhase] = useState<PhaseType>('empty')

	useEffect(() => {
		if (period) {
			setCurrentPhase(period.currentPhase !== 'empty' ? period.currentPhase : 'submit_topic')
		}
	}, [period])

	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đợt đăng ký', path: '/manage-period' },
		{ label: period?.name ?? 'Đang tải...', path: '/period/:id' }
	])

	if (isLoading) {
		return (
			<div className='flex min-h-screen items-center justify-center'>
				<LoadingState message='Đang tải dữ liệu đợt đăng ký...' />
			</div>
		)
	}

	// ❌ Không có dữ liệu (sai id)
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

	const selectedPhase = period.phases.find((p) => p.phase === currentPhase)

	return (
		<div className='min-h-screen'>
			<div className='flex w-full'>
				{/* Sidebar - Step Bar */}
				<aside className='sticky top-0 h-screen w-[10%] min-w-[120px] border-r'>
					<PhaseStepBar
						phases={period.phases}
						currentPhase={currentPhase}
						onPhaseChange={(phaseType: PhaseType) => {
							setCurrentPhase(phaseType)
						}}
					/>
				</aside>

				{/* Main Content */}
				<main className='w-[90%] flex-1'>
					<div className='container mx-auto max-w-7xl'>
						{selectedPhase && <PhaseContent phase={selectedPhase} currentPhase={currentPhase} />}
					</div>
				</main>
			</div>
		</div>
	)
}
