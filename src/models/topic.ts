// =========================
// Base Entity

import type { LecturerProfile, StudentUser } from './users'

// =========================
export interface BaseEntity {
	_id: string
	created_at?: string
	updated_at?: string
}

// =========================
// PeriodPhaseName
// =========================
export type PeriodPhaseName = 'empty' | 'submit_topic' | 'open_registration' | 'execution' | 'completion'

// =========================
// TopicStatus
// =========================
export type TopicStatus =
	// Phase 1 - Submit topic
	| 'draft'
	| 'submitted'
	| 'under_review'
	| 'approved'
	| 'rejected'
	// Phase 2 - Registration
	| 'pending_registration'
	| 'registered'
	| 'full'
	| 'cancelled'
	// Phase 3 - Execution
	| 'in_progress'
	| 'delayed'
	| 'paused'
	| 'submitted_for_review'
	| 'awaiting_evaluation'
	// Phase 4 - Completion
	| 'graded'
	| 'reviewed'
	| 'archived'
	| 'rejected_final'

// =========================
// TopicType
// =========================
export type TopicType = 'Khóa luận tốt nghiệp' | 'Nghiên cứu khoa học'

// =========================
// PhaseHistory
// =========================
export interface PhaseHistory extends BaseEntity {
	phaseName: PeriodPhaseName
	status: TopicStatus
	actor: string
	notes?: string
}

// =========================
// Grade + DetailGrade
// =========================
export interface DetailGrade extends BaseEntity {
	score: number
	note?: string
	actorId: string
}

export interface Grade extends BaseEntity {
	averageScore?: number
	detailGrades: DetailGrade[]
}

// =========================
// Major
// =========================
export interface Major extends BaseEntity {
	name: string
	facultyId: string
}

// =========================
// Field
// =========================
export interface Field extends BaseEntity {
	name: string
	slug: string
	description: string
}

// =========================
// Requirement
// =========================
export interface Requirement extends BaseEntity {
	name: string
	slug: string
	description?: string
}

// =========================
// Topic 
// =========================
export interface Topic extends BaseEntity {
	titleVN: string
	titleEng: string
	description: string
	type: TopicType
	major: Major | string // nếu chưa join, vẫn là ObjectId
	maxStudents: number
	referenceDocs: string[]
	createBy: string
	currentStatus: TopicStatus
	currentPhase: PeriodPhaseName
	phaseHistories: PhaseHistory[]
	periodId: string
	grade: Grade
	requirementIds: string[]
	fileIds: string[]

	// Các field join từ pipeline
	lecturers?: LecturerProfile[]
	students?: StudentUser[]
	fields?: Field[]
	requirements?: Requirement[]
	isSaved?: boolean
	isRegistered?: boolean
}

