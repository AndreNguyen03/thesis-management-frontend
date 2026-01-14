import type { PaginationQueryParamsDto } from './query-params'

export interface RequestGetTopicsInAdvanceSearch extends PaginationQueryParamsDto {
	//100 là search semanticx
	//nếu là 0 thì search mặc định
	rulesPagination?: number
	status?: string
	lecturerIds?: string[]
	fieldIds?: string[]
	queryStatus?: string[]
	majorIds?: string[]
	year?: string | number
}
