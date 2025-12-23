import type { PaginatedResponse } from './api'

export interface GetFieldNameReponseDto {
	_id: string
	name: string
	slug: string
}

export interface CreateFieldDto {
	name: string
	slug: string
	description: string
}

export interface PaginatedFieldNames extends PaginatedResponse<GetFieldNameReponseDto> {}
