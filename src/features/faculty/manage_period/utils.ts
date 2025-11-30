import type { ResponseMiniLecturerDto, TopicStatus } from '@/models'
import type { PhaseStats, PhaseType, StatVariant } from '@/models/period.model'
import {
	FileText,
	CheckCircle,
	AlertTriangle,
	XCircle,
	UserCheck,
	UserMinus,
	Users,
	PauseCircle,
	Timer,
	Archive,
	BookCheck,
	PenLine,
	Repeat
} from 'lucide-react'

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

export const iconVariantStyles: Record<StatVariant | 'default', string> = {
	default: 'bg-muted text-muted-foreground',
	primary: 'bg-primary/10 text-primary',
	success: 'bg-success/10 text-success',
	warning: 'bg-warning/10 text-warning',
	destructive: 'bg-destructive/10 text-destructive',
	info: 'bg-blue-100 text-blue-500',
	neutral: 'bg-gray-100 text-gray-500',
	purple: 'bg-purple-100 text-purple-500',
	orange: 'bg-orange-100 text-orange-500'
}

export const statVariantClasses: Record<StatVariant, string> = {
	primary: 'border-primary/20 bg-primary/5',
	success: 'border-success/20 bg-success/5',
	warning: 'border-warning/20 bg-warning/5',
	destructive: 'border-destructive/20 bg-destructive/5',
	info: 'border-blue-400/20 bg-blue-400/5',
	neutral: 'border-gray-400/20 bg-gray-400/5',
	purple: 'border-purple-400/20 bg-purple-400/5',
	orange: 'border-orange-400/20 bg-orange-400/5'
}

export const statMeta = {
	all: { icon: FileText, description: 'Tổng số đề tài', iconVariant: 'primary' },
	submitted: { icon: FileText, description: 'Đang chờ duyệt', iconVariant: 'warning' },
	approved: { icon: CheckCircle, description: 'Đã được chấp thuận', iconVariant: 'success' },
	rejected: { icon: XCircle, description: 'Không đạt yêu cầu', iconVariant: 'destructive' },
	adjust_request: { icon: Repeat, description: 'Cần chỉnh sửa nội dung', iconVariant: 'purple' },
	registered: { icon: UserCheck, description: 'Đã có sinh viên đăng ký', iconVariant: 'success' },
	pending_registration: { icon: UserMinus, description: 'Chưa có sinh viên nào', iconVariant: 'neutral' },
	total_students: { icon: Users, description: 'Tổng lượt sinh viên đã đăng ký', iconVariant: 'info' },
	in_progress: { icon: Timer, description: 'Đang thực hiện', iconVariant: 'primary' },
	paused: { icon: PauseCircle, description: 'Tạm dừng tiến độ', iconVariant: 'neutral' },
	submitted_for_review: { icon: BookCheck, description: 'Đã hoàn thành, chờ duyệt', iconVariant: 'success' },
	delayed: { icon: AlertTriangle, description: 'Chậm tiến độ', iconVariant: 'warning' },
	graded: { icon: CheckCircle, description: 'Đã chấm điểm xong', iconVariant: 'success' },
	archived: { icon: Archive, description: 'Đã đưa vào lưu trữ', iconVariant: 'neutral' },
	awaiting_evaluation: { icon: PenLine, description: 'Chờ giảng viên chấm', iconVariant: 'warning' },
	rejected_final: { icon: XCircle, description: 'Không đạt yêu cầu cuối', iconVariant: 'destructive' }
} as const

