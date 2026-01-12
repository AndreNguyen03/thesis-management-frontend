import type { GetFaculty } from './faculty.model'
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
	lecturers?: LecturerSnapshot[] // Lưu lecturers từ search_lecturers tool
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
export interface PublicationDto {
	title: string
	journal: string
	conference: string
	link?: string
	year: string
	type: string
	citations: number
}
export interface LecturerSnapshot {
	_id: string
	fullName: string
	email: string
	bio?: string
	title: string
	faculty?: GetFaculty
	areaInterest?: string[]
	researchInterests?: string[]
	publications?: PublicationDto[]
	similarityScore?: number
}
export interface LecturerResult extends LecturerSnapshot {
	index: string
}
export interface AddMessgePayload {
	role: string
	content: string
	topics?: TopicSnapshot[]
	lecturers?: LecturerSnapshot[]
}
