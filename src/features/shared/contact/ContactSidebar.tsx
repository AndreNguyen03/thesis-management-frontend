import { cn } from '@/lib/utils'
import type { DirectSidebarGroup } from '@/models/groups.model'
import type { ChatMessage } from '@/contexts/ChatSocketContext'
import { Search } from 'lucide-react'
import { useChat } from '@/hooks'
import { useAppSelector } from '@/store'
import { getAvatarInitials, getUserIdFromAppUser } from '@/utils/utils'

export const ContactSidebar = ({
	groups,
	selectedGroupId,
	onSelectGroup,
	searchQuery,
	onSearchChange
}: {
	groups: DirectSidebarGroup[]
	selectedGroupId?: string | null
	onSelectGroup: (id: string) => void
	searchQuery: string
	onSearchChange: (q: string) => void
}) => {
	const { messagesByGroup, markGroupSeen } = useChat() || {}

	const user = useAppSelector((state) => state.auth.user)

	const userId = getUserIdFromAppUser(user)

	const formatTime = (iso?: string) =>
		iso
			? new Date(iso).toLocaleString('vi-VN', {
					hour: '2-digit',
					minute: '2-digit',
					day: '2-digit',
					month: '2-digit',
					year: 'numeric'
				})
			: ''

	const handleSelectGroup = (groupId: string) => {
		onSelectGroup(groupId)
		markGroupSeen?.(groupId)
	}

	return (
		<div className='flex h-full w-80 flex-col border-r bg-sidebar'>
			<div className='p-3'>
				<div className='relative'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-50' />
					<input
						value={searchQuery}
						onChange={(e) => onSearchChange(e.target.value)}
						placeholder='Tìm kiếm...'
						className='w-full rounded-md bg-secondary px-9 py-2 text-sm'
					/>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto p-2'>
				{groups.map((g) => {
					// Lấy tin nhắn của group này từ context
					const msgs = messagesByGroup?.[g._id] ?? []

					// Lấy last message
					const lastMessage = g.lastMessage

					const content = lastMessage?.content ?? 'Chưa có tin nhắn'
					const time = formatTime(lastMessage?.createdAt)

					// Tính số lượng tin nhắn chưa đọc cho user hiện tại
					const unreadCount =
						msgs.length > 0
							? msgs.filter(
									(m: ChatMessage) =>
										m.senderId !== userId && (!m.lastSeenAtByUser || !m.lastSeenAtByUser[userId])
								).length
							: g.unreadCount || 0

					return (
						<div
							key={g._id}
							onClick={() => handleSelectGroup(g._id)}
							className={cn(
								'group cursor-pointer rounded-lg px-3 py-2 transition-all duration-150',
								'bg-sidebar-border',
								'hover:scale-[1.01] hover:bg-secondary/50 hover:shadow-sm',
								'border-b border-sidebar-border/20',
								selectedGroupId === g._id && 'bg-primary/20 shadow-inner ring-1 ring-primary/50'
							)}
						>
							<div className='flex items-center gap-3'>
								<div className='relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full'>
									{g.otherUser?.avatarUrl ? (
										<img
											src={g.otherUser.avatarUrl}
											alt={g.otherUser.fullName || 'User Avatar'}
											className='h-full w-full rounded-full object-cover'
										/>
									) : (
										<div className='flex h-full w-full items-center justify-center rounded-full bg-blue-500 font-bold text-white'>
											{getAvatarInitials(g.otherUser?.fullName)}
										</div>
									)}
								</div>
								<div className='flex min-w-0 flex-1 flex-col'>
									<p className='truncate text-sm font-semibold text-gray-800'>
										{g.otherUser.fullName}
									</p>
									<div className='mt-0.5 flex items-center justify-between'>
										<p className='truncate text-xs text-gray-600'>{content}</p>
										<div className='flex flex-col items-end gap-1'>
											{unreadCount > 0 && (
												<span className='rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-bold text-white shadow'>
													{unreadCount}
												</span>
											)}
											<span className='whitespace-nowrap text-[10px] text-gray-400'>{time}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					)
				})}
			</div>
		</div>
	)
}
