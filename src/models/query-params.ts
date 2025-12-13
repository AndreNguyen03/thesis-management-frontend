export type SortOrder = 'asc' | 'desc'
export class PaginationQueryParamsDto {
	limit?: number = 10
	page?: number = 1
	search_by?: string[]
	query?: string
	sort_by?: string
	sort_order?: SortOrder
	startDate?: string
	endDate?: string
	filter?: string
	filter_by?: string
}

export const buildQueryString = (params: Record<string, any>): string => {
	return Object.entries(params)
		.filter(([_, value]) => value !== undefined && value !== null && value !== '' && value !== 'all')
		.flatMap(([key, value]) => {
			if (Array.isArray(value)) {
				return value
					.filter((v) => v !== undefined && v !== null && v !== '')
					.map((v) => `${encodeURIComponent(key)}[]=${encodeURIComponent(v)}`)
			}
			return [`${encodeURIComponent(key)}=${encodeURIComponent(value)}`]
		})
		.join('&')
}
