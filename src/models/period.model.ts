import type { ElementType } from 'react'
import type { GetFaculty } from './faculty.model'
import type { PeriodPhase } from './period-phase.models'
import type { DefenseResult, GeneralTopic, TopicStatus } from './topic.model'
import type { PaginationQueryParamsDto } from './query-params'
import { CalendarCheck, Clock, Lightbulb } from 'lucide-react'
import type { Role } from './users'
import type { BadgeVariant } from '@/components/ui'
import type { MetaDto } from './paginated-object.model'

export type PeriodStatus = 'timeout' | 'active' | 'pending'

export type PhaseType = 'empty' | 'submit_topic' | 'open_registration' | 'execution' | 'completion'
export type PeriodType = 'thesis' | 'scientific_research'
export interface Period {
	_id: string
	year: string
	semester: number
	type: PeriodType
	faculty: GetFaculty
	phases: PeriodPhase[]
	status: string
	currentPhase: PhaseType
	currentPhaseDetail: PeriodPhase
	startTime: Date
	endTime: Date
}

export interface RegistrationPeriodsPageProps {
	userRole: 'student' | 'lecturer'
}
export interface MiniPeriod {
	_id: string
	year: string
	semester: string
	faculty: GetFaculty
}
export interface CreatePeriodPayload {
	year: string
	semester: number
	type: PeriodType
	startTime: Date
	endTime: Date
}

export interface PhaseStats {
	status: TopicStatus | 'all'
	label: string
	value: number
	variant?: StatVariant
	description?: string
	icon?: ElementType
	iconVariant?: StatVariant
}

export type StatVariant = 'primary' | 'success' | 'warning' | 'destructive' | 'info' | 'neutral' | 'purple' | 'orange'

export interface PeriodBackend {
	id: string
	name: string
	faculty: GetFaculty
	startDate: string
	endDate: string
	status: 'ongoing' | 'completed' | 'upcoming'
	currentPhase: 'submit_topic' | 'open_registration' | 'execution' | 'completion'
	phases: PeriodPhase[]
}
export interface GetCustomPeriodDetailRequestDto {
	currentPeriod: string | null
	currentPhase: string | null
	isEligible: boolean
	reason: string | null
	requirements?: {
		minTopics?: number
		submittedTopics?: number
	}
}

export interface Badge {
	text: string
	variant: BadgeVariant
}
export interface NavItem {
	url: string
	title: string
	isDisabled: boolean
	badge?: Badge
	note?: string
}
export interface GetCurrentPeriod {
	_id: string
	year: string
	semester: number
	type: PeriodType
	facultyName: string
	status: string
	startTime: Date
	endTime: Date
	currentPhaseDetail: PeriodPhase
	navItem: NavItem[]
}

export interface StudentRegistration {
	_id: string
	userId: string
	topicId: string
	status: 'pending' | 'approved' | 'rejected'
	studentRole: 'leader' | 'member'
	studentNote: string
	lecturerResponse: string
	topic: {
		titleVN: string
		titleEng: string
		description: string
	}
}

export interface GetDashboardCurrentPeriodType {
	_id: string
	year: string
	semester: number
	type: PeriodType
	facultyName: string
	phases: PeriodPhase[]
	status: string
	startTime: Date
	endTime: Date
	currentPhase: string
	currentPhaseDetail: PeriodPhase
	topics: {
		titleEng: string
		titleVN: string
		defenseResult?: DefenseResult
		type: string
		isPublishedToLibrary: boolean
	}[]
}
export interface GetDashboardCurrentPeriod {
	thesisDashboard: GetDashboardCurrentPeriodType
	researchDashboard: GetDashboardCurrentPeriodType
	thesisRegistration: {
		_id: string
		type: string
		studentRegisStatus: StudentRegistration[]
	}
	researchRegistration: {
		_id: string
		type: string
		studentRegisStatus: StudentRegistration[]
	}
}

export interface LecturerTopicRegisration {
	_id: string
	titleVN: string
	type: string
	maxStudents: number
	allowManualApproval: boolean
	pendingCount: number
	approvedCount: number
	rejectedCount: number
}

export interface LecturerTopicExecution {
	_id: string
	titleVN: string
	type: string
	maxStudents: string
}

export interface LecturerTopicSubmit {
	_id: string
	titleVN: string
	type: string
	maxStudents: number
    allowManualApproval: boolean,
	currentStatus: string
}

export interface LecturerTopicCompletion {
	_id: string
	titleVN: string
	type: string
	maxStudents: number
	isPublishedToLibrary: boolean
	defenseResult?: DefenseResult
}

export interface StudentTopicDashboard {
	_id: string
	titleVN: string 
	type: string
	defenseResult: DefenseResult
	isPublishedToLibrary: boolean
	lecturer: {
		email: string
		fullName: string
		title: string
	}
	studentRegistration: {
		status: string
		studentNote: string
		lecturerResponse: string
		rejectionReasonType: string
		studentRole: string
		updatedAt: string
		createdAt: string
	}
}

export type DashboardTopicData =
	| StudentTopicDashboard
	| LecturerTopicCompletion
	| LecturerTopicSubmit
	| LecturerTopicExecution
	| LecturerTopicRegisration

