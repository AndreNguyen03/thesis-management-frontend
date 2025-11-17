import type { GetPaginatedObject } from './paginated-object.model'

export interface KnowledgeSource {
	_id: string
	name: string
	description: string
	source_type: keyof typeof SourceType
	source_location: string
	status: keyof typeof KnowledgeStatus
	processing_status: keyof typeof ProcessingStatus
	owner_info: OwnerDto
	last_processed_at: Date
	createdAt: Date
	updatedAt: Date
}

export interface OwnerDto {
	_id: string
	fullName: string
	role: string
}

export const ProcessingStatus = {
	COMPLETED: 'Completed',
	PENDING: 'Pending',
	FAILED: 'Failed'
} as const

export const KnowledgeStatus = {
	ENABLED: 'ENABLED',
	DISABLED: 'DISABLED'
} as const

export const SourceType = {
	URL: 'URL',
	FILE: 'FILE'
} as const

export interface GetPaginatedKnowledgeDto extends GetPaginatedObject {
	data: KnowledgeSource[]
}
