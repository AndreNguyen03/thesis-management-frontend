import type { AcademicTitle } from '@/features/admin/manage_lecturer/types'
import type { GetPaginatedObject } from './paginated-object.model'
import type { PaginationQueryParamsDto } from './query-params'

// Role
export type Role = 'student' | 'lecturer' | 'admin' | 'faculty_board'
export const ROLES = {
	STUDENT: 'student',
	LECTURER: 'lecturer',
	ADMIN: 'admin',
	FACULTY_BOARD: 'faculty_board'
} as const
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
	link?: string
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
	_id: string
	fullName: string
	email: string
	phone?: string
	avatarUrl?: string
	role: Role
	isActive: boolean
}

// Student user
export interface StudentUser {
	userId: string
	studentCode: string
	fullName: string
	email: string
	bio: string
	phone?: string
	facultyName?: string
	facultyId?: string
	introduction?: string
	avatarUrl?: string
	isActive: boolean
	role: 'student'
	class: string
	major: string
	skills: string[]
	interests: string[]
}

// Lecturer user
export interface LecturerProfile {
	userId: string
	fullName: string
	email: string
	bio: string
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

export interface ResponseMiniStudentDto {
	_id: string
	fullName: string
	email: string
	phone: string
	avatarUrl?: string
	avatarName?: string
	studentCode: string
	major: string
	facultyName: string
	skills?: string[]
}
export interface PaginatedStudents extends GetPaginatedObject {
	data: ResponseMiniStudentDto[]
}
export interface ResponseMiniLecturerDto {
	_id: string
	fullName: string
	email: string
	phone: string
	avatarUrl: string
	avatarName: string
	//titlePath?: AcademicTitle
	title: string
	facultyName: string
	roleInTopic: string
}
export interface MiniActorInforDto {
	_id: string
	fullName: string
	email: string
	phone: string
	avatarUrl: string
	avatarName: string
}

export interface PaginatedMiniLecturer extends GetPaginatedObject {
	data: ResponseMiniLecturerDto[]
}
export interface GetMiniUserDto {
	_id: string
	fullName: string
	email: string
	phone: string
	avatarUrl: string
	role: string
	title?: string
	// facultyId: string
	// facultyName: string
}

export interface StudentTable {
	id: string
	studentCode: string
	fullName: string
	email: string
	phone?: string
	class: string
	major: string
	facultyId: string
	facultyName: string
	isActive: boolean
	createdAt?: Date
}

export interface Faculty {
	id: string
	name: string
	urlDirection: string
	email: string
	createdAt?: string
	updatedAt?: string
}

export interface PaginationLecturerQueryParams extends PaginationQueryParamsDto {
	title?: AcademicTitle | 'all'
	isActive?: boolean | 'all'
	facultyId?: string | 'all'
}

export interface CreateLecturerSuccessItem {
	fullName: string
	email: string
	facultyName: string
}

export interface CreateLecturerFailedItem {
	fullName: string
	reason: string
}
export interface CreateLecturerBatchResponse {
	success: CreateLecturerSuccessItem[]
	failed: CreateLecturerFailedItem[]
}

export interface CreateBatchLecturerDto {
	fullName: string
	facultyName: string
	title: string
	phone?: string
}

export interface PaginationStudentQueryParams extends PaginationQueryParamsDto {
	major?: string | 'all'
	isActive?: boolean | 'all'
	facultyId?: string | 'all'
}

export interface CreateStudentSuccessItem {
	studentCode: string
	fullName: string
	email: string
}

export interface CreateStudentFailedItem {
	studentCode: string
	reason: string
}
export interface CreateStudentBatchResponse {
	success: CreateStudentSuccessItem[]
	failed: CreateStudentFailedItem[]
}

export interface CreateBatchStudentDto {
	fullName: string
	studentCode: string
	class: string
	major: string
	facultyName: string
	phone?: string
	email?: string
	isActive?: boolean
}

export interface CreateStudentRequest {
	email: string
	password?: string
	fullName: string
	isActive: boolean
	phone?: string
	facultyId: string
	studentCode: string
	class: string
	major: string
}

export interface StudentTable {
	id: string
	studentCode: string
	fullName: string
	email: string
	phone?: string
	class: string
	major: string
	facultyId: string
	facultyName: string
	isActive: boolean
	createdAt?: Date
}

export interface Faculty {
	id: string
	name: string
	urlDirection: string
	email: string
	createdAt?: string
	updatedAt?: string
}

// models/search-users.ts

// Query params khi gọi API
export interface SearchUserQueryDto {
	query?: string
	page?: number
	limit?: number
}

// 1 item user trả về
export interface SearchUserItemDto {
	id: string
	fullName: string
	email: string
	role: 'student' | 'lecturer' | 'admin' | 'faculty_board'
	studentCode?: string
	title?: string
	avatarUrl?: string
}

// Kết quả phân trang
export interface PaginatedSearchUserDto {
	data: SearchUserItemDto[]
	meta: {
		itemsPerPage: number
		totalItems: number
		currentPage: number
		totalPages: number
	}
}
