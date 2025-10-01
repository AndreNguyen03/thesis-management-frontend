import type { StudentProject } from './users'
import type { Education, Publication, ResearchProject, ThesisStats, CurrentThesis, CompletedThesis } from './users'

// DTO để update student từ frontend
export type PatchStudentDto = Partial<{
	fullName: string
	class: string
	major: string
	email: string
	phone?: string
	avatar?: string
	isActive?: boolean
	introduction?: string
	skills?: string[]
	projects?: StudentProject[]
	subjects?: string[]
	interests?: string[]
}>

// DTO để update lecturer từ frontend
export type PatchLecturerDto = Partial<{
	email: string
	fullName: string
	password?: string
	phone?: string
	avatar?: string
	isActive?: boolean
	position?: string
	department?: string
	faculty?: string
	office?: string
	expertise?: string[]
	researchInterests?: string[]
	bio?: string
	education?: Education[]
	publications?: Publication[]
	projects?: ResearchProject[]
	thesisStats?: ThesisStats
	completedThesis?: CompletedThesis[]
	currentThesis?: CurrentThesis[]
}>
