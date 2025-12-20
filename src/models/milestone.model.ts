export type MilestoneStatus = 'Todo' | 'In Progress' | 'Pending Review' | 'Completed' | 'Needs Revision' | 'Overdue'
export const MilestoneStatusOptions = {
	TODO: 'Todo',
	IN_PROGRESS: 'In Progress',
	PENDING_REVIEW: 'Pending Review',
	COMPLETED: 'Completed',
	NEEDS_REVISION: 'Needs Revision',
	OVERDUE: 'Overdue'
} as const
export type MilestoneType = 'STANDARD' | 'STRICT'
export interface FileInfo {
	name: string
	url: string
	size: number
}
export interface Submission {
	date: string
	files: FileInfo[]
}
export interface TaskDto {
	_id: string
	groupId: string
	milestoneId: string
	title: string
	description: string
	isDeleted: boolean
	status: string
}
export interface ResponseMilestone {
	_id: string
	groupId: string
	title: string
	description: string
	dueDate: string
	type: MilestoneType
	status: MilestoneStatus
	submission: Submission
	submissionHistory: Submission[]
	tasks?: TaskDto[]
	progress: number
	isCompleted: boolean
}

export interface PayloadCreateMilestone {
	groupId: string
	title: string
	description: string
	dueDate: string
	type: MilestoneType
}

export interface PayloadUpdateMilestone {
	title: string
	description: string
	dueDate: string
}

export interface UploadReportPayload {
	title: string
	description: string
	dueDate: string
}
