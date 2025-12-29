import type { GetPaginatedObject } from './paginated-object.model'
import type { PeriodPhaseName } from './period-phase.models'
import { PaginationQueryParamsDto } from './query-params'
import type { ResponseMiniLecturerDto, ResponseMiniStudentDto } from './users'

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
export interface ResponseMilestoneWithTemplate {
	_id: string
	title: string
	description: string
	dueDate: string
	type: string
	count: string
	isActive: string
	periodId: string
	defenseCouncil: {
		memberId: string

		role: string

		title: string

		fullName: string
	}[]
	topicSnaps?: TopicSnaps[]
	location: string
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
	periodId: string
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
	phaseName: PeriodPhaseName
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

export const milestoneTypeMap: Record<string, { label: string; color: string }> = {
	submission: { label: 'Nộp báo cáo', color: 'bg-blue-100 text-blue-700' },
	defense: { label: 'Bảo vệ', color: 'bg-purple-100 text-purple-700' }
}

export const milestoneStatusMap: Record<string, { label: string; color: string }> = {
	timeout: { label: 'Quá hạn', color: 'bg-red-100 text-red-700' },
	active: { label: 'Còn hạn', color: 'bg-green-100 text-green-700' }
}

export const topicInMilestonesMap: Record<string, { label: string; color: string }> = {
	unsubmit: { label: 'Chưa nộp', color: 'bg-yellow-100 text-yellow-700' },
	submitted: { label: 'Đã nộp', color: 'bg-blue-100 text-blue-700' }
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
