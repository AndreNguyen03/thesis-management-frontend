import type { is } from 'date-fns/locale'

export interface Subtask {
	_id: string
	title: string // VD: "Nghiên cứu UI/UX"
	isCompleted: boolean
}

export interface TaskColumn {
	_id: string
	title: 'Todo' | 'In Progress' | 'Done'
	color: string // Màu nền cột
	items: Subtask[]
}

export interface MilestoneDto {
	_id: string
	groupId: string
	title: string
	description: string
	dueDate: Date
}

export interface Task {
	_id: string
	groupId: string
	title: string
	description: string
	columns: TaskColumn[]
	status: 'Todo' | 'In Progress' | 'Done'
	milestone: MilestoneDto
}

export interface CreateTaskPayload {
	groupId: string
	title: string
	milestoneId?: string
	description?: string
	//columns: TaskColumn[]
}
export interface RequestUpdate {
	title: string
	description?: string
}

export const StatusOptions = {
	TODO: 'Todo',
	IN_PROGRESS: 'In Progress',
	DONE: 'Done'
} as const
