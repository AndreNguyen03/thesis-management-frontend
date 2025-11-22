import type { ResponseMiniLecturerDto } from '@/models'
import type {  Topic, PhaseStats, PhaseType } from '@/models/period.model'


export const mockTopicsPhase1: Topic[] = [
	{
		id: 'T001',
		title: 'Xây dựng hệ thống quản lý thư viện điện tử',
		instructor: 'TS. Nguyễn Văn A',
		status: 'approved',
		submittedAt: '2024-09-15'
	},
	{
		id: 'T002',
		title: 'Ứng dụng AI trong phân tích dữ liệu y tế',
		instructor: 'PGS. Trần Thị B',
		status: 'pending_registration',
		submittedAt: '2024-09-18'
	},
	{
		id: 'T003',
		title: 'Phát triển ứng dụng mobile cho Smart Home',
		instructor: 'TS. Lê Văn C',
		status: 'rejected',
		submittedAt: '2024-09-12'
	}
]

export const mockTopicsPhase2: Topic[] = [
	{
		id: 'T001',
		title: 'Xây dựng hệ thống quản lý thư viện điện tử',
		instructor: 'TS. Nguyễn Văn A',
		status: 'approved',
		submittedAt: '2024-09-15',
		registrationCount: 3,
		student: 'Trần Văn X'
	},
	{
		id: 'T004',
		title: 'Hệ thống giám sát giao thông thông minh',
		instructor: 'TS. Phạm Thị D',
		status: 'approved',
		submittedAt: '2024-09-20',
		registrationCount: 0
	}
]

export const mockTopicsPhase3: Topic[] = [
	{
		id: 'T001',
		title: 'Xây dựng hệ thống quản lý thư viện điện tử',
		instructor: 'TS. Nguyễn Văn A',
		student: 'Trần Văn X',
		status: 'in_progress',
		submittedAt: '2024-09-15',
		progress: 65
	},
	{
		id: 'T005',
		title: 'Phân tích cảm xúc trên mạng xã hội',
		instructor: 'PGS. Trần Thị B',
		student: 'Nguyễn Thị Y',
		status: 'paused',
		submittedAt: '2024-09-18',
		progress: 40
	}
]

export const mockTopicsPhase4: Topic[] = [
	{
		id: 'T001',
		title: 'Xây dựng hệ thống quản lý thư viện điện tử',
		instructor: 'TS. Nguyễn Văn A',
		student: 'Trần Văn X',
		status: 'graded',
		submittedAt: '2024-09-15',
		score: 8.5,
		reportFile: 'report_T001.pdf'
	},
	{
		id: 'T002',
		title: 'Ứng dụng AI trong phân tích dữ liệu y tế',
		instructor: 'PGS. Trần Thị B',
		student: 'Lê Thị Z',
		status: 'graded',
		submittedAt: '2024-09-18',
		score: 9.0,
		reportFile: 'report_T002.pdf'
	}
]

export const getPhaseStats = (phase: PhaseType): PhaseStats[] => {
	switch (phase) {
		case 'submit_topic':
			return [
				{ label: 'Đề tài đã nộp', value: 145, variant: 'default' },
				{ label: 'Chờ xem xét', value: 23, variant: 'warning' },
				{ label: 'Đã duyệt', value: 98, variant: 'success' },
				{ label: 'Bị từ chối', value: 24, variant: 'destructive' }
			]
		case 'open_registration':
			return [
				{ label: 'Đang mở đăng ký', value: 98, variant: 'default' },
				{ label: 'Đã có sinh viên', value: 72, variant: 'success' },
				{ label: 'Chưa có sinh viên', value: 26, variant: 'warning' },
				{ label: 'Tổng SV đăng ký', value: 156, variant: 'default' }
			]
		case 'execution':
			return [
				{ label: 'Đang thực hiện', value: 72, variant: 'default' },
				{ label: 'Tạm dừng', value: 8, variant: 'warning' },
				{ label: 'Đã hoàn thành', value: 18, variant: 'success' },
				{ label: 'Gặp vấn đề', value: 2, variant: 'destructive' }
			]
		case 'completion':
			return [
				{ label: 'Đã hoàn tất', value: 72, variant: 'success' },
				{ label: 'Lưu thư viện', value: 68, variant: 'default' },
				{ label: 'Chờ chấm', value: 4, variant: 'warning' },
				{ label: 'Bị từ chối', value: 0, variant: 'destructive' }
			]
		default:
			return []
	}
}

// src/modules/manage-period/mock/detailPeriod.ts
import type { PeriodBackend } from '@/models/period.model'
const mockLecturers: ResponseMiniLecturerDto[] = [
	{
		_id: 'lec1',
		fullName: 'TS. Nguyễn Văn A',
		email: 'nguyenvana@university.edu.vn',
		phone: '0912345678',
		avatarUrl: '/avatars/lec1.png',
		avatarName: 'lec1.png',
		title: 'Tiến sĩ'
	},
	{
		_id: 'lec2',
		fullName: 'PGS. Trần Thị B',
		email: 'tranthib@university.edu.vn',
		phone: '0987654321',
		avatarUrl: '/avatars/lec2.png',
		avatarName: 'lec2.png',
		title: 'Phó Giáo sư'
	}
]
export const mockPeriodDetail: PeriodBackend = {
	id: 'p1',
	name: 'Đợt đăng ký đề tài HK1 2025',
	startDate: '2025-01-01',
	endDate: '2025-05-30',
	status: 'ongoing',
	currentPhase: 'submit_topic',
	faculty: {
		name: 'Khoa Công Nghệ Thông Tin',
		email: 'fit@university.edu.vn',
		urlDirection: 'https://fit.university.edu.vn'
	},
	phases: [
		{
			_id: '122	',
			phase: 'submit_topic',
			startTime: '2025-01-01T00:00:00Z',
			endTime: '2025-01-15T23:59:59Z',
			status: 'ongoing',
			minTopicsPerLecturer: 3,
			requiredLecturers: mockLecturers,
			allowManualApproval: true
		},
		{
			_id: '123',
			phase: 'open_registration' as PhaseType,
			startTime: '2025-01-16T00:00:00Z',
			endTime: '2025-01-25T23:59:59Z',
			status: 'not_started',
			allowManualApproval: false
		},
		{
			_id: '124',
			phase: 'execution' as PhaseType,
			startTime: '2025-01-26T00:00:00Z',
			endTime: '2025-04-30T23:59:59Z',
			status: 'not_started',
			allowManualApproval: false
		},
		{
			_id: '125',
			phase: 'completion' as PhaseType,
			startTime: '2025-05-01T00:00:00Z',
			endTime: '2025-05-30T23:59:59Z',
			status: 'not_started',
			allowManualApproval: true
		}
	]
}
