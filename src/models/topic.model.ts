export interface Topic {
	_id: string

	title: string

	description: string

	type: string

	field: string

	createBy: string

	status: string

	major: string

	lecturerNames: string[]

	requirementNames: string[]

	fieldNames: string[]

	studentNames: string[]

	maxStudents: number

	deadline: Date

	created_at: Date

	updated_at: Date

	isRegistered: boolean

	isSaved: boolean
}
