import type { AcademicTitle } from '@/features/admin/manage_lecturer/types'

// Role
export type Role = 'student' | 'lecturer' | 'admin' | 'faculty_board'

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
export interface BaseUser {
	id: string
	fullName: string
	email: string
	phone?: string
	avatarUrl?: string
	role: Role
	isActive: boolean
}

// Student user
export interface StudentUser {
	id: string
	fullName: string
	email: string
	phone?: string
	avatarUrl?: string
	isActive: boolean
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
export interface LecturerProfile {
	userId: string
	fullName: string
	email: string
	phone?: string
	avatarUrl?: string
	title: AcademicTitle
	facultyId: string
	facultyName: string
	role: 'lecturer'
	isActive: boolean
	areaInterest?: string[]
	researchInterests?: string[]
	publications?: Publication[]
	supervisedThesisIds?: string[]
	createdAt?: Date
	updatedAt?: Date
}

// Admin user
export interface AdminUser extends BaseUser {
	role: 'admin'
}

// department-board user
export interface FacultyBoardProfile {
	userId: string
	fullName: string
	email: string
	phone?: string
	avatarUrl?: string
	facultyId: string
	facultyName: string
	role: 'faculty_board'
	isActive: boolean
	createdAt?: Date
	updatedAt?: Date
}

export type AppUser = StudentUser | LecturerProfile | AdminUser | FacultyBoardProfile
