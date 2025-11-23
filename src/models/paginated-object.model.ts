export interface MetaDto {
	itemsPerPage: number
	totalItems: number
	currentPage: number
	totalPages: number
}
interface LinkDto {
	first: string
	previous: string
	current: string
	next: string
	last: string
}

export interface GetPaginatedObject {
	meta: MetaDto
}
