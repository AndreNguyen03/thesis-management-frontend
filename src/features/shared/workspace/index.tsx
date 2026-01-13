/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useState } from 'react'
import { GroupSidebar } from './components/GroupSidebar'
import { WorkPanel } from './components/WorkPanel'
import { useGetGroupDetailQuery, useGetPaginatedGroupQuery } from '@/services/groupApi'
import { LoadingState } from '@/components/ui/LoadingState'
import type { ApiError } from '@/models'
import { useBreadcrumb, useChat } from '@/hooks'
import { useAppDispatch } from '@/store'
import { setActiveGroup } from '@/store/slices/group-workspace'
import { useNavigate, useParams } from 'react-router-dom'

export const GroupWorkspacePage = () => {
	const { groupId } = useParams<{ groupId: string }>()
	const navigate = useNavigate()
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

	const activeGroup = groupSidebars.find((g) => g._id === groupId)

	const { data: groupDetail, isLoading: isLoadingGroupDetail } = useGetGroupDetailQuery(
		{ groupId: groupId ?? '' },
		{ skip: !groupId }
	)

	const handleSelectGroup = (id: string) => {
		dispatch(setActiveGroup(groupSidebars.find((g) => g._id === id) || null))
		navigate(`/group-workspace/${id}`, { replace: true })
	}

	const [searchQuery, setSearchQuery] = useState('')

	const filteredGroups = useMemo(() => {
		if (!searchQuery.trim()) return groupSidebars
		return groupSidebars.filter((g) => g.titleVN.toLowerCase().includes(searchQuery.toLowerCase()))
	}, [groupSidebars, searchQuery])

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
					</div>
				</div>
			</div>
		)
	}

	return (
		<div className='flex h-full w-full overflow-hidden'>
			<GroupSidebar
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
				groups={filteredGroups}
				selectedGroupId={groupId}
				onSelectGroup={handleSelectGroup}
			/>

			<div className='h-100dvh flex-1'>

				{/* Work Panel */}
				{groupId ? (
					isLoadingGroupDetail ? (
						<LoadingState message='Đang tải dữ liệu công việc...' />
					) : (
						<WorkPanel
							groupName={activeGroup?.titleVN || ''}
							participants={groupDetail?.participants ?? []}
						/>
					)
				) : (
					<div className='flex h-full items-center justify-center bg-gray-50'>
						<div className='text-center'>
							<h2 className='mb-2 text-lg font-medium text-gray-900'>Hãy chọn nhóm để xem công việc</h2>
							<p className='text-sm text-gray-500'>
								{groupId ? 'Dữ liệu milestone và task sẽ được tải khi chọn nhóm' : ''}
							</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
