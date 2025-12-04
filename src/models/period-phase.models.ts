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
