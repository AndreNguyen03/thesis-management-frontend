import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { useGetPaginateDirectGroupsQuery } from '@/services/groupApi'
import { useBreadcrumb, useChat } from '@/hooks'
// import { useAppSelector } from '@/store'
// import { getUserIdFromAppUser } from '@/utils/utils'
import type { DirectSidebarGroup } from '@/models/groups.model'
import { ChatPanel } from './ChatPanel'
import { ContactSidebar } from './ContactSidebar'
import { LoadingState } from '@/components/ui/LoadingState'

export const ContactPage = () => {
	const [searchParams, setSearchParams] = useSearchParams()
	const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
	const [searchQuery, setSearchQuery] = useState('')

	const { fetchGroupMessages, setHasUnreadDirect } = useChat()
	// const user = useAppSelector((state) => state.auth.user)
	// const userId = getUserIdFromAppUser(user)

	useEffect(() => {
		setHasUnreadDirect(false)
	}, [])

	const { setHidden } = useBreadcrumb()

	useEffect(() => {
		setHidden(true)
		return () => setHidden(false)
	}, [setHidden])

	// ✅ nhận groupId từ navigate("?groupId=")
	useEffect(() => {
		const gid = searchParams.get('groupId')
		if (gid) {
			setSelectedGroupId(gid)
			searchParams.delete('groupId')
			setSearchParams(searchParams)
		}
	}, [])

	const { data, isLoading, error } = useGetPaginateDirectGroupsQuery()

	const groups: DirectSidebarGroup[] = data?.data ?? []

	const filteredGroups = useMemo(() => {
		if (!searchQuery.trim()) return groups
		return groups.filter((g) => g.otherUser.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
	}, [groups, searchQuery])

	const selectedGroup = groups.find((g) => g._id === selectedGroupId)

	useEffect(() => {
		if (selectedGroupId) {
			fetchGroupMessages(selectedGroupId, 20)
		}
	}, [selectedGroupId])

	if (error) return <div className='h-full w-full m-auto p-4 text-red-500'>Lỗi tải liên hệ</div>

	if (isLoading)
		return (
			<div className='h-full w-full'>
				<LoadingState message='Đang tải dữ liệu' />
			</div>
		)

	return (
		<div className='flex h-full w-full bg-chat'>
			<ContactSidebar
				groups={filteredGroups}
				selectedGroupId={selectedGroupId}
				onSelectGroup={setSelectedGroupId}
				searchQuery={searchQuery}
				onSearchChange={setSearchQuery}
			/>

			<div className='flex-1'>
				{selectedGroup ? (
					<ChatPanel groupId={selectedGroup._id} otherPaticipant={selectedGroup.otherUser} />
				) : (
					<div className='flex h-full items-center justify-center text-muted-foreground'>
						<div className='text-center'>
							<Search className='mx-auto h-10 w-10' />
							<p className='mt-2'>Chọn một liên hệ để bắt đầu chat</p>
						</div>
					</div>
				)}
			</div>
		</div>
	)
}
