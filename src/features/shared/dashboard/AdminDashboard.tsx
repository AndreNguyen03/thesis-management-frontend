import { SchedulePanel } from './component/schedule-panel'
import { useGetDashboardCurrentPeriodQuery } from '@/services/periodApi'
import { PeriodCard } from './component/PeriodCard'
import { PeriodCardSkeleton } from './component/skeleton/PeriodSkeleton'
import { SidebarSkeleton } from './component/skeleton/RightSidebarSkeleton'
import { useGetAllUserMilestonesQuery } from '@/services/milestoneApi'

export function AdminDashboard() {
	const { data, isLoading } = useGetDashboardCurrentPeriodQuery()

	const { data: milestoneEvents, isLoading: isLoadingMilestoneEvent } = useGetAllUserMilestonesQuery()

	const currentThesisPeriod = data?.thesisDashboard
	const currentResearchPeriod = data?.researchDashboard
	const thesisRegistration = data?.thesisRegistration
	const researchRegistration = data?.researchRegistration

	if (isLoading || isLoadingMilestoneEvent) {
		return (
			<div className='min-h-screen w-full bg-background'>
				<main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
					<div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
						<div className='space-y-6'>
							<PeriodCardSkeleton />
							<PeriodCardSkeleton />
						</div>

						<SidebarSkeleton />
					</div>
				</main>
			</div>
		)
	}

	if (!researchRegistration) return <div>không có đăng kí</div>
	if (!thesisRegistration) return <div>không có đợt đề tài</div>
	if (!currentThesisPeriod) return <div>không có đợt đề tài</div>
	if (!currentResearchPeriod) return <div>không có đợt đề tài</div>
	if (!milestoneEvents) return <div>không có sự kiện</div>

	return (
		<div className='min-h-screen w-full bg-background'>
			<main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
				<div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
					{/* Main Content */}
					<div className='space-y-6'>
						<PeriodCard
							period={currentThesisPeriod}
							studentRegistration={thesisRegistration.studentRegisStatus}
						/>
						<PeriodCard
							period={currentResearchPeriod}
							studentRegistration={researchRegistration.studentRegisStatus}
						/>
					</div>
					{/* Right Sidebar */}
					<div className='space-y-6'>
						<SchedulePanel milestones={milestoneEvents} />
					</div>
				</div>
			</main>
		</div>
	)
}
