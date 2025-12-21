import type { GetPaginatedObject } from './paginated-object.model'

export interface Group {
	_id: string
	topicId: string
	titleVN: string
	type: string
	participants: string[]
	lastMessage: {
		content: string
		senderId: string
		createdAt: string
		sender?: {
			_id: string
			fullName: string
		}
	}
	lastSeenAtByUser: Record<string, string>
	unreadCounts: Record<string, number>
	createdAt: string
	updatedAt: string
}


export interface PaginatedGroup extends GetPaginatedObject {
	data: Group[]
}

export interface PaginatedDirectGroup extends GetPaginatedObject {
	data: DirectSidebarGroup[]
}

export interface GroupResponseDto {
	id: string
	topicId?: string
	type: 'direct' | 'group'
	participants: {
		id: string
		fullName: string
		avatarUrl?: string
	}[]
	lastMessage?: {
		content: string
		senderId: string
		createdAt: Date
	}
	unreadCounts: Record<string, number>
	lastSeenAtByUser: Record<string, string>
}

// models/groups.model.ts (hoặc dto/group-response.dto.ts)
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
