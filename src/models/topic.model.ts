import type { GetFieldNameReponseDto } from './field.model'
import type { GetPaginatedObject } from './paginated-object.model'
import type { IRegistration } from './registration.model'
import type { GetRequirementNameReponseDto } from './requirement.model'
import type { MiniActorInforDto, ResponseMiniLecturerDto, ResponseMiniStudentDto } from './users'

export interface DraftTopic {
	_id: string

	title: string

	description: string

	type: string

	major: string

	periodId: string

	maxStudents: number

	createByInfo: MiniActorInforDto

	createdAt: Date

	updatedAt: Date

	currentStatus: string

	currentPhase: string

	fields: GetFieldNameReponseDto[]

	requirements: GetRequirementNameReponseDto[]

	students: ResponseMiniStudentDto[]

	lecturers: ResponseMiniLecturerDto[]
}
export interface PaginatedDraftTopics extends GetPaginatedObject {
	data: DraftTopic[]
}
export interface Topic {
	_id: string

	title: string

	description: string	

	type: string

	createBy: string

	status: string

	major: string

	lecturerNames: string[]

	requirementNames: string[]

	fieldNames: string[]

	studentNames: string[]

	maxStudents: number

	deadline: Date

	createdAt: Date

	updatedAt: Date

	isRegistered: boolean

	isSaved: boolean
}

export interface CanceledRegisteredTopic extends Topic {
	lastestCanceledRegisteredAt: Date
}
export interface ITopicDetail extends Topic {
	allUserRegistrations: IRegistration[] // mới chỉ là các đăng ký của người dùng với topic
}

export interface LecturerOption {
	_id: string
	fullName: string
	email: string
	faculty?: string
	departmentId?: string
}

export interface StudentOption {
	_id: string
	studentCode: string
	fullName: string
	email: string
}

export interface MajorOption {
	_id: string
	name: string
	departmentId: string
}

export interface DepartmentOption {
	_id: string
	name: string
}

export interface FieldOption {
	_id: string
	name: string
	description?: string
}

export interface FileOption {
	_id: string
	name: string
	filePath: string
}

export type TopicType = 'Đồ án' | 'Khóa luận' | 'NCKH'

export type TopicStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'closed'

export interface SavedUserRef {
	userId: string
	savedAt: string
}

export interface CreateTopicPayload {
	title: string
	description: string
	type: 'Đồ án' | 'Khóa luận' | 'NCKH'
	majorId: string
	departmentId: string
	lecturerIds: string[]
	coAdvisorIds?: string[]
	studentIds?: string[]
	fileIds?: string[]
	maxStudents: number
	deadline?: string
	requirements: string[]
	references?: { name: string; url?: string }[]
}
