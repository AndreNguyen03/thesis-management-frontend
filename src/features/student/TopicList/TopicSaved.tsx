import { Input } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui'
import { Search } from 'lucide-react'
import { useState } from 'react'
import { useGetSavedTopicsQuery } from '../../../services/topicApi'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { TopicCard } from './TopicCard'
import { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetFieldsQuery } from '@/services/fieldApi'
import { CustomPagination } from '@/components/PaginationBar'

export const SavedTopics = () => {
	const [queries, setQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 8,
		search_by: ['titleVN', 'titleEng'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: undefined,
		filter_by: 'fieldIds'
	})
	//lấy đề tài đã lưu
	const { data: savedTopicsData } = useGetSavedTopicsQuery({ queries })
	//Lấy tất cả các fields
	const { data: fields } = useGetFieldsQuery({
		page: 1,
		limit: 0,
		sort_by: 'createdAt',
		sort_order: 'desc'
	})

	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Danh sách đề tài' }, { label: 'Đề tài đã lưu' }])

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
	// Sự kiện chọn theo lĩnh vực
	//Set nội dung cho filter
	const setFieldString = (fieldId: string) => {
		if (fieldId === 'none') {
			setQueries((prev) => ({ ...prev, filter: undefined }))
		} else {
			setQueries((prev) => ({ ...prev, filter: [fieldId] }))
		}
	}
	return (
		<div className='space-y-6 py-4 w-full mx-10'>
			<div className='grid grid-cols-3 items-center space-y-2 rounded-md bg-white px-4'>
				{/* Header */}

				<h1 className='col-span-1 w-fit text-2xl font-bold text-primary'>Danh sách đề tài bạn đã lưu</h1>
				{/* Search and Filters */}

				<div className='col-span-2 flex w-full flex-col gap-4 p-2 sm:flex-row sm:items-center'>
					<div className='relative flex flex-1 items-center'>
						<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
						<Input
							placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
							className='pl-10'
							value={searchTerm}
							onChange={(e) => onEdit(e.target.value)}
						/>
					</div>
					<Select value={queries.filter ? queries.filter[0] : 'all'} onValueChange={setFieldString}>
						<SelectTrigger className='w-full sm:w-[200px]'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả lĩnh vực</SelectItem>
							{fields?.data?.map((field) => (
								<SelectItem key={field._id} value={field._id}>
									{field.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<Select
						value={queries.sort_by}
						onValueChange={(value) => setQueries((prev) => ({ ...prev, sort_by: value }))}
					>
						<SelectTrigger className='w-full sm:w-[150px]'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='createdAt'>Mới nhất</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Results */}
			<div className='space-y-4 w-full'>
				<div className='flex items-center justify-between w-full'>
					{queries.query === '' && (queries.filter === undefined || queries.filter[0] === 'all') ? (
						<p className='text-md font-bold text-muted-foreground'>
							Bạn đã lưu {savedTopicsData?.data.length} đề tài
						</p>
					) : (
						<p className='text-md font-bold text-muted-foreground'>
							Tìm thấy {savedTopicsData?.data.length} đề tài có liên quan
						</p>
					)}
				</div>
				<div className='flex flex-col gap-4 align-middle'>
					{savedTopicsData?.data && savedTopicsData.data.length > 0 && (
						<>
							<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
								{savedTopicsData.data.map((topic) => (
									<TopicCard key={topic._id} topic={topic} mode='saved' />
								))}
							</div>
							{savedTopicsData?.meta && savedTopicsData.meta.totalPages > 1 && (
								<CustomPagination
									meta={savedTopicsData.meta}
									onPageChange={(p) => setQueries((prev) => ({ ...prev, page: p }))}
								/>
							)}
						</>
					)}
				</div>
			</div>
		</div>
	)
}
