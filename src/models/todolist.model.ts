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

export interface Task {
	_id: string
	groupId: string
	title: string
	description: string
	columns: TaskColumn[]
}

export interface CreateTaskPayload {
	groupId: string
	title: string
	description?: string
	//columns: TaskColumn[]
}
export interface RequestUpdate {
	title: string
	description: string
}
