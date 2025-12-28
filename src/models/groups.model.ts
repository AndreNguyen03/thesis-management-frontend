import type { GetPaginatedObject } from './paginated-object.model'

export interface Participant {
	id: string
	fullName: string
	avatarUrl?: string
}

export interface LastMessage {
	content: string
	senderId: string
	fullName?: string
	createdAt: string // ISO string
}

export interface GroupSidebar {
	_id: string
	titleVN: string
	topicId: string
	topicType: string
	type: string
	participants: Participant[]
	lastMessage?: LastMessage
	createdAt: string
	updatedAt: string
	unreadCounts?: Record<string, number>
	lastSeenAtByUser?: Record<string, string>
}

export interface GroupDetail {
	id: string
	topicId: string
	type: 'direct' | 'group'
	participants: Participant[]
	lastMessage?: LastMessage
	unreadCounts?: Record<string, number>
	lastSeenAtByUser?: Record<string, string | null>
	isAbleGoToDefense: boolean
}

export interface PaginatedGroups extends GetPaginatedObject {
	data: GroupSidebar[]
}

export interface PaginatedDirectGroups extends GetPaginatedObject {
	data: DirectSidebarGroup[]
}

export interface DirectSidebarGroup {
	_id: string
	type: 'direct'

	otherUser: {
		_id: string
		fullName: string
		avatarUrl?: string
	}

	lastMessage?: {
		content: string
		createdAt: string
		senderId: string
	}

	unreadCount: number
	updatedAt: string
}

export interface CreateDirectGroupDto {
	targetUserId: string // ID user cần liên hệ (bắt buộc)
	topicId?: string // Optional topicId (nếu chat về topic cụ thể)
}

export interface CreateDirectGroupResponse {
	id: string
	type: 'direct'
	topicId: string | null
}

export interface MessageDto {
	_id: string
	groupId: string
	senderId: {
		_id: string
		fullName: string
		avatarUrl: string
	}
	content: string
	type: 'text' | 'file' | 'image'
	attachments?: string[]
	replyTo?: string | null
	createdAt: string
	status?: 'sending' | 'sent' | 'delivered' | 'seen'
}
