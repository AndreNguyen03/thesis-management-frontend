import { cn } from '@/lib/utils'
import type { Group } from '@/models/groups.model'
import { useChat } from '@/hooks'
import { useAppSelector } from '@/store'
import { getUserIdFromAppUser } from '@/utils/utils'
import { useMemo } from 'react'

interface Participant {
	id: string
	fullName: string
	avatarUrl?: string
}

interface GroupSidebarProps {
	groups: Group[]
	selectedGroupId?: string
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
				{groups.map((group, index) => {
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

					// Thêm border-bottom cho tất cả items trừ item cuối cùng để tạo phân cách
					const isLastItem = index === groups.length - 1
					const itemBorderBottom = !isLastItem ? 'border-b border-sidebar-border/30' : ''

					return (
						<div
							key={group._id}
							onClick={() => handleSelectGroup(group._id)}
							className={cn(
								'sidebar-item group cursor-pointer rounded-lg px-4 py-3',
								'border border-sidebar-border/60 bg-white',
								'shadow-sm transition-all duration-200',
								'hover:border-sidebar-border hover:bg-sidebar-accent hover:shadow-md',
								selectedGroupId === group._id &&
									'relative border-blue-500/80 bg-blue-500/25 shadow-md ring-1 ring-blue-500/30',
								itemBorderBottom
							)}
						>
							<div className='flex min-w-0 items-center justify-between'>
								<div className='min-w-0 flex-1'>
									<p className='truncate text-sm font-semibold'>{group.titleVN}</p>{' '}
									{/* Giữ font-semibold cho title */}
									<div className='flex items-center justify-between text-xs opacity-80'>
										{' '}
										{/* Giữ opacity 80 */}
										<div className='flex min-w-0 gap-1'>
											<p className='font-medium'>
												{senderName.split(' ')[senderName.split(' ').length - 1]}
											</p>{' '}
											{/* Giữ font-medium cho sender */}
											<span>-</span>
											<p className='max-w-[120px] truncate'>{content}</p>
										</div>
									</div>
								</div>

								<div className='ml-2 flex flex-col items-end'>
									{unreadCount > 0 && (
										<span className='mb-1 rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm'>
											{unreadCount}
										</span>
									)}
									<span className='whitespace-nowrap text-xs font-medium opacity-80'>{time}</span>{' '}
									{/* Giữ xs và font-medium */}
								</div>
							</div>
						</div>
					)
				})}
			</nav>
		</div>
	)
}
