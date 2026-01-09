import type { GetFieldNameReponseDto } from './field.model'
import type { GetMajorMiniDto } from './major.model'
import type { GetRequirementNameReponseDto } from './requirement.model'
import type { ResponseMiniLecturerDto } from './users'

export interface ConversationMessage {
	index?: string
	id: string
	role: 'user' | 'assistant'
	content: string
	topics?: TopicSnapshot[] // Lưu topics từ search_topics tool
	timestamp: Date
	isStreaming?: boolean
}
export interface GetConversationsDto {
	_id: string
	title: string
	messages: ConversationMessage[]
	status: 'active' | 'archived'
	lastMessageAt: Date
}
export interface TopicResult extends TopicSnapshot {
	index: string
}
export interface TopicSnapshot {
	_id: string
	titleVN: string
	titleEng: string
	description: string
	fields: string
	requirements: string
	major: string
	lecturers: string
	maxStudents: number
	type: string
	similarityScore: number
}
export interface AddMessgePayload {
	role: string
	content: string
	topics?: TopicSnapshot[]
}
