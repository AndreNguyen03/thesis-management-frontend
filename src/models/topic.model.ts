import type { GetFieldNameReponseDto } from './field.model'
import type { GetMajorMiniDto } from './major.model'
import type { GetPaginatedObject } from './paginated-object.model'
import type { GetRequirementNameReponseDto } from './requirement.model'
import type { MiniActorInforDto, ResponseMiniLecturerDto, ResponseMiniStudentDto } from './users'
export interface PaginationQueryParams {
	limit?: number
	page?: number
	search_by?: string
	query?: string
	sort_by?: string
	sort_order?: string
}
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

	titleVN: string

	titleEng: string

	description: string

	type: string

	createByInfo: ResponseMiniLecturerDto

	currentPhase: string

	currentStatus: string

	status: string

	major: GetMajorMiniDto

	lecturers: ResponseMiniLecturerDto[]

	requirements: GetRequirementNameReponseDto[]

	fields: GetFieldNameReponseDto[]

	students: ResponseMiniStudentDto[]

	maxStudents: number

	deadline: Date

	createdAt: Date

	updatedAt: Date

	isRegistered: boolean

	isSaved: boolean
}
export interface GetPaginatedTopics extends GetPaginatedObject {
	data: Topic[]
}

export interface CanceledRegisteredTopic extends Topic {
	lastestCanceledRegisteredAt: Date
}
export interface ITopicDetail extends Topic {
	//allUserRegistrations: IRegistration[] // mới chỉ là các đăng ký của người dùng với topic
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

export const topicStatusLabels = {
	draft: 'Bản nháp',
	submitted: 'Đã nộp',
	under_review: 'Đang xét duyệt',
	approved: 'Đã duyệt',
	rejected: 'Bị từ chối',
	pending_registration: 'Mở  đăng ký',
	registered: 'Đã đăng ký',
	full: 'Đã đủ số lượng',
	cancelled: 'Đã hủy',
	in_progress: 'Đang thực hiện',
	delayed: 'Bị trì hoãn',
	paused: 'Tạm ngưng',
	submitted_for_review: 'Đã nộp báo cáo',
	awaiting_evaluation: 'Chờ đánh giá',
	graded: 'Đã chấm điểm',
	reviewed: 'Đã kiểm tra',
	archived: 'Đã lưu trữ',
	rejected_final: 'Bị từ chối cuối cùng'
}
