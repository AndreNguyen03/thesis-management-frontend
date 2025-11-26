import type { ResponseMiniLecturerDto } from '@/models'
import type { PhaseStats, PhaseType } from '@/models/period.model'

// export const mockTopicsPhase1: SubmittedTopic[] = [
// 	{
// 		id: 'T001',
// 		title: 'Xây dựng hệ thống quản lý thư viện điện tử',
// 		instructor: 'TS. Nguyễn Văn A',
// 		status: 'approved',
// 		submittedAt: '2024-09-15'
// 	},
// 	{
// 		id: 'T002',
// 		title: 'Ứng dụng AI trong phân tích dữ liệu y tế',
// 		instructor: 'PGS. Trần Thị B',
// 		status: 'pending_registration',
// 		submittedAt: '2024-09-18'
// 	},
// 	{
// 		id: 'T003',
// 		title: 'Phát triển ứng dụng mobile cho Smart Home',
// 		instructor: 'TS. Lê Văn C',
// 		status: 'rejected',
// 		submittedAt: '2024-09-12'
// 	}
// ]

// export const mockTopicsPhase2: Topic[] = [
// 	{
// 		id: 'T001',
// 		title: 'Xây dựng hệ thống quản lý thư viện điện tử',
// 		instructor: 'TS. Nguyễn Văn A',
// 		status: 'approved',
// 		submittedAt: '2024-09-15',
// 		registrationCount: 3,
// 		student: 'Trần Văn X'
// 	},
// 	{
// 		id: 'T004',
// 		title: 'Hệ thống giám sát giao thông thông minh',
// 		instructor: 'TS. Phạm Thị D',
// 		status: 'approved',
// 		submittedAt: '2024-09-20',
// 		registrationCount: 0
// 	}
// ]

// export const mockTopicsPhase3: Topic[] = [
// 	{
// 		id: 'T001',
// 		title: 'Xây dựng hệ thống quản lý thư viện điện tử',
// 		instructor: 'TS. Nguyễn Văn A',
// 		student: 'Trần Văn X',
// 		status: 'in_progress',
// 		submittedAt: '2024-09-15',
// 		progress: 65
// 	},
// 	{
// 		id: 'T005',
// 		title: 'Phân tích cảm xúc trên mạng xã hội',
// 		instructor: 'PGS. Trần Thị B',
// 		student: 'Nguyễn Thị Y',
// 		status: 'paused',
// 		submittedAt: '2024-09-18',
// 		progress: 40
// 	}
// ]

// export const mockTopicsPhase4: Topic[] = [
// 	{
// 		id: 'T001',
// 		title: 'Xây dựng hệ thống quản lý thư viện điện tử',
// 		instructor: 'TS. Nguyễn Văn A',
// 		student: 'Trần Văn X',
// 		status: 'graded',
// 		submittedAt: '2024-09-15',
// 		score: 8.5,
// 		reportFile: 'report_T001.pdf'
// 	},
// 	{
// 		id: 'T002',
// 		title: 'Ứng dụng AI trong phân tích dữ liệu y tế',
// 		instructor: 'PGS. Trần Thị B',
// 		student: 'Lê Thị Z',
// 		status: 'graded',
// 		submittedAt: '2024-09-18',
// 		score: 9.0,
// 		reportFile: 'report_T002.pdf'
// 	}
// ]

