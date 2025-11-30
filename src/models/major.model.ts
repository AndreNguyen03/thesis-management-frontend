import type { GetPaginatedObject } from './paginated-object.model'

export interface GetMajorMiniDto {
	_id: string
	name: string
	facultyId: string
}

export interface PaginatedMajor extends GetPaginatedObject {
	data: GetMajorMiniDto[]
}
