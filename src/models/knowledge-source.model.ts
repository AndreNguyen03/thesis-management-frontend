import type { GetPaginatedObject } from './paginated-object.model'
export interface KnowledgeMetadata {
	wordCount?: number
	chunkCount?: number
	fileSize?: number
	mimeType?: string
	progress?: number
	errorMessage?: string
}
export interface KnowledgeSource {
	_id: string
	name: string
	description: string
	source_type: KnowledgeType
	source_location: string
	status: KnowledgeStatusType
	processing_status: ProcessingStatusType
	owner_info: OwnerDto
	last_processed_at: Date
	createdAt: Date
	updatedAt: Date
	metadata?: KnowledgeMetadata
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

export type KnowledgeStatusType = 'ENABLED' | 'DISABLED'
export type KnowledgeType = 'TOPIC-REGISTERING' | 'TOPIC-LIBRARY' | 'LECTURER-PROFILE' | 'FILE' | 'URL'
export type ProcessingStatusType = 'Completed' | 'Pending' | 'Failed'
export interface UpdateKnowledgeSourcePayload {
	name: string
	description: string
	status: KnowledgeStatusType
	processing_status: ProcessingStatusType
	owner: string
	last_processed_at: Date | null
	plot_embedding_voyage_3_large: number[]
}
export const mapKnowledgeStatusLabel: Record<string, { label: string; color: string }> = {
	ENABLED: { label: 'Kích hoạt', color: 'text-center bg-gray-100 text-gray-700' },
	DISABLED: { label: 'Chưa kích hoạt', color: 'text-center bg-blue-100 text-blue-700' }
}

export const mapProcessingStatusLabel: Record<string, { label: string; color: string }> = {
	Completed: { label: 'Hoàn thành', color: 'text-center bg-green-100 text-green-700' },
	Pending: { label: 'Đang chờ', color: 'text-center bg-yellow-100 text-yellow-700' },
	Failed: { label: 'Thất bại', color: 'text-center bg-red-100 text-red-700' }
} as const

export const mapKnowledgeType: Record<string, string> = {
	'TOPIC-REGISTERING': 'Đề tài đăng ký',
	'TOPIC-LIBRARY': 'Thư viện đề tài',
	'LECTURER-PROFILE': 'Hồ sơ giảng viên',
	FILE: 'Tệp tin',
	URL: 'URL'
}
export const mapSourceTypeLabel: Record<string, { label: string; color: string }> = {
	URL: { label: 'URL', color: 'text-center bg-gray-100 text-gray-700' },
	FILE: { label: 'Tệp tin', color: 'text-center bg-blue-100 text-blue-700' }
} as const
