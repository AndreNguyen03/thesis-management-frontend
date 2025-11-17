import type { Faculty } from './faculty'

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

export interface Period {
	id: string
	name: string
	startTime: string
	endTime: string
	status: PeriodStatus
	currentPhase: PhaseType
	totalTopics: number
}

export interface CreatePeriodDto {
    name: string,
    startTime: Date,  
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

export interface PeriodPhase {
	phase: PhaseType
	startTime: string
	endTime: string
	status: 'not_started' | 'ongoing' | 'completed'
	maxTopicsPerLecturer?: number
	requiredLecturerIds?: string[]
	allowManualApproval: boolean
}

export interface PeriodBackend {
	id: string
	name: string
	faculty: Faculty
	startDate: string
	endDate: string
	status: 'ongoing' | 'completed' | 'upcoming'
	currentPhase: 'submit_topic' | 'open_registration' | 'execution' | 'completion'
	phases: PeriodPhase[]
}
