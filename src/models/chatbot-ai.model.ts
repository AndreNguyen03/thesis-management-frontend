export interface CandidateEntity {
	id: string
	name: string
}

export interface GeneratedSuggestion {
	vn: string
	en: string
	description?: string
	keywords?: {
		fields?: string[]
		requirements?: string[]
	}
}

export interface GeneratedSuggestionWithMatches extends GeneratedSuggestion {
	candidateFields?: CandidateEntity[]
	missingFields?: string[]
	candidateRequirements?: CandidateEntity[]
	missingRequirements?: string[]
}

export interface GenerateTopicResponse {
	suggestions: GeneratedSuggestionWithMatches[]
}

export interface ApplyGeneratedResponse {
	createdFields: Array<{ _id: string; name: string; slug: string }>
	createdRequirements: Array<{ _id: string; name: string; slug: string }>
}
