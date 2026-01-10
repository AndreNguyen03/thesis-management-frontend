export interface GetChatbotVerDto {
	_id: string
	name: string
	description: string
	status: "enabled" | "disabled"
	query_suggestions: GetQuerySuggestionDto[]
	createdAt: Date
	updatedAt: Date
	avatarUrl?: string
}

export interface GetQuerySuggestionDto {
	_id: string
	content: string
	enabled: boolean
}
