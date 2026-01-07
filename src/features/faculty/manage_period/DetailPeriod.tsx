import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PhaseStepBar } from './components/PhaseStepBar'
import { PhaseContent } from './components/PhaseContent'
import { usePageBreadcrumb } from '@/hooks'
import type { PhaseType } from '@/models/period.model'
import { Button } from '@/components/ui'
import { useGetPeriodDetailQuery } from '@/services/periodApi'
import NotFound from '@/features/shared/NotFound'
import { PeriodPhaseStatus, type PeriodPhase } from '@/models/period-phase.models'
import { PhaseInfo } from '@/utils/utils'
import { cn } from '@/lib/utils'
import { PhaseSettingsModal } from './components/modals/PhaseSettingsModal'
import { MultiPhaseSetupModal } from './components/modals/MultiPhaseSetupModal'
import { LoadingState } from '@/components/ui/LoadingState'
import { getNextPhase } from './utils'
import { useGetAllLecturersComboboxQuery } from '@/services/lecturerApi'
import ManageMilestone from '@/features/shared/milestone/modal/ManageMilestone'

export default function DetailPeriodPage() {
	const { id } = useParams()
	const navigate = useNavigate()

	const {
		data: period,
		isLoading,
		refetch
	} = useGetPeriodDetailQuery(id!, {
		skip: !id
	})
	const { data: lecturersByFaculty } = useGetAllLecturersComboboxQuery({ limit: 1000, page: 1, sort_order: 'desc' })

	const [isSidebarHidden, setSidebarHidden] = useState(false)
	const [currentChosenPhase, setCurrentChosenPhase] = useState<PhaseType>('empty')
	const [phaseSettingOpen, setPhaseSettingsOpen] = useState<boolean>(false)
	const [multiPhaseSetupOpen, setMultiPhaseSetupOpen] = useState<boolean>(false)
	const [isManagingMilestonesOpen, setManagingMilestonesOpen] = useState<boolean>(false)
	const typeLabels = {
		thesis: 'Khóa luận',
		scientific_research: 'Nghiên cứu khoa học'
	} as const

	const title = `Kì hiện tại: ${period?.year} • HK ${period?.semester} • ${typeLabels[period?.type ?? 'thesis']}`
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Quản lý đợt đăng ký', path: '/manage-period' },
		{ label: title ?? 'Đang tải', path: `/period/${period?._id}` }
	])

	useEffect(() => {
		if (period?.currentPhase) {
			setCurrentChosenPhase(period.currentPhase)
		}
	}, [period])

	if (isLoading)
		return (
			<div className='w-full'>
				<LoadingState message='Đang tải dữ liệu pha...' />
			</div>
		)

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

	const currentPhaseDetail = period.phases.find(
		(p: PeriodPhase) => p.phase === currentChosenPhase && p.startTime && p.endTime
	)
	return (
		<div className='flex h-full w-full overflow-auto'>
			{/* Sidebar */}
			<aside className={cn('h-fit transition-all duration-300', isSidebarHidden ? 'w-12' : 'w-24')}>
				<PhaseStepBar
					phases={period.phases}
					activePhase={period.currentPhase}
					currentPhase={currentChosenPhase}
					onPhaseChange={setCurrentChosenPhase}
					collapsed={isSidebarHidden}
					onCollapsedChange={setSidebarHidden}
				/>
			</aside>

			{/* Main Content */}
			<main className='min-h-0 flex-1 overflow-y-auto px-4 pt-12'>
				<div className='h-full'>
					{currentPhaseDetail ? (
						<>
							<PhaseContent
								phaseDetail={currentPhaseDetail}
								currentPhase={period.currentPhase}
								activePhase={currentChosenPhase}
								periodId={period._id}
								completePhase={() => {
									const nextPhase = getNextPhase(currentChosenPhase)
									if (!nextPhase) {
										console.log('Đã là pha cuối, không còn pha tiếp theo')
										return
									}
									setCurrentChosenPhase(nextPhase)
								}}
								onPhaseSettingOpen={setPhaseSettingsOpen}
								onManageMilestones={setManagingMilestonesOpen}
							/>
						</>
					) : (
						<div className='flex min-h-[60vh] flex-col items-center justify-center gap-4'>
							<h2 className='text-2xl font-bold'>Pha {PhaseInfo[currentChosenPhase].label}</h2>
							<span className='text-gray-500'>
								{PhaseInfo[period.currentPhase].continue && 'Thiết lập pha '}

								<span className='font-semibold'>
									{PhaseInfo[period.currentPhase].continue ??
										'Đủ điều kiện để có thể kết thúc kỳ học'}
								</span>
								{PhaseInfo[period.currentPhase].continueMessage}
							</span>

							{/* Nút thiết lập nhiều pha nếu đang ở pha execution */}
							{/* {period.currentPhase === 'execution' && (
								<div className='flex flex-col items-center gap-2'>
									<Button
										variant='default'
										size='lg'
										onClick={() => {
											setMultiPhaseSetupOpen(true)
										}}
									>
										⚡ Thiết lập nhiều pha cùng lúc
									</Button>
									<span className='text-xs text-muted-foreground'>Hoặc</span>
								</div>
							)} */}

							<div className='flex gap-2'>
								<Button
									variant={period.currentPhase === 'empty' ? 'outline' : 'default'}
									size='sm'
									onClick={() => {
										setPhaseSettingsOpen(true)
									}}
								>
									Thiết lập pha {PhaseInfo[period.currentPhase].continue}
								</Button>

								{/* <Button size='sm' onClick={() => setCurrentChosenPhase(period.currentPhase)}>
									Quay lại pha {PhaseInfo[period.currentPhase].label}
								</Button> */}
							</div>
						</div>
					)}
				</div>
			</main>
			<PhaseSettingsModal
				open={phaseSettingOpen}
				onOpenChange={setPhaseSettingsOpen}
				phase={currentPhaseDetail}
				currentPhase={currentChosenPhase}
				periodId={period._id}
				lecturers={lecturersByFaculty?.data ?? []}
				onSuccess={() => refetch()}
			/>
			<MultiPhaseSetupModal
				open={multiPhaseSetupOpen}
				onOpenChange={setMultiPhaseSetupOpen}
				periodId={period._id}
				lecturers={lecturersByFaculty?.data ?? []}
				onSuccess={() => refetch()}
			/>
			{currentPhaseDetail && (
				<ManageMilestone
					open={isManagingMilestonesOpen}
					onOpenChange={setManagingMilestonesOpen}
					periodId={period._id}
					currentPhaseDetail={currentPhaseDetail}
					onSuccess={() => refetch()}
				/>
			)}
		</div>
	)
}
