import type { ElementType } from 'react'
import type { GetFaculty } from './faculty.model'
import type { PeriodPhase } from './period-phase.models'
import type { TopicStatus } from './topic.model'

export type PeriodStatus = 'timeout' | 'active' | 'pending'

export type PhaseType = 'empty' | 'submit_topic' | 'open_registration' | 'execution' | 'completion'

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

export interface    CreatePhaseResponse {
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