import type { ResponseMiniLecturerDto } from './users'

export interface Badge {
	type: string
	label: string
	color: 'green' | 'blue' | 'purple' | 'indigo' | 'orange' | 'red' | 'yellow' | 'gray' | 'violet'
	icon: string
	tooltip: string
	priority: number
}

export interface RecommendTopic {
	_id: string
	titleVN: string
	currentStatus: string
	studentsNum: number
	maxStudents: number
	score: number
	major: {
		_id: string
		name: string
		facultyId: string
	}
	fields: {
		_id: string
		name: string
		slug: string
	}[]
	requirements: {
		_id: string
		name: string
	}[]
	lecturers: ResponseMiniLecturerDto[]
	createByInfo: ResponseMiniLecturerDto
}

export interface FallbackTopic {
	_id: string
	titleVN: string
	titleEng: string
	description: string
	type: string // TopicType
	majorId: string
	maxStudents: number
	currentStatus: string // TopicStatus
	currentPhase: string // PeriodPhaseName
	studentsNum: number
	allowManualApproval: boolean
	// Lecturer interests (populated)
	areaInterest: string[]
	researchInterests: string[]
	// Populated arrays
	fields: {
		_id: string
		name: string
		slug: string
	}[]
	requirements: {
		_id: string
		name: string
	}[]
	updatedAt: Date
	lecturers: ResponseMiniLecturerDto[]
	createByInfo: ResponseMiniLecturerDto
}

export interface RecommendationResult {
	topic: RecommendTopic | FallbackTopic
	type: 'fallback' | 'recommend'
	badges?: Badge[]
	badgeSummary?: string
	rank?: number
}
