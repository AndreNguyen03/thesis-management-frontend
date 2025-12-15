/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react'
import { GroupSidebar } from './components/GroupSidebar'
import { ChatPanel } from './components/ChatPanel'
import { WorkPanel } from './components/WorkPanel'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { useGetGroupDetailQuery, useGetPaginateGroupsQuery } from '@/services/groupApi'
import { LoadingState } from '@/components/ui/LoadingState'
import type { ApiError } from '@/models'
import { useBreadcrumb } from '@/hooks'
export const GroupWorkspacePage = () => {
	const [selectedGroupId, setSelectedGroupId] = useState<string>('')
	const [milestones, setMilestones] = useState<any[]>([]) // Empty array ban đầu, thay bằng real data sau

	const { setHidden } = useBreadcrumb()

	useEffect(() => {
		setHidden(true)
		return () => setHidden(false)
	}, [setHidden])
	const { data: paginatedGroups, isLoading, error } = useGetPaginateGroupsQuery()

	const groups = useMemo(() => {
		return paginatedGroups?.data ?? []
	}, [paginatedGroups])

	const activeGroup = groups.find((g) => g._id === selectedGroupId)

	useEffect(() => {
		if (groups.length > 0 && !selectedGroupId) {
			setSelectedGroupId(groups[0]._id)
		}
	}, [groups, selectedGroupId])

	const { data: groupDetail } = useGetGroupDetailQuery({ groupId: selectedGroupId }, { skip: !selectedGroupId })

	// Update milestone function (giữ nguyên, nhưng sẽ không dùng nếu empty)
	const updateMilestone = (
		id: number,
		newProgress: number,
		newStatus: string,
		newScore?: number,
		newFeedback?: string
	) => {
		setMilestones((prevMilestones) =>
			prevMilestones.map((m) => {
				if (m.id === id) {
					const updatedMilestone = {
						...m,
						progress: newProgress,
						status: newStatus
					}

					if (newScore !== undefined || newFeedback !== undefined) {
						updatedMilestone.submission = updatedMilestone.submission
							? { ...updatedMilestone.submission }
							: { date: new Date().toISOString().slice(0, 10), files: [], score: null, feedback: '' }

						if (newScore !== undefined) updatedMilestone.submission.score = newScore
						if (newFeedback !== undefined) updatedMilestone.submission.feedback = newFeedback
					}

					return updatedMilestone
				}
				return m
			})
		)
	}

	// Calculate total progress (fallback 0 nếu empty)
	const totalProgress = useMemo(() => {
		if (milestones.length === 0) return 0
		const completedProgress = milestones.reduce((sum, m) => sum + m.progress, 0)
		return Math.round(completedProgress / milestones.length)
	}, [milestones])

	const handleSelectGroup = (id: string) => {
		setSelectedGroupId(id)
		// TODO: Fetch milestones/tasks cho group này (e.g., useQuery dựa trên id)
	}

	if (isLoading) return <LoadingState message='Đang tải dữ liệu' />
	if (error) return <div>Lỗi: {(error as ApiError).data?.message}</div>

	// Empty state cho groups (nếu chưa có group nào)
	if (groups.length === 0) {
		return (
			<div className='flex h-full w-full items-center justify-center bg-gray-50'>
				<div className='text-center'>
					<h2 className='mb-2 text-lg font-medium text-gray-900'>Chưa có nhóm nào</h2>
					<p className='text-sm text-gray-500'>Hãy tạo nhóm mới để bắt đầu</p>
				</div>
			</div>
		)
	}

	return (
		<div className='flex h-full w-full overflow-hidden'>
			{/* Sidebar */}
			<GroupSidebar
				groups={groups}
				selectedGroupId={selectedGroupId}
				onSelectGroup={handleSelectGroup}
				participants={groupDetail?.participants ?? []}
			/>

			{/* Main Content - Resizable Panels */}
			<div className='h-100dvh flex-1'>
				<ResizablePanelGroup direction='horizontal' className='max-h-[100dvh]'>
					{/* Chat Panel */}
					<ResizablePanel defaultSize={50} minSize={40} maxSize={40}>
						{selectedGroupId ? (
							<ChatPanel
								groupName={activeGroup?.titleVN || ''}
								groupId={selectedGroupId}
								participants={groupDetail?.participants ?? []}
							/>
						) : (
							<div className='flex h-full items-center justify-center bg-gray-50'>
								<p className='text-center text-sm text-gray-500'>Hãy chọn nhóm để xem</p>
							</div>
						)}
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Work Panel */}
					<ResizablePanel defaultSize={50} minSize={50}>
						{!selectedGroupId ? (
							<div className='flex h-full items-center justify-center bg-gray-50'>
								<div className='text-center'>
									<h2 className='mb-2 text-lg font-medium text-gray-900'>
										{selectedGroupId ? 'Chưa có dữ liệu công việc' : 'Hãy chọn nhóm để xem'}
									</h2>
									<p className='text-sm text-gray-500'>
										{selectedGroupId ? 'Dữ liệu milestone và task sẽ được tải khi chọn nhóm' : ''}
									</p>
								</div>
							</div>
						) : (
							<WorkPanel
								milestones={milestones}
								totalProgress={totalProgress}
								updateMilestone={updateMilestone}
							/>
						)}
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	)
}
