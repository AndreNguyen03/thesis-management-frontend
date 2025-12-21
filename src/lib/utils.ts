import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const downloadFileWithURL = async (url: string, fileName: string) => {
	const response = await fetch(url)
	const blob = await response.blob()
	const blobUrl = URL.createObjectURL(blob)

	const link = document.createElement('a')
	link.href = blobUrl
	link.download = fileName
	document.body.appendChild(link)
	link.click()
	document.body.removeChild(link)
}

export function splitFileName(fileName: string) {
	const lastDot = fileName.lastIndexOf('.')
	if (lastDot === -1) return { name: fileName, ext: '' }
	return {
		name: fileName.slice(0, lastDot),
		ext: fileName.slice(lastDot) // bao gồm dấu chấm
	}
}

export function toDatetimeLocal(dt: string) {
	if (!dt) return ''
	const date = new Date(dt)
	date.setMinutes(date.getMinutes() - date.getTimezoneOffset())
	return date.toISOString().slice(0, 16)
}
export function fromDatetimeLocal(local: string) {
	if (!local) return ''
	const date = new Date(local)
	date.setMinutes(date.getMinutes() + date.getTimezoneOffset())
	return date.toISOString()
}
