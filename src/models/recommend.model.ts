export interface Badge {
	type: string
	label: string
	color: 'green' | 'blue' | 'purple' | 'indigo' | 'orange' | 'red' | 'yellow' | 'gray' | 'violet'
	icon: string
	tooltip: string
	priority: number
}

export interface ResponseMiniLecturerDto {
	_id: string
	fullName: string
	email?: string
	phone?: string
	avatarUrl?: string
	avatarName?: string
}

export interface RecommendTopic {
	_id: string
	titleVN: string
	titleEng?: string
	description?: string
	type?: string // scientific_research | ...
	currentStatus: string
	studentsNum: number
	maxStudents: number
	score: number
	semanticScore?: number
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
		slug?: string
	}[]
	lecturers: ResponseMiniLecturerDto[]
	createByInfo: ResponseMiniLecturerDto
}

export interface FallbackTopic {
	_id: string
	titleVN: string
	titleEng?: string
	description?: string
	type: string
	majorId: string
	currentStatus: string
	currentPhase?: string
	studentsNum: number
	maxStudents: number
	allowManualApproval?: boolean
	areaInterest?: string[]
	researchInterests?: string[]
	fields: {
		_id: string
		name: string
		slug: string
	}[]
	requirements: {
		_id: string
		name: string
	}[]
	updatedAt?: Date
	lecturers: ResponseMiniLecturerDto[]
	createByInfo: ResponseMiniLecturerDto
	semanticScore?: number
}

export interface RecommendationResult {
	topic: RecommendTopic | FallbackTopic
	semanticScore?: number
	type: 'recommend' | 'fallback'
	badges?: Badge[]
	badgeSummary?: string
	rank?: number
}

export interface RecommendationResultData {
	statusCode: number
	message: string
	data: RecommendationResult[]
	metadata: {
		processingTime: number
		profileStatus: string
		recommendationsCount: number
		totalTopics: number
	}
}


export interface RecommendationResponse {
	data?: RecommendationResult[]
	message?: string
	statusCode?: number
	metadata?: {
		processingTime: number
		profileStatus: string
		recommendationsCount: number
		totalTopics: number
	}
}