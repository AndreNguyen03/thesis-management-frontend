import type { GetPaginatedObject } from './paginated-object.model'
import type { ResponseMiniLecturerDto, ResponseMiniStudentDto } from './users'

export interface IStudentRegistration {
	_id: string
	topicId: string
	titleVN: string
	titleEng: string
	type: string
	major: string
	topicStatus: string
	registrationStatus: string
	registeredAt: Date
	lecturers: ResponseMiniLecturerDto[]
	periodName: string
	periodId: string	
}

export interface PaginatedStudentRegistration extends GetPaginatedObject {
	data: IStudentRegistration[]
}

export interface RelatedStudentInTopic {
	approvedStudents: RegistrationDto[]
	pendingStudents: RegistrationDto[]
}

export interface RegistrationDto {
	_id: string
	student: ResponseMiniStudentDto
	createdAt: Date
	status: string
	note: string
}

export interface QueryReplyRegistration {
	status?: string
	lecturerResponse?: string
	rejectionReasonType?: string
	studentRole?: typeof StudentTopicRole
}

export const StudentTopicRole = {
	LEADER: 'leader',
	MEMBER: 'member'
}

export const RejectionReasonType = {
	FULL_SLOT: 'full_slot',
	GPA_LOW: 'gpa_low',
	SKILL_MISMATCH: 'skill_mismatch',
	OTHER: 'other'
}
