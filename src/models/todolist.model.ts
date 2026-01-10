import type { is } from 'date-fns/locale'
import type { TaskActivity, TaskComment } from './task-detail.model'

export type TaskPriority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest'

export interface FileInfo {
	name: string
	url: string
	size: number
}

export interface Subtask {
	_id: string
	title: string
	isCompleted: boolean
	description?: string
	assignees?: UserInfo[]
	priority?: TaskPriority
	labels?: string[]
	dueDate?: Date
	comments?: TaskComment[]
	activities?: TaskActivity[]
	reporter?: UserInfo
	created_at?: Date
	updated_at?: Date
}

export interface UpdatePayload {
	title?: string
	description?: string
	assignees?: string[]
	priority?: string
	labels?: string[]
	dueDate?: string | null
	reporter?: string | null
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

export const taskPriorityLabels = {
	Lowest: { name: 'Thấp nhất', css: 'bg-gray-200 text-gray-800' },
	Low: { name: 'Thấp', css: 'bg-blue-200 text-blue-800' },
	Medium: { name: 'Trung bình', css: 'bg-yellow-200 text-yellow-800' },
	High: { name: 'Cao', css: 'bg-orange-200 text-orange-800' },
	Highest: { name: 'Cao nhất', css: 'bg-red-200 text-red-800' }
} as const
