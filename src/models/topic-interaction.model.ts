export type TopicInteractionAction = 'view' | 'click' | 'bookmark' | 'register'

export interface TopicInteractionRequest {
	topicId: string
	action: TopicInteractionAction
}
