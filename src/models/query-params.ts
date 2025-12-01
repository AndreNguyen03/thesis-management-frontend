
export class PaginationQueryParamsDto {
	limit?: number = 10
	page?: number = 1
	search_by?: string
	query?: string
	sort_by?: string
	sort_order?: string
	startDate?: string
	endDate?: string
	filter?: string 
	filter_by?: string
}

export function buildQueryString(params: PaginationQueryParamsDto): string {
	return Object.entries(params)
		.filter(
			([_, value]) => value !== undefined && value !== null && value !== ' ' && value !== ',' && value !== 'all'
		)
		.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`)
		.join('&')
}
