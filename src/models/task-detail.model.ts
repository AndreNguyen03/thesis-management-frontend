// Task Detail Models - giống Jira

export type TaskPriority = 'Highest' | 'High' | 'Medium' | 'Low' | 'Lowest'
export const TaskPriority = {
	HIGHEST: 'Highest',
	HIGH: 'High',
	MEDIUM: 'Medium',
	LOW: 'Low',
	LOWEST: 'Lowest'
}

export interface TaskUser {
	_id: string
	fullName: string
	email: string
	avatarUrl?: string
}

export interface FileInfo {
	name: string
	url: string
	size: number
}

export interface TaskComment {
	_id: string
	user: TaskUser
	content: string
	files?: FileInfo[]
	created_at: Date
	updated_at: Date
	editedAt?: Date
}

export interface TaskActivity {
	_id: string
	user: TaskUser
	action: string
	metadata?: any
	created_at: Date
}

export interface TaskDetail {
	_id: string
	groupId: string
	milestoneId?: string
	title: string
	description: string
	status: 'Todo' | 'In Progress' | 'Done'
	priority: TaskPriority
	labels: string[]
	dueDate?: Date
	assignees: TaskUser[]
	comments: TaskComment[]
	activities: TaskActivity[]
	createdBy: TaskUser
	reporter: TaskUser
	created_at: Date
	updated_at: Date
}

// DTOs for API requests
export interface AddCommentPayload {
	content: string
}

export interface UpdateCommentPayload {
	content: string
}

export interface AssignUsersPayload {
	userIds: string[]
}

export interface UpdateDescriptionPayload {
	description: string
}

export interface UpdateTaskDetailPayload {
	title?: string
	description?: string
	priority?: TaskPriority
	labels?: string[]
	dueDate?: string | null
	assignees?: string[]
}
