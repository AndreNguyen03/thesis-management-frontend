import type { GetFieldNameReponseDto } from './field.model'
import type { GetUploadedFileDto } from './file.model'
import type { GetMajorMiniDto } from './major.model'
import type { GetPaginatedObject, MetaDto } from './paginated-object.model'
import type { PeriodPhaseName } from './period-phase.models'
import type { MiniPeriod, TopicsInPeriodMeta } from './period.model'
import type { RelatedStudentInTopic, StudentRegistrationStatus } from './registration.model'
import { PaginationQueryParamsDto } from './query-params'
import type { GetRequirementNameReponseDto } from './requirement.model'
import type { GetMiniUserDto, MiniActorInforDto, ResponseMiniLecturerDto, ResponseMiniStudentDto } from './users'
import type { ResponseMilestoneWithTemplate } from './milestone.model'
import type { is } from 'date-fns/locale'
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

	registrationStatus: StudentRegistrationStatus
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
	year: number
	original_id?: string
	progress?: number
	finalGrade?: number
	defenseMilestoneDate?: Date
    userRegistrationStatus?: string
    approvedStudentsNum?: number
}

//Định nghĩa đề tài trong thư viện số
export interface TopicInLibrary extends AbstractTopic {
	createByInfo: MiniActorInforDto
	periodInfo: MiniPeriod
	stats: TopicStatsDto
	year: number
	finalProduct?: FinalProduct
	studentsRegistered: ResponseMiniStudentDto[]
	defenseResult: DefenseResult
}
export interface PaginatedTopicsInLibrary extends GetPaginatedObject {
	data: TopicInLibrary[]
}

export interface PaginatedSubmittedTopics {
	data: SubmittedTopic[]
	meta: TopicsInPeriodMeta
}

//Lấy từ kho tri thức
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

	deadline?: Date

	createdAt: Date

	updatedAt: Date

	registrationStatus?: StudentRegistrationStatus

	isSaved?: boolean

	isEditable?: boolean

	allowManualApproval: boolean

	students: RelatedStudentInTopic
}
export interface GetPaginatedTopics extends GetPaginatedObject {
	data: GeneralTopic[]
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
	| 'assigned_defense'
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
	under_review: { name: 'Đã xem', css: 'bg-blue-200 text-blue-800' },
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
	awaiting_evaluation: { name: 'Chờ phân công vào hội đồng', css: 'bg-purple-200 text-purple-800' },
	assigned_defense: { name: 'Sẵn sàng bảo vệ', css: 'bg-purple-200 text-purple-800' },
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

export interface PaginationTopicsRegistrationQueryParams extends PaginationQueryParamsDto {
	year?: string
	status?: string
	rulesPagination?: number
	lecturerIds?: string[]
	fieldIds?: string[]
	queryStatus?: string[]
	majorIds?: string[]
}

//dùng cho khi giảng viên lấy đề tài trong kì theo phase
export interface PaginationLecturerGetTopicsInPhaseParams extends PaginationQueryParamsDto {
	status: string
}
//#Đề tài trong thư viện số
//Đánh giá bên trong đề tài được lưu trữ trong thư viện số
interface TopicStatsDto {
	views: number // Số lượt xem
	downloads: number // Số lượt tải
	averageRating: number // Điểm đánh giá trung bình (4.5)
	reviewCount: number // Tổng số đánh giá (12)
}
interface FileSnapshotDto {
	fileId: string // Reference gốc để quản lý xóa/sửa
	fileName: string // VD: "Bao_cao_final_v2.pdf"
	fileUrl: string // URL từ S3/MinIO/Local để download trực tiếp
	size: number
}

export interface FinalProduct {
	thesisReport?: FileSnapshotDto
}
export interface DefenseResult {
	defenseDate: Date // Dùng để lọc theo "Năm bảo vệ"
	periodName: string // Lưu tên đợt: "HK1 23-24" (để hiển thị nhanh)
	finalScore?: number // Điểm số: 9.5
	gradeText: string // Xếp loại: "Xuất sắc"
	councilMembers: CouncilMemberSnapshot[]
	councilName: string // VD: "Hội đồng CNPM 01"
	isPublished: boolean
}
export interface SubmittedTopicParamsDto extends PaginationQueryParamsDto {
	periodId?: string
}
export interface StudentRegistration {
    _id:string
	studentId: string
	studentName: string
	status: 'pending' | 'approved' | 'rejected'
	studentSkills: string[]
	studentNote?: string
	lecturerResponse?: string
	processAt?: string // ISO date string
	createdAt: string // ISO date string
	rejectionReasonType?: string
}
export interface TopicApproval {
	_id: string
	titleVN: string
	type: string
	deleted_at: string | null
    maxStudents: number
	allowManualApproval: boolean
	pendingStudents: StudentRegistration[]
	approvedStudents: StudentRegistration[]
	rejectedStudents: StudentRegistration[]
}

export interface PaginatedTopicApproval {
	data: TopicApproval[]
	meta: MetaDto
}

export interface ApprovalTopicQueryParams extends PaginationQueryParamsDto {
	periodId?: string
	type?: string 
	allowManualApproval?: boolean | 'all'
	onlyPending?: boolean | 'all'
}

//thành viên trong hội đồng
export interface CouncilMemberSnapshot {
	memberId: string
	fullName: string
	role: string // "Chủ tịch", "Thư ký"...
	score: number
	note: string
}

export interface DetailTopicsInDefenseMilestone {
	_id: string
	periodInfo: MiniPeriod
	milestoneInfo: ResponseMilestoneWithTemplate
	data: TopicsInDefenseMilestone[]
	meta: MetaDto
}
export interface TopicsInDefenseMilestone {
	_id: string
	titleVN: string
	titleEng: string
	description: string
	type: string
	majorId: string
	finalProduct: FinalProduct
	isPublishedToLibrary: boolean
	allowManualApproval: boolean
	updatedAt: Date
	currentStatus: string
	defenseResult?: DefenseResult
	lecturers: ResponseMiniLecturerDto[]
	students: ResponseMiniStudentDto[]
}
export interface CouncilMemberScoreDto {
	memberId: string
	fullName: string
	role: string
	score: number
	note?: string
}

export interface UpdateDefenseResultDto {
	topicId: string
	defenseDate: Date
	periodName: string
	finalScore: number
	gradeText: string
	councilMembers: CouncilMemberScoreDto[]
	councilName: string
	isPublished?: boolean
	isBlock?: boolean
}

export interface BatchUpdateDefenseResultDto {
	results: UpdateDefenseResultDto[]
}

export interface PaginationRegisteredTopicsQueryParams extends PaginationQueryParamsDto {
	periodId?: string
}

