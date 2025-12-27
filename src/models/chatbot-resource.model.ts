export interface ChatbotResource {
	_id: string
	title: string
	url?: string
	content?: string
	status: ResourceStatus
	type: ResourceType
	metadata?: {
		crawledAt?: string
		embeddedAt?: string
		wordCount?: number
		chunkCount?: number
		error?: string
		progress?: number
	}
	createdBy?: {
		_id: string
		fullName: string
	}
	createdAt: string
	updatedAt: string
}

export type ResourceStatus = 'pending' | 'crawling' | 'embedding' | 'completed' | 'failed'
export type ResourceType = 'url' | 'file' | 'text'

export interface CrawlProgress {
	resourceId: string
	status: ResourceStatus
	progress: number
	message: string
	error?: string
	metadata?: {
		wordCount?: number
		chunkCount?: number
	}
}

export interface GetPaginatedResourcesDto {
	data: ChatbotResource[]
	total: number
	page: number
	limit: number
}

export interface CreateResourceDto {
	title: string
	url?: string
	type: ResourceType
	content?: string
}

export interface UpdateResourceDto {
	title?: string
	url?: string
	content?: string
	status?: ResourceStatus
}

export const ResourceStatusLabels: Record<ResourceStatus, string> = {
	pending: 'Đang chờ',
	crawling: 'Đang crawl',
	embedding: 'Đang embedding',
	completed: 'Hoàn thành',
	failed: 'Thất bại'
}

export const ResourceTypeLabels: Record<ResourceType, string> = {
	url: 'URL',
	file: 'File',
	text: 'Văn bản'
}
