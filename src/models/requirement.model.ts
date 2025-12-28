import type { GetPaginatedObject } from './paginated-object.model'

export interface GetRequirementNameReponseDto {
	_id: string
	name: string
	slug: string
}

export interface PaginatedRequirement extends GetPaginatedObject {
	data: GetRequirementNameReponseDto[]
}

export interface CreateRequirementDto {
	name: string
	slug: string
	description: string
}
