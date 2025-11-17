export interface GetChatbotVerDto {
	_id: string
	name: string
	description: string
	status: string
	query_suggestions: GetQuerySuggestionDto[]
	query_unenable_suggestions: GetQuerySuggestionDto[]
	createdAt: Date
	updatedAt: Date
}

export interface GetQuerySuggestionDto {
	_id: string
	content: string
	enabled: boolean
}
