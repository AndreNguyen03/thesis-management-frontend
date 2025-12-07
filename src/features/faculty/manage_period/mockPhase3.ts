import type { Phase3Response } from '@/models/period-phase.models'
export const mockPhase3_WithOverdue: Phase3Response = {
	periodId: '69244d2a259f2b88a55417c9',
	phase: 'execution',
	canTriggerNextPhase: false,
	overdueTopics: [
		{
			topicId: 'tpc_001',
			title: 'Ứng dụng AI trong xử lý ảnh y tế',
			lecturerId: 'lec_001',
			lecturerEmail: 'tuanlv@uit.edu.vn',
			studentIds: ['st_001', 'st_002'],
			studentEmails: ['sv001@uit.edu.vn', 'sv002@uit.edu.vn']
		},
		{
			topicId: 'tpc_002',
			title: 'Hệ thống quản lý đồ án tốt nghiệp',
			lecturerId: 'lec_002',
			lecturerEmail: 'hungnt@uit.edu.vn',
			studentIds: ['st_010'],
			studentEmails: ['sv010@uit.edu.vn']
		}
	]
}
export const mockPhase3_NoOverdue: Phase3Response = {
	periodId: '69244d2a259f2b88a55417c9',
	phase: 'execution',
	canTriggerNextPhase: true,
	overdueTopics: []
}
