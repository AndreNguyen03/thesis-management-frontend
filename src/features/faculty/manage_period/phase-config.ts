/* eslint-disable @typescript-eslint/no-explicit-any */
import type { PhaseType } from '@/models/period'
import {
	useCreateCompletionPhaseMutation,
	useCreateExecutionPhaseMutation,
	useCreateOpenRegPhaseMutation,
	useCreateSubmitTopicPhaseMutation,
	useGetStatisticsCompletionPhaseQuery,
	useGetStatisticsExecutionPhaseQuery,
	useGetStatisticsOpenRegistrationPhaseQuery,
	useGetStatisticsSubmitTopicPhaseQuery
} from '@/services/periodApi'

interface PhaseConfigItem {
	title: string
	statsLabels: string[]
	useStatsQuery: (periodId: string) => any
	useCreateMutation: () => any
}

export const phaseConfig: Record<PhaseType, PhaseConfigItem> = {
	empty: {
		title: 'Chưa có pha nào',
		statsLabels: [],
		useStatsQuery: () => null,
		useCreateMutation: () => null
	},
	submit_topic: {
		title: 'Pha 1 - Nộp đề tài',
		statsLabels: ['Tổng số đề tài', 'Đã nộp', 'Đang duyệt', 'Đã được duyệt', 'Bị từ chối'],
		useStatsQuery: useGetStatisticsSubmitTopicPhaseQuery,
		useCreateMutation: useCreateSubmitTopicPhaseMutation
	},

	open_registration: {
		title: 'Pha 2 - Mở đăng ký',
		statsLabels: ['Tổng số đề tài trong pha', 'Đề tài chưa có người đăng ký', 'Đã có người đăng ký', 'Đầy chỗ'],
		useStatsQuery: useGetStatisticsOpenRegistrationPhaseQuery,
		useCreateMutation: useCreateOpenRegPhaseMutation
	},

	execution: {
		title: 'Pha 3 - Thực hiện đề tài',
		statsLabels: [
			'Đang thực hiện bình thường',
			'Đề tài bị trễ tiến độ',
			'Đang tạm dừng',
			'Đã nộp báo cáo',
			'Sẵn sàng đánh giá'
		],
		useStatsQuery: useGetStatisticsExecutionPhaseQuery,
		useCreateMutation: useCreateExecutionPhaseMutation
	},

	completion: {
		title: 'Pha 4 - Hoàn thành',
		statsLabels: ['Sẵn sàng đánh giá', 'Đã chấm điểm', 'Đạt yêu cầu', 'Không đạt'],
		useStatsQuery: useGetStatisticsCompletionPhaseQuery,
		useCreateMutation: useCreateCompletionPhaseMutation
	}
}
