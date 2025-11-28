import type { ElementType } from 'react'
import type { GetFaculty } from './faculty.model'
import type { PeriodPhase } from './period-phase.models'

export type PeriodStatus = 'ongoing' | 'completed'

export type PhaseType = 'empty' | 'submit_topic' | 'open_registration' | 'execution' | 'completion'

export type TopicStatus =
	// Pha 1 - Nộp đề tài
	| 'draft'
	| 'submitted'
	| 'under_review'
	| 'approved'
	| 'rejected'
	| 'revision_required'
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
	currentPhase: PhaseType
	startTime: Date
	endTime: Date
}

export interface MiniPeriod {
	_id: string
	name: string
}
export interface CreatePeriodDto {
	name: string
	startTime: Date
	endTime: Date
}

export interface PhaseStats {
	status: string
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

export interface GetCustomMiniPeriodInfoRequestDto {
	_id: string
	name: string
	faculty: GetFaculty
	phases: PeriodPhase[]
	status: string
	startTime: Date
	endTime: Date
	currentPhase: string
	currentPhaseDetail: PeriodPhase
}

export const PeriodPhaseName = {
	EMPTY: 'empty',
	SUBMIT_TOPIC: 'submit_topic',
	OPEN_REGISTRATION: 'open_registration',
	EXECUTION: 'execution',
	COMPLETION: 'completion'
} as const
