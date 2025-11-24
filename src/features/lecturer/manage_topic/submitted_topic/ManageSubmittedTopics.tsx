import { getColumns } from './Columns'
import { useGetSubmittedTopicsQuery } from '@/services/topicApi'
import { DataTable } from './DataTable'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { Loader2, RotateCw, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'
import { CustomPagination } from '@/components/PaginationBar'

const ManageSubmittedTopics = () => {
	const navigate = useNavigate()

	const [queries, setQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 1,
		search_by: 'titleVN,titleEng,lecturerName',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: 'all',
		filter_by: 'fieldIds'
	})
	const { data: submittedTopics, refetch, isLoading } = useGetSubmittedTopicsQuery(queries)
	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueries((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}
	const columns = getColumns({ onSeeDetail: (topicId) => navigate(`/detail-topic/${topicId}`) })
	const data =
		submittedTopics?.data.map((topic, index) => ({
			...topic,
			index: index + 1
		})) || []
	return (
		<div className='flex flex-col gap-2'>
			<div className='relative flex flex-1 items-center gap-5'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
				<Input
					placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
					className='pl-10'
					value={searchTerm}
					onChange={(e) => onEdit(e.target.value)}
				/>
				<Button onClick={() => refetch()}>
					{' '}
					{isLoading ? <Loader2 className='h-4 w-4 animate-spin' /> : <RotateCw className='h-4 w-4' />} Tải
					lại trang
				</Button>
			</div>
			<DataTable columns={columns} data={data} isLoading={isLoading} />
			{submittedTopics?.meta && submittedTopics.meta.totalPages > 1 && (
				<CustomPagination
					meta={submittedTopics.meta}
					onPageChange={(p) => setQueries((prev) => ({ ...prev, page: p }))}
				/>
			)}
		</div>
	)
}

export default ManageSubmittedTopics
