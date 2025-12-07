export type RecipientMode = 'custom-instructors' | 'all-instructors' | 'all-students'

export const RECIPIENT_OPTIONS = [
	{ value: 'custom-instructors' as RecipientMode, label: 'Tùy chọn Giảng viên (Chọn từ danh sách)' },
	{ value: 'all-instructors' as RecipientMode, label: 'Tất cả Giảng viên trong đợt' },
	{ value: 'all-students' as RecipientMode, label: 'Tất cả Sinh viên trong đợt' }
]

export type SendData = {
	recipientMode: RecipientMode
	recipients: string[] // User IDs (chỉ cần khi custom-instructors)
	subject: string
	content: string
}
