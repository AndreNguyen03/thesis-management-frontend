export const DEFAULT_PASSWORD = '123456789'

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

