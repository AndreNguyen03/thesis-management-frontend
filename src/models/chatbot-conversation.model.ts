import type { GetFieldNameReponseDto } from './field.model'
import type { GetMajorMiniDto } from './major.model'
import type { GetRequirementNameReponseDto } from './requirement.model'
import type { ResponseMiniLecturerDto } from './users'

export interface TopicSnapshot {
	_id: string
	titleVN: string
	titleEng: string
	description: string
	fields: GetFieldNameReponseDto[]
	requirements: GetRequirementNameReponseDto[]
	major: GetMajorMiniDto
	lecturers: ResponseMiniLecturerDto[]
	maxStudents: number
	type: string
}
export interface ConversationMessage {
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
export interface TopicResult {
	index: number
	id: string
	titleVN: string
	titleENG: string
	description: string
	fields: string
	requirements: string
	major: string
	lecturers: string
	maxStudents: number
	type: string
}
export interface AddMessgePayload {
	role: 'user' | 'assistant'
	content: string
	topics?: TopicSnapshot[]
}
