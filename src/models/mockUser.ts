import type { User } from "./users"

export const mockStudent: User = {
	id: 'stu-1',
	username: 'student01',
	email: 'student01@uit.edu.vn',
	fullName: 'Nguyễn Văn A',
	role: 'student',
	isActive: true,
	studentProfile: {
		year: 3,
		majorSubjects: ['AI', 'Web Development', 'Database'],
		skills: ['React', 'Node.js', 'SQL'],
		careerOrientation: ['Frontend Developer', 'Fullstack Developer'],
		gpa: 3.6
	},
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString()
}

export const mockTeacher: User = {
	id: 'tea-1',
	username: 'teacher01',
	email: 'teacher01@uit.edu.vn',
	fullName: 'Trần Thị B',
	role: 'teacher',
	isActive: true,
	teacherProfile: {
		title: 'Dr.',
		department: 'Computer Science',
		university: 'UIT',
		phone: '0909123456',
		officeLocation: 'Room 101',
		expertise: ['AI', 'Machine Learning', 'Blockchain'],
		researchStats: {
			totalProjects: 20,
			completedProjects: 15,
			excellentProjects: 5,
			goodProjects: 7,
			averageProjects: 3,
			successRate: '75%'
		},
		publishedResearch: [
			{ title: 'Deep Learning for X', journal: 'Journal of AI', year: 2022 },
			{ title: 'Blockchain in Education', conference: 'ICSE 2023', year: 2023 }
		],
		ongoingProjects: [{ projectId: 'p-101', title: 'AI Chatbot', field: 'AI', startDate: '2025-01-01' }],
		completedProjects: [
			{ projectId: 'p-100', title: 'Student Management System', field: 'Software Engineering', year: 2024 }
		]
	},
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString()
}

export const mockAdmin: User = {
	id: 'adm-1',
	username: 'admin01',
	email: 'admin01@uit.edu.vn',
	fullName: 'Lê Văn C',
	role: 'admin',
	isActive: true,
	createdAt: new Date().toISOString(),
	updatedAt: new Date().toISOString()
}