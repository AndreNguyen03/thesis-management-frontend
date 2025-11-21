import type { ResponseMiniLecturerDto } from "./users"

export interface GetPeriodPhaseDto {
	_id: string
	phase: string
	startTime: Date
	endTime: Date
	minTopicsPerLecturer: number
	requiredLecturers: ResponseMiniLecturerDto[]
	allowManualApproval: boolean
	status: string
}

export const phaseLabels = {
  empty: 'Chưa bắt đầu',
  submit_topic: 'Nộp đề tài',
  open_registration: 'Mở đăng ký',
  execution: 'Thực hiện',
  completion: 'Hoàn thành'
};