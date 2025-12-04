import { MOCK_NOTIFICATIONS, type NotificationItem, NotificationType } from '@/models/notification.model'
import { AlertTriangle, Bell, Check, CheckCircle2, Info, Megaphone, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui'
import { ScrollArea } from './ui/scroll-area'
import { formatTimeAgo } from '@/utils/format-time-ago'

export function NotificationPopover() {
	const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS)
	const [isOpen, setIsOpen] = useState(false)

	// Đếm số chưa đọc
	const unreadCount = notifications.filter((n) => !n.isRead).length

	// Hàm lấy Icon theo Type
	const getIcon = (type: NotificationType) => {
		switch (type) {
			case NotificationType.SUCCESS:
				return <CheckCircle2 className='h-5 w-5 text-green-600' />
			case NotificationType.WARNING:
				return <AlertTriangle className='h-5 w-5 text-yellow-600' />
			case NotificationType.ERROR:
				return <XCircle className='h-5 w-5 text-red-600' />
			case NotificationType.SYSTEM:
				return <Megaphone className='h-5 w-5 text-blue-600' />
			default:
				return <Info className='h-5 w-5 text-slate-600' />
		}
	}

	// Hàm lấy Background Icon theo Type
	const getBgColor = (type: NotificationType) => {
		switch (type) {
			case NotificationType.SUCCESS:
				return 'bg-green-100'
			case NotificationType.WARNING:
				return 'bg-yellow-100'
			case NotificationType.ERROR:
				return 'bg-red-100'
			case NotificationType.SYSTEM:
				return 'bg-blue-100'
			default:
				return 'bg-slate-100'
		}
	}

	const handleMarkAllRead = () => {
		setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
	}

	const handleItemClick = (id: string, link?: string) => {
		setNotifications((prev) => prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)))
		if (link) {
			console.log('Navigate to:', link)
			setIsOpen(false)
		}
	}

	return (
		<div className='flex items-start justify-center'>
			<Popover open={isOpen} onOpenChange={setIsOpen}>
				<PopoverTrigger asChild>
					<Button
						variant='ghost'
						size='icon'
						className='relative border border-slate-200 bg-white hover:bg-slate-50'
					>
						<Bell className='h-5 w-5 text-slate-600' />
						{unreadCount > 0 && (
							<span className='absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white'>
								{unreadCount > 9 ? '9+' : unreadCount}
							</span>
						)}
					</Button>
				</PopoverTrigger>

				<PopoverContent className='w-80 p-0 shadow-xl sm:w-96' align='end'>
					{/* Header */}
					<div className='flex items-center justify-between rounded-t-md border-b bg-white px-4 py-3'>
						<h4 className='font-semibold text-slate-900'>Thông báo</h4>
						{unreadCount > 0 && (
							<button
								onClick={handleMarkAllRead}
								className='flex items-center gap-1 text-xs font-medium text-blue-600 transition-colors hover:text-blue-800'
							>
								<Check className='h-3 w-3' /> Đánh dấu đã đọc
							</button>
						)}
					</div>

					{/* List */}
					<ScrollArea className='h-[400px] bg-white'>
						{notifications.length > 0 ? (
							<div className='divide-y divide-slate-100'>
								{notifications.map((item) => (
									<div
										key={item._id}
										onClick={() => handleItemClick(item._id, item.link)}
										className={`relative flex cursor-pointer gap-4 px-4 py-4 transition-colors hover:bg-slate-50 ${!item.isRead ? 'bg-blue-50/40' : 'bg-white'}`}
									>
										{/* Icon Box */}
										<div
											className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getBgColor(item.type)}`}
										>
											{getIcon(item.type)}
										</div>

										{/* Content */}
										<div className='flex-1 space-y-1'>
											<div className='flex items-start justify-between'>
												<p
													className={`text-sm font-medium leading-none ${!item.isRead ? 'font-bold text-slate-900' : 'text-slate-700'}`}
												>
													{item.title}
												</p>
												{/* Chấm xanh chưa đọc */}
												{!item.isRead && (
													<span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600' />
												)}
											</div>

											<p className='line-clamp-2 text-sm leading-snug text-slate-500'>
												{item.message}
											</p>

											<p className='text-xs font-medium text-slate-400'>
												{formatTimeAgo(item.createdAt)}
											</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className='flex h-40 flex-col items-center justify-center gap-2 text-slate-500'>
								<Bell className='h-8 w-8 opacity-20' />
								<p className='text-sm'>Bạn không có thông báo nào.</p>
							</div>
						)}
					</ScrollArea>

					{/* Footer */}
					<div className='rounded-b-md border-t bg-slate-50 p-2'>
						<Button variant='ghost' className='h-8 w-full text-xs text-slate-500 hover:text-slate-900'>
							Xem các thông báo trước đó
						</Button>
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}
export default NotificationPopover
