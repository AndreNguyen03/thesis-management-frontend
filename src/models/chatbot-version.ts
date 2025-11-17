export interface GetChatbotVerDto {
	_id: string
	name: string
	description: string
	status: string
	query_suggestions: GetQuerySuggestionDto[] 
	updatedAt: Date
}

export interface GetQuerySuggestionDto {
	_id: string
	content: string
}
