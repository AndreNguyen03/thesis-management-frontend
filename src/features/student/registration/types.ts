export interface Topic {
	id: string
	title: string
	description: string
	advisor: {
		id: string
		name: string
		avatar: string
		department: string
	}
	requirements: string[]
	currentSlots: number
	maxSlots: number
	registeredStudents: {
		id: string
		fullName: string
		email: string
	}[]
	field: string
	status: 'available' | 'full'
	createdAt: string
}
export interface PaginatedTopics {
	data: Topic[]
	meta: {
		itemsPerPage: number
		totalItems: number
		currentPage: number
		totalPages: number
	}
	availableTopics: number
}
export interface FilterState {
	lecturerIds: string[]
	fieldIds: string[]
	status: string[] // full / registered / pending_registration
}

// Registration phase types
export type RegistrationPhase = 'before' | 'open' | 'closed'

export interface RegistrationPeriod {
	phase: RegistrationPhase
	startDate: Date
	endDate: Date
	name: string
}

export interface RegisteredTopic {
	topic: Topic
	registeredAt: Date
}
