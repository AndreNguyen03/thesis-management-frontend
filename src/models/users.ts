// Role
export type Role = 'student' | 'lecturer' | 'admin'

// Student Project
export interface StudentProject {
	title: string
	description: string
	technologies: string[]
}

// Education
export interface Education {
	degree: string
	university: string
	year: string
	specialization: string
}

// Publication
export interface Publication {
	title: string
	journal: string
	conference: string
	year: string
	type: string
	citations: number
}

// Research Project
export interface ResearchProject {
	title: string
	duration: string
	funding?: string
	role: string
	budget?: string
}

// Thesis
export interface CompletedThesis {
	year: string
	title: string
	student: string
	result: string
	field: string
}

export interface CurrentThesis {
	title: string
	field: string
	slotsLeft: number
	totalSlots: number
	deadline: string
	difficulty: number
}

// Thesis Stats
export interface ThesisStats {
	total: number
	completed: number
	ongoing: number
	excellent: number
	good: number
	average: number
	successRate: number
}

// Base user fields
interface BaseUser {
	id: string
	fullName: string
	email: string
	phone?: string
	avatar?: string
	role: Role
	isActive: boolean
}

// Student user
export interface StudentUser extends BaseUser {
	role: 'student'
	class: string
	major: string
	introduction: string
	skills: string[]
	projects: StudentProject[]
	subjects: string[]
	interests: string[]
}

// Lecturer user
export interface LecturerUser extends BaseUser {
	role: 'lecturer'
	position: string
	department: string
	faculty: string
	office: string
	expertise: string[]
	researchInterests: string[]
	bio: string
	education: Education[]
	publications: Publication[]
	projects: ResearchProject[]
	thesisStats: ThesisStats
	completedThesis: CompletedThesis[]
	currentThesis: CurrentThesis[]
}

// Admin user
export interface AdminUser extends BaseUser {
	role: 'admin'
}

// Union type for all users
export type AppUser = StudentUser | LecturerUser | AdminUser
