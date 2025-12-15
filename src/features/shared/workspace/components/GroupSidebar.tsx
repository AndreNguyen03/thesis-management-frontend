import { cn } from '@/lib/utils'
import type { Group } from '@/models/groups.model'
import { useChat } from '@/hooks'
import { useAppSelector } from '@/store'
import { getUserIdFromAppUser } from '@/utils/utils'
import { useMemo } from 'react'

interface Participant {
	id: string
	fullName: string
	avatarUrl: string
}

interface GroupSidebarProps {
	groups: Group[]
	selectedGroupId: string
	onSelectGroup: (id: string) => void
	participants: Participant[]
}

const formatTime = (createdAt: string): string => {
	if (!createdAt) return ''
	const date = new Date(createdAt)
	return date.toLocaleString('vi-VN', {
		hour: '2-digit',
		minute: '2-digit',
		day: '2-digit',
		month: '2-digit'
	})
}

export const GroupSidebar = ({ groups, selectedGroupId, onSelectGroup, participants }: GroupSidebarProps) => {
	const { messagesByGroup, markGroupSeen } = useChat() || {}

	const user = useAppSelector((state) => state.auth.user)

	const userId = getUserIdFromAppUser(user)

	const participantMap = useMemo(() => {
		const map = new Map<string, Participant>()
		participants.forEach((p) => map.set(p.id, p))
		return map
	}, [participants])

	const handleSelectGroup = (groupId: string) => {
		console.log('Selecting group:', groupId)
		onSelectGroup(groupId)
		markGroupSeen?.(groupId) // 🔹 mark seen ngay khi mở group
	}

	return (
		<div className='flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar'>
			{/* Groups List */}
			<nav className='flex-1 space-y-1 overflow-y-auto p-2'>
				{groups.map((group) => {
					// Lấy tin nhắn của group này từ context
					const msgs = messagesByGroup?.[group._id] ?? []

					// Lấy last message
					const lastMessage = msgs.length > 0 ? msgs[msgs.length - 1] : group.lastMessage

					const senderName = participantMap.get(lastMessage?.senderId || '')?.fullName || 'Unknown'
					const content = lastMessage?.content || 'Chưa có tin nhắn'
					const time = formatTime(lastMessage?.createdAt)

					// Tính số lượng tin nhắn chưa đọc cho user hiện tại
					const unreadCount = msgs.filter(
						(m) => m.senderId !== userId && (!m.lastSeenAtByUser || !m.lastSeenAtByUser[userId])
					).length

					return (
						<div
							key={group._id}
							onClick={() => handleSelectGroup(group._id)}
							className={cn(
								'sidebar-item group cursor-pointer rounded-md px-3 py-2 transition-colors',
								'hover:bg-sidebar-accent/60',
								selectedGroupId === group._id && 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/15'
							)}
						>
							<div className='flex min-w-0 items-center justify-between'>
								<div className='min-w-0 flex-1'>
									<p className='truncate text-sm font-medium'>{group.titleVN}</p>
									<div className='flex items-center justify-between text-xs opacity-60'>
										<div className='flex min-w-0 gap-1'>
											<p className='max-w-[120px] truncate'>{senderName}</p>
											<span>-</span>
											<p className='max-w-[120px] truncate'>{content}</p>
										</div>
									</div>
								</div>

								<div className='ml-2 flex flex-col items-end'>
									{unreadCount > 0 && (
										<span className='mb-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white'>
											{unreadCount}
										</span>
									)}
									<span className='whitespace-nowrap text-[10px] opacity-60'>{time}</span>
								</div>
							</div>
						</div>
					)
				})}
			</nav>
		</div>
	)
}
