import type { IRegistration } from "./registration.model"

export interface Topic {
	_id: string

	title: string

	description: string

	type: string

	createBy: string

	status: string

	major: string

	lecturerNames: string[]

	requirementNames: string[]

	fieldNames: string[]

	studentNames: string[]

	maxStudents: number

	deadline: Date

	createdAt: Date

	updatedAt: Date

	isRegistered: boolean

	isSaved: boolean
}

export interface CanceledRegisteredTopic extends Topic {
	lastestCanceledRegisteredAt: Date
}
export interface ITopicDetail extends Topic {
	allUserRegistrations: IRegistration[] // mới chỉ là các đăng ký của người dùng với topic
}
