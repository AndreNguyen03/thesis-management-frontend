import type { PhaseType } from './period.model'
import type { ResponseMiniLecturerDto } from './users'

export interface PeriodPhase {
	_id: string
	phase: PhaseType
	startTime: string
	endTime: string
	status: PeriodPhaseStatus
	minTopicsPerLecturer?: number
	requiredLecturers?: ResponseMiniLecturerDto[]
	allowManualApproval?: boolean
}

export const phaseLabels = {
	empty: 'Chưa bắt đầu',
	submit_topic: 'Nộp đề tài',
	open_registration: 'Mở đăng ký',
	execution: 'Thực hiện',
	completion: 'Hoàn thành'
}
export type PeriodPhaseName = 'empty' | 'submit_topic' | 'open_registration' | 'execution' | 'completion'
export const PeriodPhaseStatus = {
	NOT_STARTED: 'not_started',
	ACTIVE: 'active',
	COMPLETED: 'completed',
	END: 'end'
}

export const phaseStatusLabels = {
	not_started: 'Chưa bắt đầu',
	active: 'Đang diễn ra',
	completed: 'Hoàn thành',
	end: 'Kết thúc'
}
export type PeriodPhaseStatus = (typeof PeriodPhaseStatus)[keyof typeof PeriodPhaseStatus]


export interface Phase1Response {
	periodId: string
	phase: 'submit_topic'
	missingTopics: {
		lecturerId: string
		lecturerName: string
		lecturerEmail: string
		minTopicsRequired: number
		submittedTopicsCount: number
		missingTopicsCount: number
	}[]
	pendingTopics: number
	canTriggerNextPhase: boolean
}

export interface Phase2Response {
	periodId: string
	phase: 'open_registration'
	resolveTopics: {
		draft: { topicId: string; title: string }[]
		executing: { topicId: string; title: string }[]
	}
	canTriggerNextPhase: boolean
}

export interface Phase3Response {
	periodId: string
	phase: 'execution'
	overdueTopics: {
		topicId: string
		title: string
		lecturerId: string
		lecturerEmail: string
		studentIds: string[]
		studentEmails: string[]
	}[]
	canTriggerNextPhase: boolean
}

export type ResolvePhaseResponse = Phase1Response | Phase2Response | Phase3Response

export const isPhase1 = (res: ResolvePhaseResponse): res is Phase1Response => res.phase === 'submit_topic'

export const isPhase2 = (res: ResolvePhaseResponse): res is Phase2Response => res.phase === 'open_registration'

export const isPhase3 = (res: ResolvePhaseResponse): res is Phase3Response => res.phase === 'execution'

export function hasPending(res: ResolvePhaseResponse): boolean {
	if (isPhase1(res)) {
		console.log(res)
		return res.pendingTopics > 0 || res.missingTopics.length > 0
	} else if (isPhase2(res)) {
		return res.resolveTopics.draft.length > 0 || res.resolveTopics.executing.length > 0
	} else if (isPhase3(res)) {
		return res.overdueTopics.length > 0
	}
	return false
}

export function isResolved(res: ResolvePhaseResponse): boolean {
	return !hasPending(res)
}

export const PHASE_ORDER: PhaseType[] = ['empty', 'submit_topic', 'open_registration', 'execution', 'completion']
