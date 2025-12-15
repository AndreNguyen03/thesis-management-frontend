import type { GetPaginatedObject } from './paginated-object.model'

export interface Group {
	_id: string
	topicId: string
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
	topic: {
		_id: string
		titleVN: string
		type: string
	}
	lastSeenAtByUser: Record<string, string>
	unreadCounts: Record<string, number>
	createdAt: string
	updatedAt: string
}

export interface PaginatedGroup extends GetPaginatedObject {
	data: Group[]
}

export interface GroupResponseDto {
	id: string
	topicId: string
	type: 'direct' | 'group'
	participants: {
		id: string
		fullName: string
		avatarUrl: string
	}[]
	lastMessage?: {
		content: string
		senderId: string
		createdAt: Date
	}
	unreadCounts: Record<string, number>
	lastSeenAtByUser: Record<string, string>
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