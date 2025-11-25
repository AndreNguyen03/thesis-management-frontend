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

// import { useGetPeriodDetailQuery } from '@/services/periodApi'

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
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đợt đăng ký', path: '/manage-period' },
		{ label: period?.name ?? 'Đang tải', path: `/period/${period?._id}` }
	])

	const [currentChosenPhase, setCurrentChosenPhase] = useState<string>('empty')
	useEffect(() => {
		if (period?.currentPhase) {
			setCurrentChosenPhase(period.currentPhase)
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
	const currentPhaseDetail = period.phases.find((p: PeriodPhase) => p.phase === currentChosenPhase)
	return (
		<div className='h-fit'>
			{/* Sidebar - Step Bar */}
			<aside className='fixed z-10 h-full w-[10%] min-w-[100px] border-r bg-white'>
				<PhaseStepBar
					phases={period.phases}
					currentPhase={currentChosenPhase}
					onPhaseChange={(phaseType: PhaseType) => {
						setCurrentChosenPhase(phaseType)
					}}
				/>
			</aside>
			{/* Main Content with left margin to avoid sidebar overlap */}
			<main className='ml-[10%] mt-10 h-full min-w-[120px] flex-1'>
				<div className='container w-full'>
					{currentPhaseDetail ? (
						<PhaseContent
							phaseDetail={currentPhaseDetail!}
							isConfigured={currentPhaseDetail != undefined && currentPhaseDetail.startTime !== null}
							currentPhase={period.currentPhase}
							periodId={period._id}
							
						/>
					) : (
						<div className='flex min-h-[60vh] flex-col items-center justify-center gap-2'>
							<h2 className='text-center text-2xl font-bold'>
								Pha {PhaseInfo[currentChosenPhase as keyof typeof PhaseInfo].label}
							</h2>
							<span className='font-medium'>Khởi đầu cho một kỷ mới</span>
							<span className='text-gray-500'>
								Để tiếp tục hãy thiết lập pha <span className='font-semibold'>Nộp đề tài</span> và thông
								báo cho giảng viên biết!
							</span>
						</div>
					)}
				</div>
			</main>
		</div>
	)
}
