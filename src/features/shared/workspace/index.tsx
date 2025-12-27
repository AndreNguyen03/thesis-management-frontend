/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo, useEffect } from 'react'
import { GroupSidebar } from './components/GroupSidebar'
import { ChatPanel } from './components/ChatPanel'
import { WorkPanel } from './components/WorkPanel'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { useGetGroupDetailQuery, useGetPaginatedGroupQuery } from '@/services/groupApi'
import { LoadingState } from '@/components/ui/LoadingState'
import type { ApiError } from '@/models'
import { useBreadcrumb, useChat } from '@/hooks'
import { useAppDispatch, useAppSelector } from '@/store'
import { setActiveGroup } from '@/store/slices/group-workspace'

export const GroupWorkspacePage = () => {
	const group = useAppSelector((state) => state.group)
	const { groupSidebars, setGroupSidebars } = useChat()
	const dispatch = useAppDispatch()
	const { setHidden } = useBreadcrumb()
	useEffect(() => {
		setHidden(true)
		return () => setHidden(false)
	}, [setHidden])

	const { data: paginatedGroups, isLoading, error } = useGetPaginatedGroupQuery({ page: 1, limit: 20 })

	useEffect(() => {
		if (paginatedGroups?.data?.length) {
			setGroupSidebars(paginatedGroups.data)
		}
	}, [paginatedGroups, setGroupSidebars])

	const activeGroup = groupSidebars.find((g) => g._id === group.activeGroup?._id)

	const { data: groupDetail, isLoading: isLoadingGroupDetail } = useGetGroupDetailQuery(
		{ groupId: group.activeGroup?._id ?? '' },
		{ skip: !group.activeGroup?._id }
	)

	const handleSelectGroup = (id: string) => {
		dispatch(setActiveGroup(groupSidebars.find((g) => g._id === id) || null))
	}

	if (isLoading)
		return (
			<div className='h-full w-full'>
				<LoadingState message='Đang tải nhóm...' />
			</div>
		)

	if (error) return <div className='p-4 text-red-600'>Lỗi: {(error as ApiError).data?.message}</div>

	if (!groupSidebars.length) {
		return (
			<div className='flex h-full w-full bg-gray-50'>
				<GroupSidebar groups={[]} selectedGroupId={undefined} onSelectGroup={() => {}} />
				<div className='flex flex-1 items-center justify-center'>
					<div className='text-center'>
						<h2 className='mb-2 text-lg font-medium text-gray-900'>Chưa có nhóm nào</h2>
						<p className='text-sm text-gray-500'>Hãy tạo nhóm mới để bắt đầu</p>
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='flex h-full w-full overflow-hidden'>
			<GroupSidebar
				groups={groupSidebars}
				selectedGroupId={group.activeGroup?._id}
				onSelectGroup={handleSelectGroup}
			/>

			<div className='h-100dvh flex-1'>
				<ResizablePanelGroup direction='horizontal' className='max-h-[100dvh]'>
					{/* Chat Panel */}
					<ResizablePanel defaultSize={50} minSize={40} maxSize={40}>
						{group.activeGroup ? (
							isLoadingGroupDetail ? (
								<LoadingState message='Đang tải chat...' />
							) : (
								<ChatPanel
									groupName={activeGroup?.titleVN || ''}
									groupId={group.activeGroup._id}
									participants={groupDetail?.participants ?? []}
								/>
							)
						) : (
							<div className='flex h-full items-center justify-center bg-gray-50'>
								<p className='mb-2 text-lg font-medium text-gray-900'>Hãy chọn nhóm để xem chat</p>
							</div>
						)}
					</ResizablePanel>

					<ResizableHandle withHandle />

					{/* Work Panel */}
					<ResizablePanel defaultSize={50} minSize={50}>
						{group.activeGroup ? (
							isLoadingGroupDetail ? (
								<LoadingState message='Đang tải dữ liệu công việc...' />
							) : (
								<WorkPanel />
							)
						) : (
							<div className='flex h-full items-center justify-center bg-gray-50'>
								<div className='text-center'>
									<h2 className='mb-2 text-lg font-medium text-gray-900'>
										Hãy chọn nhóm để xem công việc
									</h2>
									<p className='text-sm text-gray-500'>
										{group.activeGroup ? 'Dữ liệu milestone và task sẽ được tải khi chọn nhóm' : ''}
									</p>
								</div>
							</div>
						)}
					</ResizablePanel>
				</ResizablePanelGroup>
			</div>
		</div>
	)
}
