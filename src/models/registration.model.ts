// Hàm render trạng thái đăng ký cho sinh viên
export function renderRegistrationStatus(status: StudentRegistrationStatus): { label: string; color: string } {
	switch (status) {
		case 'pending':
			return { label: 'Chờ duyệt', color: 'text-yellow-600 bg-yellow-50 border border-yellow-400' }
		case 'approved':
			return { label: 'Đã duyệt', color: 'text-green-700 bg-green-50 border border-green-400' }
		case 'rejected':
			return { label: 'Bị từ chối', color: 'text-red-600 bg-red-50 border border-red-400' }
		case 'withdrawn':
			return { label: 'Đã rút', color: 'text-gray-500 bg-gray-50 border border-gray-300' }
		case 'cancelled':
			return { label: 'Đã hủy', color: 'text-gray-500 bg-gray-50 border border-gray-300' }
		default:
			return { label: 'Không xác định', color: 'text-gray-400 bg-gray-50 border border-gray-200' }
	}
}
import type { GetPaginatedObject, MetaDto } from './paginated-object.model'
import type { GetCurrentPeriod, MiniPeriod } from './period.model'
import type { PaginationQueryParamsDto } from './query-params'
import type { ResponseMiniLecturerDto, ResponseMiniStudentDto } from './users'
export const StudentRegistrationStatus = {
	PENDING: 'pending',
	APPROVED: 'approved',
	REJECTED: 'rejected',
	WITHDRAWN: 'withdrawn',
	CANCELLED: 'cancelled'
}
export type StudentRegistrationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn' | 'cancelled'

export interface IStudentRegistration {
	_id: string
	topicId: string
	titleVN: string
	titleEng: string
	type: string
	major: string
	topicStatus: string
	registrationStatus: StudentRegistrationStatus
	registeredAt: Date
	lecturers: ResponseMiniLecturerDto[]
	periodInfo: MiniPeriod
	lecturerResponse: string
	rejectionReasonType: string
	processedBy: ResponseMiniLecturerDto
}
export interface MetaCustom extends MetaDto {
	periodOptions: MiniPeriod[]
}
export interface PaginatedStudentRegistration {
	data: IStudentRegistration[]
	meta: MetaCustom
}

export interface RelatedStudentInTopic {
	approvedStudents: RegistrationDto[]
	pendingStudents: RegistrationDto[]
}

export interface RegistrationDto {
	_id: string
	student: ResponseMiniStudentDto
	createdAt: Date
	status: string
	note: string
}

export interface QueryReplyRegistration {
	status?: string
	lecturerResponse?: string
	rejectionReasonType?: string
	studentRole?: typeof StudentTopicRole
}

export const StudentTopicRole = {
	LEADER: 'leader',
	MEMBER: 'member'
}

export const RejectionReasonType = {
	FULL_SLOT: 'full_slot',
	GPA_LOW: 'gpa_low',
	SKILL_MISMATCH: 'skill_mismatch',
	OTHER: 'other'
}

export const tranferToRejectionReasonType = {
	full_slot: 'Đã đủ số lượng thành viên',
	gpa_low: 'Điểm trung bình chưa đạt yêu cầu',
	skill_mismatch: 'Kỹ năng chưa phù hợp',
	other: 'Lý do khác'
}

export interface RegistrationHistoryQueryParams extends PaginationQueryParamsDto {
	periodId?: string
}
// Badge màu cho trạng thái
export const registrationStatusMap: Record<string, { label: string; color: string }> = {
	approved: { label: 'Đã Duyệt', color: 'text-center bg-green-100 text-green-700' },
	rejected: { label: 'Bị Từ Chối', color: 'text-center bg-red-100 text-red-700' },
	pending: { label: 'Chờ Duyệt', color: 'text-center bg-yellow-100 text-yellow-700' },
	withdrawn: { label: 'Đã Rút', color: 'text-center bg-gray-100 text-gray-700' },
	canceled: { label: 'Đã bị hủy', color: 'text-center bg-gray-100 text-gray-700' }
}
