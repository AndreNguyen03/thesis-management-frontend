export type ApiError = {
	status?: number
	data?: {
		message: string
		errorCode?: string
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		[key: string]: any
	}
}

export type PaginatedResponse<T> = {
	data: T[]
	meta: {
		itemsPerPage: number
		totalItems: number
		currentPage: number
		totalPages: number
	}
}