export const getPhaseStats = (rawStats: GetStatiticInPeriod | undefined, phase: PhaseType): PhaseStats[] => {
	if (!rawStats) return []

	switch (phase) {
		case 'submit_topic':
			return [
				{
					status: 'all',
					label: 'Đề tài đã nộp',
					value: rawStats.totalTopicsNumber,
					variant: 'primary',
					...statMeta.all
				},
				{
					status: 'submitted',
					label: 'Chờ xem xét',
					value: rawStats.submittedTopicsNumber,
					variant: 'warning',
					...statMeta.submitted
				},
				{
					status: 'approved',
					label: 'Đã duyệt',
					value: rawStats.approvalTopicsNumber,
					variant: 'success',
					...statMeta.approved
				},
				{
					status: 'rejected',
					label: 'Bị từ chối',
					value: rawStats.rejectedTopicsNumber,
					variant: 'destructive',
					...statMeta.rejected
				},
				{
					status: 'adjust_request',
					label: 'Yêu cầu sửa',
					value: rawStats.adjustRequestTopicsNumber,
					variant: 'purple',
					...statMeta.adjust_request
				}
			]

		case 'open_registration':
			return [
				{
					status: 'all',
					label: 'Đang mở đăng ký',
					value: rawStats.totalTopicsInPhaseNumber,
					variant: 'primary',
					...statMeta.all
				},
				{
					status: 'full',
					label: 'Đã đủ sinh viên',
					value: rawStats.fullTopicsNumber,
					variant: 'success',
					...statMeta.registered
				},
				{
					status: 'registered',
					label: 'Đã có sinh viên',
					value: rawStats.registeredTopicsNumber,
					variant: 'success',
					...statMeta.registered
				},
				{
					status: 'pending_registration',
					label: 'Chưa có sinh viên',
					value: rawStats.emptyTopicsNumber,
					variant: 'warning',
					...statMeta.pending_registration
				}
			]

		case 'execution':
			return [
				{
					status: 'in_progress',
					label: 'Đang thực hiện',
					value: rawStats.inNormalProcessingNumber,
					variant: 'primary',
					...statMeta.in_progress
				},
				{
					status: 'paused',
					label: 'Tạm dừng',
					value: rawStats.pausedTopicsNumber,
					variant: 'neutral',
					...statMeta.paused
				},
				{
					status: 'submitted_for_review',
					label: 'Đã hoàn thành',
					value: rawStats.submittedToReviewTopicsNumber,
					variant: 'success',
					...statMeta.submitted_for_review
				},
				{
					status: 'delayed',
					label: 'Chậm tiến độ',
					value: rawStats.delayedTopicsNumber,
					variant: 'destructive',
					...statMeta.delayed
				}
			]

		case 'completion':
			return [
				{
					status: 'graded',
					label: 'Đã chấm điểm',
					value: rawStats.gradedTopicsNumber,
					variant: 'success',
					...statMeta.graded
				},
				{
					status: 'archived',
					label: 'Lưu thư viện',
					value: rawStats.achivedTopicsNumber,
					variant: 'neutral',
					...statMeta.archived
				},
				{
					status: 'awaiting_evaluation',
					label: 'Chờ chấm',
					value: rawStats.readyForEvaluationNumber,
					variant: 'warning',
					...statMeta.awaiting_evaluation
				},
				{
					status: 'rejected_final',
					label: 'Bị từ chối',
					value: rawStats.rejectedFinalTopicsNumber,
					variant: 'destructive',
					...statMeta.rejected_final
				}
			]

		default:
			return []
	}
}

export const toInputDateTime = (iso?: string) => {
	if (!iso) return ''
	const date = new Date(iso)
	const yyyy = date.getFullYear()
	const mm = String(date.getMonth() + 1).padStart(2, '0')
	const dd = String(date.getDate()).padStart(2, '0')
	const hh = String(date.getHours()).padStart(2, '0')
	const min = String(date.getMinutes()).padStart(2, '0')
	return `${yyyy}-${mm}-${dd}T${hh}:${min}`
}

export function getLabelForStatus(status: TopicStatus | 'all'): string {
	const mapping: Record<string, string> = {
		all: 'Tất cả',
		draft: 'Nháp',
		submitted: 'Đã nộp',
		approved: 'Đã được chấp thuận',
		under_review: 'Đang chờ',
		rejected: 'Từ chối',
		adjust_request: 'Cần chỉnh sửa nội dung',
		registered: 'Đã có sinh viên đăng ký',
		pending_registration: 'Chưa có sinh viên nào',
		in_progress: 'Đang thực hiện',
		paused: 'Tạm dừng tiến độ',
		submitted_for_review: 'Đã hoàn thành, chờ duyệt',
		delayed: 'Chậm tiến độ',
		graded: 'Đã chấm điểm xong',
		archived: 'Đã đưa vào lưu trữ',
		awaiting_evaluation: 'Chờ giảng viên chấm',
		rejected_final: 'Không đạt yêu cầu cuối',
		full: 'Đã đầy',
		cancelled: 'Đã hủy'
	}

	return mapping[status] ?? 'Khác'
}

export function getVariantForStatus(status: TopicStatus | 'all'): string {
	const mapping: Record<string, string> = {
		all: 'primary',
		submitted: 'warning',
		approved: 'success',
		rejected: 'destructive',
		adjust_request: 'purple',
		registered: 'success',
		pending_registration: 'neutral',
		in_progress: 'primary',
		paused: 'neutral',
		submitted_for_review: 'success',
		delayed: 'warning',
		graded: 'success',
		archived: 'neutral',
		awaiting_evaluation: 'warning',
		rejected_final: 'destructive',
		full: 'warning',
		cancelled: 'destructive'
	}

	return mapping[status] ?? 'default'
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
