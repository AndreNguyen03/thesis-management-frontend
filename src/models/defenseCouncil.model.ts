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
}

export type ScoreType = 'chairperson' | 'secretary' | 'member' | 'reviewer' | 'supervisor'

export interface Score {
	scorerId: string
	scorerName: string
	scoreType: ScoreType
	total: number // Tổng điểm
	comment: string
	scoredAt: Date
}

export interface TopicAssignment {
	topicId: string
	titleVN: string
	titleEng: string
	studentNames: string[]
	lecturerNames: string[]
	defenseOrder: number // Thứ tự bảo vệ (1, 2, 3...)
	scores: Score[] // Điểm từ hội đồng và phản biện và giảng viên hướng dẫn
	finalScore: number // Điểm tổng kết
	members: CouncilMemberDto[]
}
export interface DefenseMilestoneDto {
	title: string
	description: string
}

//giảng viên lấy chi tiết hội đồng bảo vệ đươc phân công
export interface ResDefenseCouncil {
	_id: string
	defenseMilestone: DefenseMilestoneDto // Đợt bảo vệ
	periodInfo: MiniPeriod,
	name: string // VD: "Hội đồng 1 - Phòng E03.2"
	location: string // Phòng bảo vệ
	scheduledDate: Date // Thời gian bảo vệ
	topics: TopicAssignment[] // Các đề tài trong hội đồng, mỗi đề tài có bộ ba riêng
	isBlocked: boolean
	isPublished: boolean // Đã công bố điểm
	createdBy: GetMiniUserDto
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
export type CouncilMemberRole = 'chairperson' | 'secretary' | 'member' | 'reviewer'
export interface CouncilMemberDto {
	memberId: string
	fullName: string
	title?: string
	role: CouncilMemberRole
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
	studentNames: string[]
	lecturerNames: string[]
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
	reviewer: 'Phản biện'
}
