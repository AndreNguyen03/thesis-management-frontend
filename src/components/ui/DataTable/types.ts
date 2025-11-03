/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from 'react'
export type SortOrder = 'asc' | 'desc'
export interface QueryParams {
	page: number
	page_size: number
	search_by: string
	query: string
	sort_by: string
	sort_order: SortOrder
}
export interface SearchValue {
	value: string
	date?: Date
}
export interface TableColumn<T> {
	key: keyof T
	title: string
	sortable?: boolean
	searchable?: boolean
    
	render?: (value: any, row: T) => ReactNode
	renderSearchInput?: (params: {
		value: SearchValue
		onChange: (value: SearchValue) => void
		placeholder?: string
	}) => ReactNode
}
export interface TableAction<T> {
	icon: ReactNode
	label: string
	onClick?: (row: T) => void
	href?: (row: T) => string
	variant?: 'default' | 'destructive' | 'outline'
	disabled?: (row: T) => boolean
	asChild?: boolean
}
export interface DataTableProps<T> {
	data: T[]
	columns: TableColumn<T>[]
	actions?: TableAction<T>[]
	isLoading?: boolean
	error?: Error | null
	totalRecords?: number
	pageSize?: number
	searchFields?: Record<string, string>
	onQueryChange: (params: QueryParams) => void
	emptyState?: { title: string; description: string }
	toolbar?: ReactNode
}
