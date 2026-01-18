import type { ScoreDto, ScoreState } from './criterion.models'
import type { GetPaginatedObject } from './paginated-object.model'
import type { MiniPeriod } from './period.model'
import type { PaginationQueryParamsDto } from './query-params'
import type { GetMiniUserDto } from './users'

export interface QueryDefenseCouncilsParams extends PaginationQueryParamsDto {
	milestoneTemplateId?: string
	fromDate?: Date
	toDate?: Date
	isCompleted?: boolean
	isPublished?: boolean
}
export interface ResDefenseCouncil {
	_id: string
	milestoneTemplateId: string // Đợt bảo vệ
	name: string // VD: "Hội đồng 1 - Phòng E03.2"
	location: string // Phòng bảo vệ
	scheduledDate: Date // Thời gian bảo vệ
	topicsNum: number // Các đề tài trong hội đồng, mỗi đề tài có bộ ba riêng
	isCompleted: boolean // Đã hoàn thành chấm điểm
	isPublished: boolean // Đã công bố điểm
	createdBy: GetMiniUserDto
	councilComments?: string // Ý kiến trao đổi của hội đồng
}

export type ScoreType = 'chairperson' | 'secretary' | 'member' | 'reviewer' | 'supervisor'

export interface StudentInCouncil {
	userId: string
	fullName: string
	studentCode?: string
	email?: string
}

export interface LecturerInCouncil {
	userId: string
	fullName: string
	title: string
	email?: string
}

export interface Score {
	scorerId: string
	scorerName: string
	scoreType: ScoreType
	total: number // Tổng điểm
	comment: string
	scoredAt: Date
}
export interface ScorePayload {
	scorerId: string
	scorerName: string
	scoreType: ScoreType
	total: number // Tổng điểm
	comment: string
}

export interface TopicAssignment {
	index?: number
	topicId: string
	titleVN: string
	titleEng: string
	students: StudentInCouncil[]
	lecturers: LecturerInCouncil[]
	defenseOrder: number // Thứ tự bảo vệ (1, 2, 3...)
	scores: ScoreDto[] // Điểm từ hội đồng và phản biện và giảng viên hướng dẫn
	finalScore: number // Điểm tổng kết
	members: CouncilMemberDto[]
	isAssigned: boolean
	yourRole?: string[]
	gradeText: string
	isLocked: boolean
}
export interface DefenseMilestoneDto {
	_id: string
	title: string
	description: string
	dueDate: string
	isPublished: boolean
	isBlock: boolean
}

//giảng viên lấy chi tiết hội đồng bảo vệ được phân công
export interface ResDefenseCouncil {
	_id: string
	evaluationTemplateId: string
	defenseMilestone: DefenseMilestoneDto // Đợt bảo vệ
	periodInfo: MiniPeriod
	name: string // VD: "Hội đồng 1 - Phòng E03.2"
	location: string // Phòng bảo vệ
	scheduledDate: Date // Thời gian bảo vệ
	topics: TopicAssignment[] // Các đề tài trong hội đồng, mỗi đề tài có bộ ba riêng
	isLocked: boolean
	isPublished: boolean // Đã công bố điểm
	createdBy: GetMiniUserDto
	yourRoles?: string[]
	councilComments?: string // Ý kiến trao đổi của hội đồng
}
export interface ResponseDefenseCouncil extends GetPaginatedObject {
	data: ResDefenseCouncil[]
}

export interface CreateDefenseCouncilPayload {
	milestoneTemplateId: string
	name: string
	location: string
	scheduledDate: string
}
export type CouncilMemberRole = 'chairperson' | 'secretary' | 'member' | 'reviewer' | 'supervisor'
export const CouncilMember = {
	Chairperson: 'chairperson',
	Secretary: 'secretary',
	Member: 'member',
	Reviewer: 'reviewer',
	Supervisor: 'supervisor'
}

export interface CouncilMemberDto {
	memberId: string
	fullName: string
	title?: string
	role: CouncilMemberRole
}
export const CouncilMemberRoleOptions: Record<
	CouncilMemberRole,
	{ label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' }
> = {
	chairperson: { label: 'Chủ tịch', variant: 'default' },
	secretary: { label: 'Thư ký', variant: 'secondary' },
	member: { label: 'Ủy viên', variant: 'outline' },
	reviewer: { label: 'Phản biện', variant: 'outline' },
	supervisor: { label: 'GVHD', variant: 'success' }
}
export interface DefenseCouncilMember {
	topicId: string
	titleVN: string
	titleEng?: string
	members: CouncilMemberDto[] // Bộ ba giảng viên RIÊNG cho đề tài này
}

export interface AddTopicToCouncilPayload {
	topicId: string
	titleVN: string
	titleEng: string
	students: StudentInCouncil[]
	lecturers: LecturerInCouncil[]
	members: CouncilMemberDto[]
	defenseOrder: number
}

// Batch add multiple topics to council
export interface AddMultipleTopicsToCouncilPayload {
	topics: AddTopicToCouncilPayload[]
	periodId: string
}

//update topic payload
export interface UpdateTopicMembersPayload {
	members: CouncilMemberDto[]
}

export const councilMemberRoleMap: Record<CouncilMemberRole, string> = {
	chairperson: 'Chủ tịch',
	secretary: 'Thư ký',
	member: 'Ủy viên',
	reviewer: 'Phản biện',
	supervisor: 'GVHD'
}
