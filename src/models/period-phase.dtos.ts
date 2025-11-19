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
