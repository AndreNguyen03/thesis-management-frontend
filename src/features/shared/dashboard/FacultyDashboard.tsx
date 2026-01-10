import { SchedulePanel } from './component/schedule-panel'
import { useGetFacultyDashboardQuery } from '@/services/periodApi'
import { PeriodCardSkeleton } from './component/skeleton/PeriodSkeleton'
import { SidebarSkeleton } from './component/skeleton/RightSidebarSkeleton'
import { useGetAllUserMilestonesQuery } from '@/services/milestoneApi'
import { FacultyPeriodCard } from './component/FacultyPeriodCard'
import { useAppSelector } from '@/store'
import type { FacultyBoardProfile } from '@/models'
import { useEffect } from 'react'
import { socketService } from '@/services/socket.service'

export function FacultyDashboard() {
	const { data: milestoneEvents, isLoading: isLoadingMilestoneEvent } = useGetAllUserMilestonesQuery()

	const { data, isLoading: isLoadingLecturerDashboard, refetch } = useGetFacultyDashboardQuery()

	const userId = useAppSelector((state) => (state.auth.user as FacultyBoardProfile)?.userId)
    
        console.log('faculty dashboard data', data)
    
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
				<div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]'>
					{/* Main Content */}
					<div className='space-y-6'>
						<FacultyPeriodCard dashboardData={currentThesisDashboard} />
						<FacultyPeriodCard dashboardData={currentResearchDashboard} />
					</div>

					{/* Right Sidebar */}
					<div className='mt-6 space-y-6 lg:mt-0'>
						<SchedulePanel milestones={milestoneEvents} />
					</div>
				</div>
			</main>
		</div>
	)
}
