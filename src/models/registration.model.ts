import type { GetPaginatedObject } from './paginated-object.model'
import type { ResponseMiniLecturerDto } from './users'

export interface IStudentRegistration {
	_id: string
	titleVN: string
	titleEng: string
	type: string
	major: string
	topicStatus: string
	registrationStatus: string
	registeredAt: Date
	lecturers: ResponseMiniLecturerDto[]
	periodName: string
	periodId: string
}

export interface PaginatedStudentRegistration extends GetPaginatedObject {
	data: IStudentRegistration[]
}
