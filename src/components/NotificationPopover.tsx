import { type NotificationItem, NotificationType } from '@/models/notification.model'
import { AlertTriangle, Bell, Check, CheckCircle2, Info, Megaphone, XCircle } from 'lucide-react'
import { useState } from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui'
import { ScrollArea } from './ui/scroll-area'
import { formatTimeAgo } from '@/utils/format-time-ago'
import { useNavigate } from 'react-router-dom'
import { useNotificationSocket } from '@/hooks/useNotification'

export function NotificationPopover() {
	const { notifications, unreadCount, markAsRead, markAllAsRead, loadMore, hasMore } = useNotificationSocket()
	const [isOpen, setIsOpen] = useState(false)
	const navigate = useNavigate()

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
		markAllAsRead()
		setIsOpen(false)
	}

	const handleItemClick = (notification: NotificationItem) => {
		markAsRead(notification._id)
		const { type, metadata } = notification
		const topicId = metadata?.topicId || metadata?.id

		switch (type) {
			case NotificationType.ERROR:
				if (metadata?.actionUrl) {
					if (metadata.rejectedBy) {
						navigate(metadata.actionUrl, {
							state: {
								notiType: 'REJECTED',
								message: notification.message,
								rejectedBy: metadata.rejectedBy,
								reasonSub: metadata.reasonSub
							}
						})
					} else {
						navigate(metadata.actionUrl, {
							state: {
								flashType: 'ERROR',
								message: notification.message,
								reasonSub: metadata.reasonSub,
								actionUrl: `/detail-topic/${topicId}`
							}
						})
					}
				}
				break
			case NotificationType.SUCCESS:
				if (topicId) {
					navigate(`/detail-topic/${topicId}`, {
						state: { notiType: 'APPROVED', message: notification.message }
					})
				}
				break
			case NotificationType.WARNING:
				navigate(`/manage-topics`, {
					state: { notiType: 'REMINDER', message: notification.message }
				})
				break
			case NotificationType.SYSTEM:
				if (metadata?.actionUrl) {
					navigate(metadata.actionUrl, {
						state: { flashType: 'ERROR', message: 'Đăng ký đề tài bị từ chối', description: 'No' }
					})
				}
				break
			default:
				console.log('No action for this notification type')
				break
		}

		setIsOpen(false)
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
					<ScrollArea className='h-fit max-h-[400px] overflow-auto bg-white'>
						{notifications.length > 0 ? (
							<div className='divide-y divide-slate-100'>
								{notifications.map((item) => (
									<div
										key={item._id}
										onClick={() => handleItemClick(item)}
										className={`relative flex cursor-pointer gap-4 px-4 py-4 transition-colors hover:bg-slate-50 ${
											!item.isRead ? 'bg-blue-50/40' : 'bg-white'
										}`}
									>
										<div
											className={`mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${getBgColor(
												item.type as NotificationType
											)}`}
										>
											{getIcon(item.type as NotificationType)}
										</div>

										<div className='flex-1 space-y-1'>
											<div className='flex items-start justify-between'>
												<p
													className={`text-sm font-medium leading-none ${
														!item.isRead ? 'font-bold text-slate-900' : 'text-slate-700'
													}`}
												>
													{item.title}
												</p>
												{!item.isRead && (
													<span className='mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-600' />
												)}
											</div>
											<p className='line-clamp-2 text-sm leading-snug text-slate-500'>
												{item.message}
											</p>
											<p className='text-xs font-medium text-slate-400'>
												{formatTimeAgo(new Date(item.createdAt).toISOString())}
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
						{hasMore ? (
							<Button
								variant='ghost'
								className='h-8 w-full text-xs text-slate-500 hover:text-slate-900'
								onClick={loadMore}
							>
								Xem các thông báo trước đó
							</Button>
						) : (
							<p className='text-center text-xs text-slate-400'>Không còn thông báo cũ</p>
						)}
					</div>
				</PopoverContent>
			</Popover>
		</div>
	)
}

export default NotificationPopover
