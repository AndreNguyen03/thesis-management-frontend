// import type { RegistrationInsideThesis } from './registration.model'

// export interface Topic {
// 	_id: string
// 	title: string
// 	description: string
// 	department: string
// 	field: string
// 	maxStudents: number
// 	registeredStudents: number
// 	registrationIds: RegistrationInsideThesis[]
// 	deadline: Date
// 	requirements: string[]
// 	status: string
// 	rating: number
// 	views: number
// 	created_at: Date
// 	updated_at: Date
// 	isSaved: boolean
// }

// models/topic.model.ts
export interface LecturerOption {
    _id: string
    fullName: string
    email: string
    faculty?: string
    departmentId?: string
}

export interface StudentOption {
    _id: string
    studentCode: string
    fullName: string
    email: string
}

export interface MajorOption {
    _id: string
    name: string
    departmentId: string
}

export interface DepartmentOption {
    _id: string
    name: string
}

export interface FieldOption {
    _id: string
    name: string
    description?: string
}

export interface FileOption {
    _id: string
    name: string
    filePath: string
}

export type TopicType = 'Đồ án' | 'Khóa luận' | 'NCKH'

export type TopicStatus =
	| 'draft'
	| 'pending'
	| 'approved'
	| 'rejected'
	| 'closed'

export interface SavedUserRef {
	userId: string
	savedAt: string
}

export interface CreateTopicPayload {
    title: string
    description: string
    type: 'Đồ án' | 'Khóa luận' | 'NCKH'
    majorId: string
    departmentId: string
    lecturerIds: string[]
    coAdvisorIds?: string[]
    studentIds?: string[]
    fileIds?: string[]
    maxStudents: number
    deadline?: string
    requirements: string[]
    references?: { name: string; url?: string }[]
}
