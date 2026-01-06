import type { Topic } from './types'

export const MOCK_TOPICS: Topic[] = [
	{
		id: '1',
		title: 'Xây dựng hệ thống quản lý học tập (LMS) bằng Next.js 15',
		description:
			'Nghiên cứu và triển khai ứng dụng quản lý khóa học, bài tập và điểm số sử dụng kiến trúc Server Components.',
		status: 'receiving',
		mode: 'manual',
		currentStudents: 2,
		maxStudents: 3,
		students: [
			{
				id: 's1',
				name: 'Nguyễn Văn A',
				skills: ['React', 'TypeScript'],
				note: 'Em rất muốn học hỏi về Next.js',
				appliedAt: '10:30, 20/12/2025',
				status: 'pending'
			},
			{
				id: 's2',
				name: 'Trần Thị B',
				skills: ['Tailwind', 'Node.js'],
				note: 'Đã có kinh nghiệm làm project cá nhân',
				appliedAt: '09:15, 21/12/2025',
				status: 'pending'
			},
			{
				id: 's3',
				name: 'Lê Văn C',
				skills: ['UI/UX'],
				note: 'Muốn tham gia mảng frontend',
				appliedAt: '14:20, 19/12/2025',
				status: 'approved'
			}
		]
	},
	{
		id: '2',
		title: 'Ứng dụng AI trong việc gợi ý lộ trình học tập cá nhân hóa',
		description: 'Sử dụng Vercel AI SDK và các model LLM để tạo ra trợ lý học tập thông minh cho sinh viên.',
		status: 'full',
		mode: 'auto',
		currentStudents: 3,
		maxStudents: 3,
		students: [
			{
				id: 's4',
				name: 'Phạm Minh D',
				skills: ['Python', 'OpenAI'],
				note: 'Đam mê AI/ML',
				appliedAt: '08:00, 18/12/2025',
				status: 'approved'
			},
			{
				id: 's5',
				name: 'Hoàng Văn E',
				skills: ['Next.js'],
				note: 'Thành thạo tích hợp API',
				appliedAt: '11:00, 18/12/2025',
				status: 'approved'
			},
			{
				id: 's6',
				name: 'Vũ Thị F',
				skills: ['Database'],
				note: 'Thích xử lý dữ liệu',
				appliedAt: '15:45, 18/12/2025',
				status: 'approved'
			}
		]
	},
	{
		id: '3',
		title: 'Phát triển Mobile App theo dõi sức khỏe bằng React Native',
		description: 'Xây dựng ứng dụng kết nối với các thiết bị đeo để thu thập dữ liệu nhịp tim, bước chân.',
		status: 'locked',
		mode: 'manual',
		currentStudents: 1,
		maxStudents: 2,
		students: [
			{
				id: 's7',
				name: 'Đặng Văn G',
				skills: ['React Native'],
				note: 'Đã có app trên store',
				appliedAt: '10:00, 15/12/2025',
				status: 'approved'
			},
			{
				id: 's8',
				name: 'Nguyễn Văn H',
				skills: ['Figma'],
				note: 'Muốn làm thiết kế app',
				appliedAt: '16:00, 16/12/2025',
				status: 'rejected',
				rejectionReason: 'Kỹ năng không phù hợp',
				rejectionNote: 'Yêu cầu kỹ năng code mobile mạnh hơn.'
			}
		]
	}
]
