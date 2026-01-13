import { cn } from '@/lib/utils'
import type { GroupSidebar as GroupSidebarType } from '@/models/groups.model'
import { useChat } from '@/hooks'
import { useAppSelector } from '@/store'
import { getUserIdFromAppUser } from '@/utils/utils'
import { Search } from 'lucide-react'

interface GroupSidebarProps {
	groups: GroupSidebarType[]
	selectedGroupId?: string
	onSelectGroup: (id: string) => void
	isLoading?: boolean
    onSearchChange?: (query: string) => void
    searchQuery?: string
}

const formatTime = (createdAt?: string) => {
	if (!createdAt) return ''
	const date = new Date(createdAt)
	return date.toLocaleString('vi-VN', {
		hour: '2-digit',
		minute: '2-digit',
		day: '2-digit',
		month: '2-digit'
	})
}


export const GroupSidebar = ({ groups, selectedGroupId, onSelectGroup, isLoading = false, searchQuery, onSearchChange }: GroupSidebarProps) => {
	const { messagesByGroup, markGroupSeen } = useChat() || {}
	const user = useAppSelector((state) => state.auth.user)
	const userId = getUserIdFromAppUser(user)

	const handleSelectGroup = (groupId: string) => {
		onSelectGroup(groupId)
		markGroupSeen?.(groupId)
	}

	if (isLoading) {
		return (
			<div className='flex h-full w-64 flex-col space-y-2 overflow-y-auto border-r border-sidebar-border bg-sidebar p-2'>
				{Array.from({ length: 6 }).map((_, idx) => (
					<div key={idx} className='h-16 w-full animate-pulse rounded-lg bg-gray-200' />
				))}
			</div>
		)
	}

	return (
		<div className='flex h-full w-full flex-col border-r bg-sidebar md:w-72'>
			<div className='p-3'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50' />
					<input
						value={searchQuery}
						onChange={(e) => onSearchChange?.(e.target.value)}
						placeholder='Tìm kiếm...'
						className='w-full rounded-md bg-secondary px-9 py-2 text-sm'
					/>
				</div>
			</div>
			<nav className='flex-1 space-y-2 overflow-y-auto p-2'>
				{groups.map((group) => {
					const msgs = messagesByGroup?.[group._id] ?? []
					const isSelected = selectedGroupId === group._id

					const lastMessage = group.lastMessage
					const time = formatTime(lastMessage?.createdAt)
					const unreadCount = msgs.filter(
						(m) => m.senderId !== userId && (!m.lastSeenAtByUser || !m.lastSeenAtByUser[userId])
					).length

					return (
						<div
							key={group._id}
							onClick={() => handleSelectGroup(group._id)}
							className={cn(
								'flex cursor-pointer items-center justify-between rounded-lg border px-3 py-2 transition-all duration-150',
								'hover:border-sidebar-border hover:bg-sidebar-accent',
								isSelected && 'border-blue-400 bg-blue-500/20 shadow-sm'
							)}
						>
							<div className='flex flex-col truncate'>
								<p className='truncate text-sm font-semibold text-wrap mb-2'>{group.titleVN}</p>
								
							</div>

							<div className='flex flex-col items-end'>
								{unreadCount > 0 && (
									<span className='mb-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm'>
										{unreadCount}
									</span>
								)}
								<span className='whitespace-nowrap text-xs font-medium text-gray-500'>{time}</span>
							</div>
						</div>
					)
				})}
			</nav>
		</div>
	)
}
