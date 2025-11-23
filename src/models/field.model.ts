import type { PaginatedResponse } from "./api"

export interface GetFieldNameReponseDto {
	_id: string
	name: string
	slug: string
}
export interface PaginatedFieldNames extends PaginatedResponse<GetFieldNameReponseDto> {
}
