import type { Topic } from './types'

const advisors = [
	{ id: '1', name: 'TS. Nguyễn Văn An', avatar: 'https://i.pravatar.cc/150?img=11', department: 'Khoa CNTT' },
	{ id: '2', name: 'PGS.TS. Trần Thị Bình', avatar: 'https://i.pravatar.cc/150?img=5', department: 'Khoa Điện tử' },
	{ id: '3', name: 'TS. Lê Hoàng Cường', avatar: 'https://i.pravatar.cc/150?img=12', department: 'Khoa CNTT' },
	{ id: '4', name: 'ThS. Phạm Minh Đức', avatar: 'https://i.pravatar.cc/150?img=13', department: 'Khoa Cơ khí' },
	{ id: '5', name: 'TS. Võ Thị Hương', avatar: 'https://i.pravatar.cc/150?img=9', department: 'Khoa Kinh tế' }
]

const mockStudents = [
	{
		id: 's1',
		fullName: 'Nguyễn Minh Khôi',
		email: 'khoi01@student.uit.edu.vn',
		avatar: 'https://i.pravatar.cc/150?img=32'
	},
	{
		id: 's2',
		fullName: 'Trần Thu Hà',
		email: 'ha.tran@student.uit.edu.vn',
		avatar: 'https://i.pravatar.cc/150?img=45'
	},
	{
		id: 's3',
		fullName: 'Lê Tiến Đạt',
		email: 'dat.lt@student.uit.edu.vn',
		avatar: 'https://i.pravatar.cc/150?img=51'
	},
	{
		id: 's4',
		fullName: 'Phạm Hồng Ngọc',
		email: 'hongngoc@student.uit.edu.vn',
		avatar: 'https://i.pravatar.cc/150?img=22'
	},
	{
		id: 's5',
		fullName: 'Võ Đức Thắng',
		email: 'thang.vo@student.uit.edu.vn',
		avatar: 'https://i.pravatar.cc/150?img=17'
	},
	{
		id: 's6',
		fullName: 'Hoàng Trúc Vy',
		email: 'vy.ht@student.uit.edu.vn',
		avatar: 'https://i.pravatar.cc/150?img=68'
	},
	{
		id: 's7',
		fullName: 'Bùi Quốc Hưng',
		email: 'hungbq@student.uit.edu.vn',
		avatar: 'https://i.pravatar.cc/150?img=70'
	}
]

const fields = [
	'Trí tuệ nhân tạo',
	'An ninh mạng',
	'Phát triển web',
	'IoT & Nhúng',
	'Phân tích dữ liệu',
	'Blockchain',
	'Mobile App',
	'Cloud Computing'
]

const allSkills = [
	'Python',
	'React',
	'Machine Learning',
	'Deep Learning',
	'TensorFlow',
	'Node.js',
	'Docker',
	'Kubernetes',
	'AWS',
	'PostgreSQL',
	'TypeScript',
	'Java',
	'C++',
	'Flutter',
	'Swift',
	'Solidity',
	'Go',
	'Rust',
	'MongoDB',
	'Redis'
]

const topicTitles = [
	'Xây dựng hệ thống nhận diện khuôn mặt bằng Deep Learning',
	'Phát triển ứng dụng quản lý sinh viên sử dụng React và Node.js',
	'Nghiên cứu và triển khai mô hình GPT cho chatbot hỗ trợ học tập',
	'Xây dựng hệ thống phát hiện gian lận giao dịch tài chính',
	'Phát triển nền tảng IoT cho nông nghiệp thông minh',
	'Xây dựng hệ thống blockchain cho chứng thực học bạ số',
	'Phát triển ứng dụng di động theo dõi sức khỏe với AI',
	'Nghiên cứu thuật toán tối ưu cho bài toán lập lịch',
	'Xây dựng hệ thống đề xuất khóa học cá nhân hóa',
	'Phát triển platform học trực tuyến với tính năng tương tác'
]

const descriptions = [
	'Đề tài tập trung vào việc nghiên cứu và ứng dụng các kỹ thuật tiên tiến nhất trong lĩnh vực học sâu để giải quyết các vấn đề thực tế.',
	'Dự án nhằm xây dựng một hệ thống hoàn chỉnh từ backend đến frontend, đáp ứng các yêu cầu thực tế của doanh nghiệp.',
	'Nghiên cứu áp dụng các mô hình AI mới nhất để tạo ra giải pháp đột phá.'
]

function getRandomItems<T>(arr: T[], count: number): T[] {
	const shuffled = [...arr].sort(() => 0.5 - Math.random())
	return shuffled.slice(0, count)
}

function getRandomInt(min: number, max: number): number {
	return Math.floor(Math.random() * (max - min + 1)) + min
}

// export function generateMockTopics(count: number = 50): Topic[] {
// 	const topics: Topic[] = []

// 	for (let i = 0; i < count; i++) {
// 		const maxSlots = getRandomInt(2, 5)
// 		const currentSlots = getRandomInt(0, maxSlots)
// 		const remainingSlots = maxSlots - currentSlots

// 		let status: Topic['status'] = 'available'
// 		if (remainingSlots === 0) status = 'full'

// 		const registeredStudents = getRandomItems(mockStudents, currentSlots)

// 		topics.push({
// 			id: `topic-${i + 1}`,
// 			title: topicTitles[i % topicTitles.length],
// 			description: descriptions[i % descriptions.length],
// 			advisor: advisors[i % advisors.length],
// 			requirements: getRandomItems(allSkills, getRandomInt(3, 6)),
// 			currentSlots,
// 			maxSlots,
// 			field: fields[i % fields.length],
// 			status,
// 			registeredStudents,
// 			createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
// 		})
// 	}

// 	return topics
// }

export const mockAdvisors = advisors
export const mockFields = fields
export const mockSkills = allSkills
export const mockRegisteredStudents = mockStudents
