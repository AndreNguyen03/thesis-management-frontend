import { SchedulePanel } from './component/schedule-panel'
import { useGetLecturerDashboardQuery } from '@/services/periodApi'
import { PeriodCardSkeleton } from './component/skeleton/PeriodSkeleton'
import { SidebarSkeleton } from './component/skeleton/RightSidebarSkeleton'
import { useGetAllUserMilestonesQuery } from '@/services/milestoneApi'
import { LecturerPeriodCard } from './component/LecturerPeriodCard'
import { useEffect } from 'react'
import { socketService } from '@/services/socket.service'
import { useAppSelector } from '@/store'
import type { LecturerProfile } from '@/models'

export function LecturerDashboard() {
	const { data: milestoneEvents, isLoading: isLoadingMilestoneEvent } = useGetAllUserMilestonesQuery()
	const { data, isLoading: isLoadingLecturerDashboard, refetch } = useGetLecturerDashboardQuery()

	const userId = useAppSelector((state) => (state.auth.user as LecturerProfile)?.userId)

	console.log('lecturer dashboard data', data)

	const currentThesisDashboard = data?.thesis
	const currentResearchDashboard = data?.scientificResearch

	useEffect(() => {
        if (!userId) return;
		socketService.connect(userId, '/period')

        const cleanup = socketService.on('/period', 'periodDashboard:update', () => {
            console.log('Received periodDashboard:update event, refetching lecturer dashboard data...')
            refetch()
        })

        return () => {
            cleanup()
            socketService.disconnect('/period')
        }
    
	}, [userId, refetch])

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
					<div className='space-y-6 lg:col-start-2'>
						<SchedulePanel milestones={milestoneEvents} />
					</div>
				</div>
			</main>
		</div>
	)
}
