export const DEFAULT_PASSWORD = '123456789'

export interface CreateUserRequest {
	email: string
	password?: string
	title: AcademicTitle
	fullName: string
	isActive: boolean
	phone?: string
	facultyId: string
}

export interface LecturerTable {
	id: string
	email: string
	title: AcademicTitle
	fullName: string
	facultyName: string
	facultyId: string
	phone?: string
	role: string
	isActive: boolean
	createdAt: string
	// last_login?: string
	updatedAt: string
}


export type AcademicTitle = 'Thạc sĩ' | 'Tiến sĩ' | 'Phó Giáo sư' | 'Giáo sư'

export interface Faculty {
	id: string
	name: string
	urlDirection: string
	email: string
	createdAt?: string
	updatedAt?: string
}