export interface DashboardType {
	_id: string
	title: string
	description: string
	type: PeriodType
	facultyName: string
	phases: PeriodPhase[]
	status: string
	startTime: Date
	endTime: Date
	currentPhase: string
	currentPhaseDetail: PeriodPhase
	topicData: DashboardTopicData[]
}

export interface CurrentPeriodDashboard {
	thesis: DashboardType
	scientificResearch: DashboardType
}


export interface FacultyDashboardType {
	_id: string
	title: string
	description: string
	type: PeriodType
	facultyName: string
	phases: PeriodPhase[]
	status: string
	startTime: Date
	endTime: Date
	currentPhase: string
	currentPhaseDetail: PeriodPhase
}

export interface FacultyCurrentPeriodDashboard {
	thesis: FacultyDashboardType
	scientificResearch: FacultyDashboardType
}



export interface PaginationPeriodQueryParams extends PaginationQueryParamsDto {
	type?: PeriodType | 'all'
	status?: PeriodStatus | 'all'
	role?: Role
}
export const PeriodPhaseName = {
	EMPTY: 'empty',
	SUBMIT_TOPIC: 'submit_topic',
	OPEN_REGISTRATION: 'open_registration',
	EXECUTION: 'execution',
	COMPLETION: 'completion'
} as const

export interface CreatePhaseResponse {
	success: boolean
	message: string
}

export type CreatePhaseSubmitTopicDto = Omit<PeriodPhase, 'status'> & {
	phase: 'submit-topic'
}

export type CreateExecutionPhaseDto = Omit<PeriodPhase, 'status'> & {
	phase: 'execution'
}

export type CreateOpenRegPhaseDto = Omit<PeriodPhase, 'status'> & {
	phase: 'open-registration'
}

export type CreateCompletionPhaseDto = Omit<PeriodPhase, 'status'> & {
	phase: 'completion'
}
export type UpdatePeriodPhaseDto = Omit<PeriodPhase, 'status' | 'phase'>

export type SendRemainIssueNoti = {
	periodId: string
	phaseName: PhaseType
	deadline: Date
}

export const PeriodTypeEnum = {
	THESIS: 'thesis',
	SCIENCE_RESEARCH: 'scientific_research'
} as const

export interface UpdatePeriodDto {
	year: string
	semester: number
	type: string
	startTime: string
	endTime: string
}
export const getPhaseStatus = (phase: GetCurrentPeriod['currentPhaseDetail']['phase']) => {
	switch (phase) {
		case PeriodPhaseName.OPEN_REGISTRATION:
			return {
				label: 'Đang Mở Đăng ký',
				variant: 'success',
				icon: Lightbulb,
				order: 1,
				color: 'bg-purple-100 text-purple-700'
			}
		case PeriodPhaseName.EXECUTION:
			return {
				label: 'Đang Thực hiện',
				variant: 'default',
				icon: Clock,
				order: 2,
				color: 'bg-indigo-100 text-indigo-700'
			}
		case PeriodPhaseName.COMPLETION:
			return {
				label: 'Đã Hoàn thành',
				variant: 'default',
				icon: CalendarCheck,
				order: 3,
				color: 'bg-green-100 text-green-700'
			}
		case PeriodPhaseName.SUBMIT_TOPIC:
			return {
				label: 'Mở nộp đề tài',
				variant: 'secondary',
				icon: Lock,
				order: 0,
				color: 'bg-blue-100 text-blue-700'
			}
		case PeriodPhaseName.EMPTY:
		default:
			return {
				label: 'Chưa khởi tạo',
				variant: 'secondary',
				icon: Lock,
				order: 0,
				color: 'bg-gray-100 text-gray-700'
			}
	}
}

// Badge màu cho trạng thái
export const statusMap: Record<string, { label: string; color: string }> = {
	timeout: { label: 'Hết hạn', color: 'text-center bg-gray-100 text-gray-700' },
	active: { label: 'Đang diễn ra', color: 'text-center bg-green-100 text-green-700' },
	pending: { label: 'Chờ bắt đầu', color: 'text-center bg-yellow-100 text-yellow-700' }
}

export const periodTypeMap: Record<string, string> = {
	thesis: 'Khóa luận',
	scientific_research: 'Nghiên cứu khoa học'
}

// Map cho các pha của period
export const phaseMap: Record<string, { label: string; color: string }> = {
	empty: { label: 'Chưa bắt đầu', color: 'text-center bg-gray-100 text-gray-700' },
	submit_topic: { label: 'Nộp đề tài', color: 'text-center bg-blue-100 text-blue-700' },
	open_registration: { label: 'Mở đăng ký', color: 'text-center bg-purple-100 text-purple-700' },
	execution: { label: 'Thực hiện', color: 'text-center bg-indigo-100 text-indigo-700' },
	completion: { label: 'Hoàn thành', color: 'text-center bg-green-100 text-green-700' }
}

export interface TopicsInPeriodMeta extends MetaDto {
	periodInfo: Period
}
export interface PaginatedTopicsInPeriod {
	data: GeneralTopic[]
	meta: TopicsInPeriodMeta
}

export interface MiniPeriodInfo {
	_id: string
	year: string
	semester: number
	type: string
}

export interface PaginatedMiniPeriodInfo {
	data: MiniPeriodInfo[]
	meta: MetaDto
}
