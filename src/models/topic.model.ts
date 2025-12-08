import type { GetFieldNameReponseDto } from './field.model'
import type { GetUploadedFileDto } from './file.model'
import type { GetMajorMiniDto } from './major.model'
import type { GetPaginatedObject } from './paginated-object.model'
import type { PeriodPhaseName } from './period-phase.models'
import type { MiniPeriod } from './period.model'
import type { RelatedStudentInTopic } from './registration.model'
import { PaginationQueryParamsDto, type SortOrder } from './query-params'
import type { GetRequirementNameReponseDto } from './requirement.model'
import type { GetMiniUserDto, MiniActorInforDto, ResponseMiniLecturerDto } from './users'
export interface GetDetailGrade {
	_id: string
	score: number
	note: string
	actorId: string
}
export interface GetGrade {
	averageScore: number
	detailGrades: GetDetailGrade[]
}
export interface GetPhaseHistoryDto {
	_id: string
	phaseName: PeriodPhaseName
	status: TopicStatus
	actor: GetMiniUserDto
	notes: string
	createdAt: Date
}

export interface DetailGrade {
	score: number
	note: string
	actorId: string
}

export interface Grade {
	averageScore: number
	detailGrades: DetailGrade[]
}

export interface AbstractTopic {
	_id: string

	titleVN: string

	titleEng: string

	description: string

	type: string

	major: GetMajorMiniDto

	fields: GetFieldNameReponseDto[]

	requirements: GetRequirementNameReponseDto[]

	students: RelatedStudentInTopic

	studentsNum: number

	lecturers: ResponseMiniLecturerDto[]

	grade: Grade

	createdAt: Date

	updatedAt: Date

	maxStudents: number

	currentStatus: string

	currentPhase: string

	allowManualApproval: boolean
}
export interface SubmittedTopic extends AbstractTopic {
	submittedAt: string
	createByInfo: MiniActorInforDto
	periodInfo: MiniPeriod
}
export interface GeneralTopic extends AbstractTopic {
	submittedAt: string
	lastStatusInPhaseHistory: GetPhaseHistoryDto
	createByInfo: MiniActorInforDto
	periodInfo: MiniPeriod
	// file
}
export interface PaginatedSubmittedTopics extends GetPaginatedObject {
	data: SubmittedTopic[]
}
export interface PaginatedGeneralTopics extends GetPaginatedObject {
	data: GeneralTopic[]
}
export interface DraftTopic extends AbstractTopic {}
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

	major: GetMajorMiniDto
	studentsNum: number

	lecturers: ResponseMiniLecturerDto[]

	requirements: GetRequirementNameReponseDto[]

	fields: GetFieldNameReponseDto[]

	maxStudents: number

	deadline: Date

	createdAt: Date

	updatedAt: Date

	isRegistered: boolean

	isSaved: boolean

	isEditable: boolean

	allowManualApproval: boolean

	students: RelatedStudentInTopic
}
export interface GetPaginatedTopics extends GetPaginatedObject {
	data: Topic[]
}

export interface CanceledRegisteredTopic extends Topic {
	lastestCanceledRegisteredAt: Date
}

