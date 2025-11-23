import { getColumns } from './Columns'
import { useGetSubmittedTopicsQuery } from '@/services/topicApi'
import { DataTable } from './DataTable'
import { useNavigate } from 'react-router-dom'
import { Button, Input } from '@/components/ui'
import { Loader2, Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'

const ManageSubmittedTopics = () => {
	const navigate = useNavigate()

	const [queries, setQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 8,
		search_by: 'titleVN,titleEng,lecturerName',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: 'all',
		filter_by: 'fieldIds'
	})
	const { data: submittedTopics, refetch, isLoading } = useGetSubmittedTopicsQuery(queries)
	console.log('Submitted Topics Data:', isLoading)
	const [topics, setTopics] = useState(submittedTopics ? submittedTopics.data : [])
	// search input handler
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
	useEffect(() => {
		if (JSON.stringify(submittedTopics) !== JSON.stringify(submittedTopics?.data)) {
			setTopics(submittedTopics ? submittedTopics.data : [])
			setQueries((prev) => ({
				...prev,
				page: submittedTopics ? submittedTopics.meta.currentPage : 1
			}))
		}
	}, [submittedTopics])
	return (
		<div className='h-screen'>
			<div className='relative flex flex-1 items-center'>
				<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
				<Input
					placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
					className='pl-10'
					value={searchTerm}
					onChange={(e) => onEdit(e.target.value)}
				/>
			</div>
			<Button onClick={() => refetch()}> {isLoading && <Loader2 />}Tải lại trang</Button>
			<DataTable columns={columns} data={data} isLoading={isLoading} />
		</div>
	)
}

export default ManageSubmittedTopics
