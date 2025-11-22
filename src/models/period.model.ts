import type { GetFaculty } from './faculty.model'
import type { PeriodPhase } from './period-phase.models'
import type { ResponseMiniLecturerDto } from './users'

export type PeriodStatus = 'ongoing' | 'completed'

export type PhaseType = 'submit_topic' | 'open_registration' | 'execution' | 'completion'

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
	// Pha 4 - Hoàn tất
	| 'graded'
	| 'reviewed'
	| 'archived'
	| 'rejected_final'

export interface Period {
	_id: string
	name: string
	faculty: GetFaculty
	phases: PeriodPhase[]
	status: string
	currentPhase: string
	startTime: Date
	endTime: Date
}
export interface CreatePeriodDto {
	name: string
	startTime: Date
	endTime: Date
}

export interface Topic {
	id: string
	title: string
	instructor: string
	student?: string
	status: TopicStatus
	submittedAt: string
	registrationCount?: number
	progress?: number
	score?: number
	reportFile?: string
}

export interface PhaseStats {
	label: string
	value: number
	variant?: 'default' | 'success' | 'warning' | 'destructive'
}

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

export interface GetCustomMiniPeriodInfoRequestDto {
	_id: string
	name: string
	faculty: GetFaculty
	status: string
	startTime: Date
	endTime: Date
	currentPhaseDetail: PeriodPhase | null
}
