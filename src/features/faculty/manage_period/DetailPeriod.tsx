import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PhaseStepBar } from './components/PhaseStepBar'
import { PhaseContent } from './components/PhaseContent'
import { usePageBreadcrumb } from '@/hooks'
import type { PhaseType } from '@/models/period.model'
import { Button } from '@/components/ui'
import { useGetPeriodDetailQuery } from '@/services/periodApi'
import NotFound from '@/features/shared/NotFound'
import type { PeriodPhase } from '@/models/period-phase.models'

// import { useGetPeriodDetailQuery } from '@/services/periodApi'

export default function DetailPeriodPage() {
	const { id } = useParams()
	const navigate = useNavigate()
	const {
		data: period,
		isLoading,
		error
	} = useGetPeriodDetailQuery(id!, {
		skip: !id // Nếu dùng RTK Query, nên dùng skip thay vì return sớm ở compo----------------------------
		// nent
	})
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đợt đăng ký', path: '/manage-period' },
		{ label: period?.name ?? 'Đang tải', path: `/period/${period?._id}` }
	])

	const [currentPhase, setCurrentPhaseId] = useState<string | undefined>(undefined)
	useEffect(() => {
		if (period?.currentPhase) {
			setCurrentPhaseId(period.currentPhase)
		}
	}, [period])
	if (!id) {
		return <NotFound />
	}

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
	const currentPhaseDetail = period.phases.find((p: PeriodPhase) => p.phase === currentPhase)

	return (
		<div className='min-h-screen'>
			<div className='flex w-full'>
				{/* Sidebar - Step Bar */}
				<aside className='sticky top-0 h-screen w-[10%] min-w-[120px] border-r'>
					<PhaseStepBar
						phases={period.phases}
						currentPhase={currentPhase!}
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
								phase={currentPhaseDetail!}
								currentPhase={period.currentPhase}
								periodId={period._id}
							/>
						)}
					</div>
				</main>
			</div>
		</div>
	)
}
