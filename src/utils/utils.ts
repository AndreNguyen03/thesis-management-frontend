import type { AppUser } from '@/models'
import type { GetCustomMiniPeriodInfoRequestDto, PhaseType } from '@/models/period.model'
import { UAParser } from 'ua-parser-js'

export const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const getDeviceInfo = () => {
	const parser = new UAParser()
	const result = parser.getResult()

	return `${result.browser.name} ${result.browser.version} - ${result.os.name} ${result.os.version} - ${result.device.model || 'Desktop'} - UA: ${result.ua}`
}

export const getResultColor = (result: string) => {
	switch (result) {
		case 'Xuất sắc':
			return 'bg-yellow-500 text-yellow-50'
		case 'Giỏi':
			return 'bg-blue-500 text-blue-50'
		default:
			return 'bg-gray-500 text-gray-50'
	}
}

export const getDifficultyColor = (level: number) => {
	if (level <= 2) return 'bg-blue-500 text-blue-50'
	if (level <= 3) return 'bg-gray-500 text-gray-50'
	return 'bg-red-500 text-red-50'
}

export function getInitials(name: string) {
	return name
		.split(' ')
		.map((n) => n[0])
		.join('')
		.toUpperCase()
}

export function formatDate(dateStr: string) {
	const d = new Date(dateStr)
	return d.toLocaleDateString('vi-VN')
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function decodeJwt<T = any>(token: string): T | null {
	try {
		const payload = token.split('.')[1]
		const decoded = JSON.parse(atob(payload))
		return decoded as T
	} catch (err) {
		console.error('Failed to decode JWT:', err)
		return null
	}
}
export const PhaseInfo: Record<PhaseType, { order: number; continue: string; continuePhaseId: string; label: string }> =
	{
		empty: {
			order: 0,
			continue: 'Nộp đề tài',
			continuePhaseId: 'submit_topic',
			label: 'Khởi đầu'
		},
		submit_topic: {
			order: 1,
			continue: 'Mở đăng ký',
			continuePhaseId: 'open_registration',
			label: 'Nộp đề tài'
		},
		open_registration: {
			order: 2,
			continue: 'Thực hiện',
			continuePhaseId: 'execution',
			label: 'Mở đăng ký'
		},
		execution: {
			order: 3,
			continue: 'Hoàn thành',
			continuePhaseId: 'completion',
			label: 'Thực hiện'
		},
		completion: {
			order: 4,
			continue: 'end',
			continuePhaseId: 'end',
			label: 'Hoàn thành -   '
		}
	}

export const PhaseStatusMap: Record<
	'not_started' | 'ongoing' | 'completed',
	{ text: string; variant: 'gray' | 'lightBlue' | 'registered' }
> = {
	not_started: { text: 'Chưa bắt đầu', variant: 'gray' as const },
	ongoing: { text: 'Đang diễn ra', variant: 'lightBlue' as const },
	completed: { text: 'Đã hoàn thành', variant: 'registered' as const }
}

const typeLabels = {
	thesis: 'Khóa luận',
	scientific_research: 'Nghiên cứu khoa học'
} as const

export const getPeriodTitle = (period: GetCustomMiniPeriodInfoRequestDto) =>
	`Kì hiện tại: {period.year} • HK {period.semester} • {typeLabels[period.type]}`

export const getUserIdFromAppUser = (user: AppUser | null): string => {
	if (!user) return ''

	// Student / Lecturer / Faculty board
	if ('userId' in user) {
		return user.userId
	}

	// Admin
	if ('_id' in user) {
		return user._id
	}

	return ''
}


export const isSameDay = (d1: string, d2: string) => {
    const date1 = new Date(d1)
    const date2 = new Date(d2)
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    )
}

export const formatDayLabel = (dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date()
    yesterday.setDate(today.getDate() - 1)

    if (isSameDay(dateStr, today.toISOString())) return 'Hôm nay'
    if (isSameDay(dateStr, yesterday.toISOString())) return 'Hôm qua'
    return date.toLocaleDateString('vi-VN')
}