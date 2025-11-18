export class PaginationQueryParamsDto {
	limit?: number = 10
	page?: number = 1
	search_by?: string = 'name'
	query?: string
	sort_by?: string = 'startTime'
	sort_order?: string = 'desc'
	startDate?: string
	endDate?: string
}
