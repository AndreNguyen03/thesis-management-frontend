export type Status = 'receiving' | 'full' | 'locked'
export type ReviewMode = 'auto' | 'manual'
export type Semester = 'current' | 'prev-1' | 'prev-2'

export interface Student {
	id: string
	name: string
	skills: string[]
	note: string
	appliedAt: string
	status: 'pending' | 'approved' | 'rejected'
	rejectionReason?: string
	rejectionNote?: string
}

export interface Topic {
	id: string
	title: string
	description: string
	status: Status
	mode: ReviewMode
	currentStudents: number
	maxStudents: number
	students: Student[]
}

export interface RejectPayload {
	topicId: string
	studentId: string
}