export const getPhaseStats = (rawStats: GetStatiticInPeriod | undefined, phase: PhaseType): PhaseStats[] => {
	if (!rawStats) {
		return []
	}
	console.log('Raw Stats:', rawStats)
	switch (phase) {
		case 'submit_topic':
			return [
				{ status: 'all', label: 'Đề tài đã nộp', value: rawStats.totalTopicsNumber, variant: 'default' },
				{
					status: 'submitted',
					label: 'Chờ xem xét',
					value: rawStats.submittedTopicsNumber,
					variant: 'warning'
				},
				{ status: 'approved', label: 'Đã duyệt', value: rawStats.approvalTopicsNumber, variant: 'success' },
				{
					status: 'rejected',
					label: 'Bị từ chối',
					value: rawStats.rejectedTopicsNumber,
					variant: 'destructive'
				}
			]
		case 'open_registration':
			return [
				{
					status: 'all',
					label: 'Đang mở đăng ký',
					value: rawStats.totalTopicsInPhaseNumber,
					variant: 'default'
				},
				{
					status: 'registered',
					label: 'Đã có sinh viên',
					value: rawStats.registeredTopicsNumber,
					variant: 'success'
				},
				{
					status: 'pending_registration',
					label: 'Chưa có sinh viên',
					value: rawStats.emptyTopicsNumber,
					variant: 'warning'
				},
				{
					status: 'total_students',
					label: 'Tổng SV đăng ký',
					value: rawStats.totalTopicsInPhaseNumber,
					variant: 'default'
				}
			]
		case 'execution':
			return [
				{
					status: 'in_progress',
					label: 'Đang thực hiện',
					value: rawStats.inNormalProcessingNumber,
					variant: 'default'
				},
				{ status: 'paused', label: 'Tạm dừng', value: rawStats.pausedTopicsNumber, variant: 'warning' },
				{
					status: 'submitted_for_review',
					label: 'Đã hoàn thành',
					value: rawStats.submittedToReviewTopicsNumber,
					variant: 'success'
				},
				{
					status: 'delayed',
					label: 'Chậm tiến độ',
					value: rawStats.delayedTopicsNumber,
					variant: 'destructive'
				}
			]
		case 'completion':
			return [
				{ status: 'graded', label: 'Đã chấm điểm', value: rawStats.gradedTopicsNumber, variant: 'success' },
				{ status: 'archived', label: 'Lưu thư viện', value: rawStats.achivedTopicsNumber, variant: 'default' },
				{
					status: 'awaiting_evaluation',
					label: 'Chờ chấm',
					value: rawStats.readyForEvaluationNumber,
					variant: 'warning'
				},
				{
					status: 'rejected_final',
					label: 'Bị từ chối',
					value: rawStats.rejectedFinalTopicsNumber,
					variant: 'destructive'
				}
			]
		default:
			return []
	}
}
export function getLabelForStatus(status: string): string {
	switch (status) {
		case 'approved':
			return 'Đã duyệt'
		case 'submitted':
			return 'Đã nộp'
		case 'rejected':
			return 'Bị từ chối'
		case 'graded':
			return 'Đã chấm điểm'
		case 'in_progress':
			return 'Đang thực hiện'
		case 'completed':
			return 'Hoàn thành'
		default:
			return 'Khác'
	}
}

export function getVariantForStatus(status: string): string {
	switch (status) {
		case 'approved':
			return 'success'
		case 'submitted':
			return 'info'
		case 'rejected':
			return 'destructive'
		case 'graded':
			return 'warning'
		case 'in_progress':
			return 'primary'
		case 'completed':
			return 'success'
		default:
			return 'default'
	}
}
// src/modules/manage-period/mock/detailPeriod.ts
import type { PeriodBackend } from '@/models/period.model'
import type { GetStatiticInPeriod } from '@/models/statistic.model'
// const mockLecturers: ResponseMiniLecturerDto[] = [
// 	{
// 		_id: 'lec1',
// 		fullName: 'TS. Nguyễn Văn A',
// 		email: 'nguyenvana@university.edu.vn',
// 		phone: '0912345678',
// 		avatarUrl: '/avatars/lec1.png',
// 		avatarName: 'lec1.png',
// 		title: 'Tiến sĩ'
// 	},
// 	{
// 		_id: 'lec2',
// 		fullName: 'PGS. Trần Thị B',
// 		email: 'tranthib@university.edu.vn',
// 		phone: '0987654321',
// 		avatarUrl: '/avatars/lec2.png',
// 		avatarName: 'lec2.png',
// 		title: 'Phó Giáo sư'
// 	}
// ]
// export const mockPeriodDetail: PeriodBackend = {
// 	id: 'p1',
// 	name: 'Đợt đăng ký đề tài HK1 2025',
// 	startDate: '2025-01-01',
// 	endDate: '2025-05-30',
// 	status: 'ongoing',
// 	currentPhase: 'submit_topic',
// 	faculty: {
// 		name: 'Khoa Công Nghệ Thông Tin',
// 		email: 'fit@university.edu.vn',
// 		urlDirection: 'https://fit.university.edu.vn'
// 	},
// 	phases: [
// 		{
// 			_id: '122	',
// 			phase: 'submit_topic',
// 			startTime: '2025-01-01T00:00:00Z',
// 			endTime: '2025-01-15T23:59:59Z',
// 			status: 'ongoing',
// 			minTopicsPerLecturer: 3,
// 			requiredLecturers: mockLecturers,
// 			allowManualApproval: true
// 		},
// 		{
// 			_id: '123',
// 			phase: 'open_registration' as PhaseType,
// 			startTime: '2025-01-16T00:00:00Z',
// 			endTime: '2025-01-25T23:59:59Z',
// 			status: 'not_started',
// 			allowManualApproval: false
// 		},
// 		{
// 			_id: '124',
// 			phase: 'execution' as PhaseType,
// 			startTime: '2025-01-26T00:00:00Z',
// 			endTime: '2025-04-30T23:59:59Z',
// 			status: 'not_started',
// 			allowManualApproval: false
// 		},
// 		{
// 			_id: '125',
// 			phase: 'completion' as PhaseType,
// 			startTime: '2025-05-01T00:00:00Z',
// 			endTime: '2025-05-30T23:59:59Z',
// 			status: 'not_started',
// 			allowManualApproval: true
// 		}
// 	]
// }
