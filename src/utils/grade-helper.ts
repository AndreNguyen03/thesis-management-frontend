export const getGradeColor = (score?: number): string => {
	if (!score) return 'bg-gray-100 text-gray-700'
	if (score >= 9) return 'bg-green-100 text-green-700'
	if (score >= 8) return 'bg-blue-100 text-blue-700'
	if (score >= 7) return 'bg-yellow-100 text-yellow-700'
	if (score >= 5) return 'bg-orange-100 text-orange-700'
	return 'bg-red-100 text-red-700'
}

export const getGradeText = (score?: number): string => {
	if (!score) return 'Chưa chấm'
	if (score >= 9) return 'Xuất sắc'
	if (score >= 8) return 'Giỏi'
	if (score >= 7) return 'Khá'
	if (score >= 5) return 'Trung bình'
	return 'Yếu'
}

export const getStatusColor = (status: string): string => {
	const statusMap: Record<string, string> = {
		draft: 'bg-gray-100 text-gray-700',
		under_review: 'bg-yellow-100 text-yellow-700',
		approved: 'bg-green-100 text-green-700',
		rejected: 'bg-red-100 text-red-700',
		completed: 'bg-blue-100 text-blue-700'
	}
	return statusMap[status] || 'bg-gray-100 text-gray-700'
}

export const getStatusLabel = (status: string): string => {
	const statusMap: Record<string, string> = {
		draft: 'Nháp',
		under_review: 'Đang xét duyệt',
		approved: 'Đã duyệt',
		rejected: 'Từ chối',
		completed: 'Hoàn thành'
	}
	return statusMap[status] || status
}

export const formatFileSize = (bytes?: number): string => {
	if (!bytes) return '0 KB'
	const units = ['B', 'KB', 'MB', 'GB']
	let size = bytes
	let unitIndex = 0
	while (size >= 1024 && unitIndex < units.length - 1) {
		size /= 1024
		unitIndex++
	}
	return `${size.toFixed(2)} ${units[unitIndex]}`
}

export const formatDate = (date?: Date | string): string => {
	if (!date) return '-'
	const d = new Date(date)
	return d.toLocaleDateString('vi-VN', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	})
}
