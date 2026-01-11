import type { GetPaginatedObject } from './paginated-object.model'
import type { PeriodPhaseName } from './period-phase.models'
import type { MiniPeriod } from './period.model'
import { PaginationQueryParamsDto } from './query-params'
import type { MiniActorInforDto, ResponseMiniLecturerDto, ResponseMiniStudentDto } from './users'

export type MilestoneStatus = 'Todo' | 'In Progress' | 'Pending Review' | 'Completed' | 'Needs Revision' | 'Overdue'
export const MilestoneStatusOptions = {
	TODO: 'Todo',
	IN_PROGRESS: 'In Progress',
	PENDING_REVIEW: 'Pending Review',
	COMPLETED: 'Completed',
	NEEDS_REVISION: 'Needs Revision',
	OVERDUE: 'Overdue'
} as const
export type MilestoneType = 'submission' | 'defense'
export const MilestoneType = {
	SUBMISSION: 'submission',
	DEFENSE: 'defense'
} as const

export interface FileInfo {
	name: string
	url: string
	size: number
}

export const LecturerReviewDecision = {
	APPROVED: 'approved',
	REJECTED: 'rejected'
}
export type LecturerReviewDecision = 'approved' | 'rejected'
export interface Submission {
	date: Date
	files: FileInfo[]
	createdBy: {
		_id: string
		fullName: string
		email: string
	}
	lecturerFeedback: string
	lecturerInfo: ResponseMiniLecturerDto
	feedbackAt: string
	lecturerDecision: LecturerReviewDecision
}

export interface TaskDto {
	_id: string
	groupId: string
	milestoneId: string
	title: string
	description: string
	isDeleted: boolean
	status: string
}

export interface ResponseMilestone {
	_id: string
	groupId: string
	title: string
	description: string
	dueDate: string
	type: MilestoneType
	status: MilestoneStatus
	submission?: Submission
	submissionHistory?: Submission[]
	tasks?: TaskDto[]
	progress: number
	isAbleEdit: boolean
	creatorType: string
	//isCompleted: boolean
}
export interface TopicSnaps {
	_id: string
	titleVN: string
	titleEng: string
	studentName: string[]
	lecturers: ResponseMiniLecturerDto[]
}
export type CouncilMemberRole = 'chairperson' | 'secretary' | 'member' | 'reviewer'

export const CouncilMemberRoleOptions: Record<
	CouncilMemberRole,
	{ label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
	chairperson: { label: 'Chủ tịch', variant: 'default' },
	secretary: { label: 'Thư ký', variant: 'secondary' },
	member: { label: 'Ủy viên', variant: 'outline' },
	reviewer: { label: 'Phản biện', variant: 'outline' }
}
export interface DefenseCouncilMember {
	memberId: string
	role: CouncilMemberRole
	title: string
	fullName: string
}

export interface GetUploadedFileDto {
	_id: string
	fileNameBase: string
	fileUrl?: string
	type: string
	fileType: string
	size: number
	actor: MiniActorInforDto
	created_at: string
	mimeType: string
}

export interface ResponseMilestoneWithTemplate {
	_id: string
	title: string
	description: string
	dueDate: string
	type: string
	count: string
	isActive: string
	periodId: string
	defenseCouncil: DefenseCouncilMember[]
	topicSnaps?: TopicSnaps[]
	location: string
	isScorable: boolean
	status: string
	resultScoringTemplate: GetUploadedFileDto | null
	isBlock: boolean
	isPublished: boolean
}
export interface ResponseFacultyMilestone {
	_id: string
	title: string
	type: string
	description: string
	dueDate: string
	count: number
	status: string
	uncompleteNum: number
	isDownload: boolean
}

export interface PayloadCreateMilestone {
	groupId: string
	title: string
	description: string
	dueDate: string
	type: MilestoneType
}

export interface PayloadCreateMilestone {
	groupId: string
	title: string
	periodId: string
	description: string
	dueDate: string
	type: MilestoneType
}
export interface PayloadFacultyCreateMilestone {
	periodId: string
	title: string
	description: string
	dueDate: string
	type: MilestoneType
}

export interface PayloadUpdateMilestone {
	title: string
	description: string
	dueDate: string
}

export interface UploadReportPayload {
	title: string
	description: string
	dueDate: string
}

export interface MilestoneEvent {
	_id: string
	groupId: string
	title: string
	dueDate: string
	type: 'submission' | 'defense'
}

export const milestoneTypeMap: Record<string, { label: string; color: string }> = {
	submission: { label: 'Nộp báo cáo', color: 'bg-blue-100 text-blue-700' },
	defense: { label: 'Bảo vệ', color: 'bg-purple-100 text-purple-700' }
}

export const creatorType: Record<string, { label: string; color: string }> = {
	lecturer: { label: 'Giảng viên', color: 'bg-blue-100 text-blue-700' },
	faculty_board: { label: 'Bắt buộc', color: 'bg-red-600 text-white ' }
}
export const milestoneStatusMap: Record<string, { label: string; color: string }> = {
	timeout: { label: 'Quá hạn', color: 'bg-red-100 text-red-700' },
	active: { label: 'Còn hạn', color: 'bg-green-100 text-green-700' }
}
export const defenseStatusMap: Record<string, { label: string; color: string }> = {
	pending: { label: 'Chưa diễn ra', color: 'bg-yellow-100 text-yellow-700' },
	timeout: { label: 'Kết thúc', color: 'bg-red-100 text-red-700' },
	active: { label: 'Đang diễn ra', color: 'bg-green-100 text-green-700' }
}

export const topicInMilestonesMap: Record<string, { label: string; color: string }> = {
	unsubmit: { label: 'Chưa nộp', color: 'bg-yellow-100 text-yellow-700    text-md ' },
	submitted: { label: 'Đã nộp', color: 'bg-blue-100 text-blue-700  text-md ' }
}
export class RequestTopicInMilestoneBatchQuery extends PaginationQueryParamsDto {}

export interface GetTopicsInBatchMilestoneDto {
	_id: string
	topicId: string
	titleVN: string
	titleEng: string
	majorName: string
	studentNum: number
	lecturers: ResponseMiniLecturerDto[]
	students: ResponseMiniStudentDto[]
	status: string
}
export interface PaginatedTopicInBatchMilestone extends GetPaginatedObject {
	data: GetTopicsInBatchMilestoneDto[]
}

// all defense milestones for faculty board
export interface PaginationAllDefenseMilestonesQuery extends PaginationQueryParamsDto {
	year?: string
	periodId?: string
}
export interface ResponseDefenseMilestone {
	_id: string
	title: string
	location: string
	dueDate: string
	isPublished: boolean
	isBlock: boolean
	defenseCouncil: DefenseCouncilMember[]
	councilMembers: number
	topicsCount: number
	periodInfo: MiniPeriod
}
export interface PaginatedFacultyMilestones extends GetPaginatedObject {
	data: ResponseDefenseMilestone[]
}

export interface DefenseMilestoneDetail {
	title: string
	description: string
	dueDate: Date
	type: string
	periodId: string
	isPublished: boolean // Đã công bố điểm
	isBlock: boolean // Đã khóa (không cho chỉnh sửa)
	createdBy: string
}
