import { Input } from '@/components/ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui'
import { Search } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useGetSavedTopicsQuery } from '../../../services/topicApi'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import type { Topic } from '@/models'
import { TopicCard } from './TopicCard'
import { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetFieldsQuery } from '@/services/fieldApi'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'

export const SavedTopics = () => {
	const [queries, setQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 8,
		search_by: 'titleVN',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: 'all',
		filter_by: 'fieldIds'
	})
	//lấy đề tài đã lưu
	const { data: savedTopicsData } = useGetSavedTopicsQuery({ queries })
	//Lấy tất cả các fields
	const { data: fields } = useGetFieldsQuery()
	const [topics, setTopics] = useState<Topic[]>([])
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Danh sách đề tài' }, { label: 'Đề tài đã lưu' }])
	useEffect(() => {
		if (JSON.stringify(topics) !== JSON.stringify(savedTopicsData?.data)) {
			setTopics(savedTopicsData ? savedTopicsData.data : [])
			setQueries((prev) => ({
				...prev,
				page: savedTopicsData ? savedTopicsData.meta.currentPage : 1
			}))
		}
	}, [savedTopicsData])

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
			setQueries((prev) => ({ ...prev, filter: fieldId }))
		}
	}
	return (
		<div className='space-y-6 py-4'>
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
					<Select value={queries.filter} onValueChange={setFieldString}>
						<SelectTrigger className='w-full sm:w-[200px]'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value='all'>Tất cả lĩnh vực</SelectItem>
							{fields?.map((field) => (
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
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					{queries.query === '' && queries.filter === 'all' ? (
						<p className='text-md font-bold text-muted-foreground'>Bạn đã lưu {topics.length} đề tài</p>
					) : (
						<p className='text-md font-bold text-muted-foreground'>
							Tìm thấy {topics.length} đề tài có liên quan
						</p>
					)}
				</div>
				<div className='flex flex-col gap-4 align-middle'>
					{topics && topics.length > 0 && (
						<>
							<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
								{topics.map((topic) => (
									<TopicCard key={topic._id} topic={topic} mode='saved' />
								))}
							</div>
							<Pagination>
								<PaginationContent>
									<PaginationItem>
										<PaginationPrevious
											href='#'
											onClick={() =>
												setQueries((prev) => ({ ...prev, page: Math.max(prev.page! - 1, 1) }))
											}
										/>
									</PaginationItem>
									{[...Array(savedTopicsData?.meta.totalPages)].map((_, idx) => (
										<PaginationItem key={idx}>
											<PaginationLink
												isActive={queries.page === idx + 1}
												href='#'
												onClick={() => setQueries((prev) => ({ ...prev, page: idx + 1 }))}
											>
												{idx + 1}
											</PaginationLink>
										</PaginationItem>
									))}
									<PaginationItem>
										<PaginationNext
											href='#'
											onClick={() =>
												setQueries((prev) => ({
													...prev,
													page: Math.min(prev.page! + 1, savedTopicsData?.meta.totalPages!)
												}))
											}
										/>
									</PaginationItem>
								</PaginationContent>
							</Pagination>
						</>
					)}
				</div>
			</div>
		</div>
	)
}
