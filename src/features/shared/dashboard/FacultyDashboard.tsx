import { SchedulePanel } from './component/schedule-panel'
import { useGetLecturerDashboardQuery } from '@/services/periodApi'
import { PeriodCardSkeleton } from './component/skeleton/PeriodSkeleton'
import { SidebarSkeleton } from './component/skeleton/RightSidebarSkeleton'
import { useGetAllUserMilestonesQuery } from '@/services/milestoneApi'
import { LecturerPeriodCard } from './component/LecturerPeriodCard'

export function FacultyDashboard() {
	const { data: milestoneEvents, isLoading: isLoadingMilestoneEvent } = useGetAllUserMilestonesQuery()

	const { data, isLoading: isLoadingLecturerDashboard } = useGetLecturerDashboardQuery()

	const currentThesisDashboard = data?.thesis
	const currentResearchDashboard = data?.scientificResearch

	if (isLoadingMilestoneEvent || isLoadingLecturerDashboard) {
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

	if (!currentResearchDashboard) return <div>không có đăng kí</div>
	if (!currentThesisDashboard) return <div>không có đợt đề tài</div>
	if (!milestoneEvents) return <div>không có sự kiện</div>

	return (
		<div className='min-h-screen w-full bg-background'>
			<main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
				<div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
					{/* Main Content */}
					<div className='space-y-6'>
						<LecturerPeriodCard dashboardData={currentThesisDashboard} />
						<LecturerPeriodCard dashboardData={currentResearchDashboard} />
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
