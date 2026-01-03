import { SchedulePanel } from './component/schedule-panel'
import { useGetStudentDashboardQuery } from '@/services/periodApi'
import { StudentPeriodCard } from './component/StudentPeriodCard'
import { PeriodCardSkeleton } from './component/skeleton/PeriodSkeleton'
import { SidebarSkeleton } from './component/skeleton/RightSidebarSkeleton'
import { useGetAllUserMilestonesQuery } from '@/services/milestoneApi'

export function StudentDashboard() {
	const { data: milestoneEvents, isLoading: isLoadingMilestoneEvent } = useGetAllUserMilestonesQuery()

	const { data: dashboardData, isLoading: newDashboardLoading } = useGetStudentDashboardQuery()

	console.log(dashboardData)

	const currentThesisPeriod = dashboardData?.thesis
	const currentResearchPeriod = dashboardData?.scientificResearch

	if (isLoadingMilestoneEvent || newDashboardLoading) {
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

	if (!currentThesisPeriod) return <div>không có đợt đề tài khóa luận</div>
	if (!currentResearchPeriod) return <div>không có đợt đề tài nghiên cứu khoa học</div>
	if (!milestoneEvents) return <div>không có sự kiện</div>

	return (
		<div className='min-h-screen w-full bg-background'>
			<main className='mx-auto max-w-7xl px-4 py-6 lg:px-8'>
				<div className='grid gap-6 lg:grid-cols-[1fr_320px]'>
					{/* Main Content */}
					<div className='space-y-6'>
						<StudentPeriodCard dashboardData={currentThesisPeriod} />
						<StudentPeriodCard dashboardData={currentResearchPeriod} />
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
