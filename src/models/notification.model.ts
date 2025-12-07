import type { GetPaginatedObject } from './paginated-object.model'

export const NotificationType = {
	SYSTEM: 'SYSTEM',
	SUCCESS: 'SUCCESS',
	WARNING: 'WARNING',
	ERROR: 'ERROR',
	INFO: 'INFO'
} as const

export type NotificationType = (typeof NotificationType)[keyof typeof NotificationType]

export interface NotificationItem {
	_id: string
	title: string
	message: string
	type: string
	isRead: boolean
	createdAt: Date
	metadata?: Record<string, any>
}

export interface PaginatedNotifications extends GetPaginatedObject {
	data: NotificationItem[]
}
// export const MOCK_NOTIFICATIONS: NotificationItem[] = [
// 	{
// 		_id: '1',
// 		type: NotificationType.ERROR,
// 		title: 'Đăng ký bị từ chối',
// 		message:
// 			'Giảng viên Nguyễn Văn A đã từ chối yêu cầu tham gia đề tài "Website tin tức". Lý do: Kỹ năng React chưa đạt.',
// 		createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
// 		isRead: false,
// 		link: '/topics/topic_123'
// 	},
// 	{
// 		_id: '2',
// 		type: NotificationType.WARNING,
// 		title: 'Nhắc nhở nộp đề tài',
// 		message: 'Bạn hiện tại mới nộp 2/5 đề tài yêu cầu. Vui lòng hoàn thành trước ngày 15/10.',
// 		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
// 		isRead: false,
// 		link: '/lecturer/my-topics'
// 	},
// 	{
// 		_id: '3',
// 		type: NotificationType.SUCCESS,
// 		title: 'Đăng ký thành công',
// 		message: 'Chúc mừng! Bạn đã trở thành thành viên chính thức của đề tài "AI Chatbot".',
// 		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
// 		isRead: true,
// 		link: '/topics/topic_456'
// 	},
// 	{
// 		_id: '4',
// 		type: NotificationType.INFO,
// 		title: 'Phân công đồng hướng dẫn',
// 		message: 'Bạn đã được thêm làm Giảng viên đồng hướng dẫn cho đề tài "Blockchain Voting".',
// 		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
// 		isRead: true,
// 		link: '/topics/topic_789'
// 	},
// 	{
// 		_id: '5',
// 		type: NotificationType.SYSTEM,
// 		title: 'Mở đợt đăng ký HK1',
// 		message: 'Hệ thống đã mở đợt đăng ký đề tài cho Học kỳ 1 năm học 2025-2026.',
// 		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
// 		isRead: true,
// 		link: '/periods/hk1_2025'
// 	},
// 	{
// 		_id: '6',
// 		type: NotificationType.SUCCESS,
// 		title: 'Ban chủ nhiệm đã chấp thuận đề tài',
// 		message: 'Đề tài "Ứng dụng IoT trong nông nghiệp" của bạn đã được Ban chủ nhiệm khoa chấp thuận.',
// 		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
// 		isRead: false,
// 		link: '/topics/topic_999'
// 	},
// 	{
// 		_id: '7',
// 		type: NotificationType.ERROR,
// 		title: 'Ban chủ nhiệm từ chối đề tài',
// 		message:
// 			'Đề tài "Phân tích dữ liệu lớn" của bạn đã bị Ban chủ nhiệm khoa từ chối. Lý do: Nội dung chưa phù hợp với định hướng khoa.',
// 		createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
// 		isRead: false,
// 		link: '/topics/topic_888'
// 	}
// ]
