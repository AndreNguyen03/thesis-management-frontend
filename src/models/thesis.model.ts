import type { RegistrantInThesis, Registration, RegistrationInsideThesis } from './registration.model'

export interface Thesis {
	_id: string

	title: string

	description: string

	department: string

	field: string

	maxStudents: number

	registeredStudents: number

	registrationIds: RegistrationInsideThesis[]

	deadline: Date

	requirements: string[]

	status: string

	rating: number

	views: number

	created_at: Date

	updated_at: Date
	
	isSaved: boolean
}
