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
