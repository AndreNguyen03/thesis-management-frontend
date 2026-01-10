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

export function getDurationString(start: string, end: string) {
	const startDate = new Date(start)
	const endDate = new Date(end)
	let diff = Math.floor((endDate.getTime() - startDate.getTime()) / 1000)
	if (diff <= 0) return '0 phút'
	const days = Math.floor(diff / (3600 * 24))
	diff -= days * 3600 * 24
	const hours = Math.floor(diff / 3600)
	diff -= hours * 3600
	const minutes = Math.floor(diff / 60)
	let result = ''
	if (days > 0) result += `${days} ngày `
	if (hours > 0) result += `${hours} giờ `
	if (minutes > 0) result += `${minutes} phút`
	return result.trim()
}
export function renderMarkdown(text: string): string {
	// Bold: **text**
	let html = text.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
	// List: * item
	html = html.replace(/^\s*\*\s+(.*)$/gm, '<li>$1</li>')
	// Gom các <li> liên tiếp thành 1 <ul>
	html = html.replace(/(<li>[\s\S]*?<\/li>)+/g, (match) => `<ul>${match}</ul>`)
	// Line breaks: \n
	html = html.replace(/\n{2,}/g, '<br/><br/>').replace(/\n/g, '<br/>')
	return html
}