export interface ITopicDetail extends Topic {
	files: GetUploadedFileDto[]
	phaseHistories: GetPhaseHistoryDto[]
	grade: GetGrade
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

export type TopicType = 'thesis' | 'scientific_research'
export type TopicStatus =
	// Pha 1 - Nộp đề tài
	| 'draft'
	| 'submitted'
	| 'under_review'
	| 'approved'
	| 'rejected'
	// Pha 2 - Mở đăng ký
	| 'available'
	| 'pending_registration'
	| 'registered'
	| 'full'
	| 'cancelled'
	// Pha 3 - Thực hiện đề tài
	| 'in_progress'
	| 'delayed'
	| 'paused'
	| 'submitted_for_review'
	| 'awaiting_evaluation'
	// Pha 4 - Hoàn tất
	| 'graded'
	| 'reviewed'
	| 'archived'
	| 'rejected_final'
export const TopicStatus = {
	DRAFT: 'draft',
	SUBMITTED: 'submitted',
	UNDER_REVIEW: 'under_review',
	APPROVED: 'approved',
	REJECTED: 'rejected',
	AVAILABLE: 'available',
	PENDING_REGISTRATION: 'pending_registration',
	REGISTERED: 'registered',
	FULL: 'full',
	CANCELLED: 'cancelled',
	IN_PROGRESS: 'in_progress',
	DELAYED: 'delayed',
	PAUSED: 'paused',
	SUBMITTED_FOR_REVIEW: 'submitted_for_review',
	AWAITING_EVALUATION: 'awaiting_evaluation',
	GRADED: 'graded',
	REVIEWED: 'reviewed',
	ARCHIVED: 'archived',
	REJECTED_FINAL: 'rejected_final'
} as const

export interface SavedUserRef {
	userId: string
	savedAt: string
}
export const TopicTypeTransfer = {
	thesis: { name: 'Khóa luận tốt nghiệp', css: 'bg-blue-600 text-white px-1.5 py-0.5 text-xs' },
	scientific_research: { name: 'Nghiên cứu khoa học', css: 'bg-green-600 text-white px-1.5 py-0.5 text-xs' }
}
export const topicStatusLabels = {
	draft: { name: 'Bản nháp', css: 'bg-gray-200 text-gray-800' },
	submitted: { name: 'Đã nộp', css: 'bg-yellow-200 text-yellow-800' },
	under_review: { name: 'Đang xét duyệt', css: 'bg-blue-200 text-blue-800' },
	revision_required: { name: 'Yêu cầu sửa', css: 'bg-orange-200 text-orange-800' },
	approved: { name: 'Đã duyệt', css: 'bg-green-200 text-green-800' },
	rejected: { name: 'Bị từ chối', css: 'bg-red-200 text-red-800' },
	pending_registration: { name: 'Mở  đăng ký', css: 'bg-purple-200 text-purple-800' },
	registered: { name: 'Đã có đăng ký', css: 'bg-indigo-200 text-indigo-800' },
	full: { name: 'Đã đủ số lượng', css: 'bg-gray-400 text-gray-900' },
	cancelled: { name: 'Đã hủy', css: 'bg-red-400 text-red-900' },
	in_progress: { name: 'Đang thực hiện', css: 'bg-blue-400 text-blue-900' },
	delayed: { name: 'Bị trì hoãn', css: 'bg-yellow-400 text-yellow-900' },
	paused: { name: 'Tạm ngưng', css: 'bg-gray-400 text-gray-900' },
	submitted_for_review: { name: 'Đã nộp báo cáo', css: 'bg-yellow-200 text-yellow-800' },
	awaiting_evaluation: { name: 'Chờ đánh giá', css: 'bg-purple-200 text-purple-800' },
	graded: { name: 'Đã chấm điểm', css: 'bg-green-200 text-green-800' },
	reviewed: { name: 'Đã kiểm tra', css: 'bg-blue-200 text-blue-800' },
	archived: { name: 'Đã lưu trữ', css: 'bg-gray-200 text-gray-800' },
	rejected_final: { name: 'Chưa đạt', css: 'bg-red-200 text-red-800' }
}
export interface RequestGradeTopicDto {
	score: number
	note?: string
}
export interface CreateTopicPayload {
	titleVN: string
	titleEng: string
	description: string
	type: TopicType
	currentPhase: string
	currentStatus: string
	majorId: string
	maxStudents: number
	periodId?: string
	fieldIds: string[]
	requirementIds?: string[]
	studentIds?: string[]
	lecturerIds: string[]
	allowManualApproval: boolean
}

export interface CreateTopicRequest {
	topicData: CreateTopicPayload
	files: File[] // File lấy từ input type="file"
}

export interface CreateTopicResponse {
	topicId: string
	message: string
}
export interface UpdateTopicPayload {
	titleVN?: string
	titleEng?: string
	description?: string
	majorId?: string
	maxStudents?: number
	fieldIds?: string[]
	requirementIds?: string[] | []
	type?: string
}
//dùng cho search trong lấy topics theo phase của kì
export interface PaginationTopicsQueryParams extends PaginationQueryParamsDto {
	phase?: string
	status?: string
	rulesPagination?: number
	lecturerIds?: string[]
	fieldIds?: string[]
	queryStatus?: string[]
}
