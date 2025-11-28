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
import { PhaseInfo } from '@/utils/utils'
import { useAppSelector } from '@/store/configureStore'
import { cn } from '@/lib/utils'

export default function DetailPeriodPage() {
	const { id } = useParams()
	const user = useAppSelector((state) => state.auth.user)
	const navigate = useNavigate()

	const {
		data: period,
		isLoading,
		error
	} = useGetPeriodDetailQuery(id!, {
		skip: !id
	})

	const [isSidebarHidden, setSidebarHidden] = useState(false)
	const [currentChosenPhase, setCurrentChosenPhase] = useState<PhaseType>('empty')

	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đợt đăng ký', path: '/manage-period' },
		{ label: period?.name ?? 'Đang tải', path: `/period/${period?._id}` }
	])

	useEffect(() => {
		if (period?.currentPhase) {
			setCurrentChosenPhase(period.currentPhase)
		}
	}, [period])

	if (!id) return <NotFound />

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

	const currentPhaseDetail = period.phases.find((p: PeriodPhase) => p.phase === currentChosenPhase)

	return (
		<div className='flex h-screen min-h-0'>
			{/* Sidebar */}
			<aside
				className={cn('h-fit transition-all duration-300', isSidebarHidden ? 'w-12' : 'w-24')}
			>
				<PhaseStepBar
					phases={period.phases}
					currentPhase={currentChosenPhase}
					onPhaseChange={setCurrentChosenPhase}
					collapsed={isSidebarHidden}
					onCollapsedChange={setSidebarHidden}
				/>
			</aside>

			{/* Main Content */}
			<main className='min-h-0 flex-1 overflow-y-auto pt-12 px-4'>
				<div className='h-full'>
					{currentPhaseDetail ? (
						<PhaseContent
							phaseDetail={currentPhaseDetail}
							isConfigured={!!currentPhaseDetail.startTime}
							currentPhase={period.currentPhase}
							periodId={period._id}
						/>
					) : (
						<div className='flex min-h-[60vh] flex-col items-center justify-center gap-2'>
							<h2 className='text-2xl font-bold'>Pha {PhaseInfo[currentChosenPhase].label}</h2>
							<span className='font-medium'>Khởi đầu cho một kỷ mới</span>
							<span className='text-gray-500'>Thiết lập pha đầu tiên để tiếp tục.</span>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}
