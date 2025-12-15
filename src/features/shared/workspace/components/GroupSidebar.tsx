import { Settings, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Group } from '@/models/groups.model'

interface GroupSidebarProps {
	groups: Group[]
	selectedGroupId: string
	onSelectGroup: (id: string) => void
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

export const GroupSidebar = ({ groups, selectedGroupId, onSelectGroup }: GroupSidebarProps) => {
	return (
		<div className='flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar'>
			{/* Groups List */}
			<nav className='flex-1 space-y-1 overflow-y-auto p-2'>
				{groups.map((group) => {
					const lastMsg = group.lastMessage
					const senderName = lastMsg?.sender?.fullName || 'Unknown'
					const content = lastMsg?.content || 'Chưa có tin nhắn'
					const time = formatTime(lastMsg?.createdAt)

					return (
						<div
							key={group._id}
							onClick={() => onSelectGroup(group._id)}
							className={cn(
								'sidebar-item group cursor-pointer rounded-md px-3 py-2 transition-colors',
								'hover:bg-sidebar-accent/60', // 👈 hover đậm nhẹ
								selectedGroupId === group._id && 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/15' // 👈 selected xanh nhạt
							)}
						>
							<div className='min-w-0 flex-1'>
								<p className='truncate text-sm font-medium'>{group.topic.titleVN}</p>
								<div className='flex items-center justify-between text-xs opacity-60'>
									<div className='flex min-w-0 gap-1'>
										<p className='max-w-[120px] truncate'>{senderName}</p>
										<span>-</span>
										<p className='max-w-[120px] truncate'>{content}</p>
									</div>
									<span className='ml-2 whitespace-nowrap text-right'>{time}</span>
								</div>
							</div>
						</div>
					)
				})}
			</nav>

			{/* Footer Actions */}
			<div className='space-y-1 border-t border-sidebar-border p-3'>
				<button className='sidebar-item w-full'>
					<Plus className='h-4 w-4' />
					<span className='text-sm'>Tạo nhóm mới</span>
				</button>
				<button className='sidebar-item w-full'>
					<Settings className='h-4 w-4' />
					<span className='text-sm'>Cài đặt</span>
				</button>
			</div>
		</div>
	)
}
