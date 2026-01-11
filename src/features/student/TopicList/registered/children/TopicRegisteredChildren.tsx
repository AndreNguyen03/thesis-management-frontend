import { useState } from 'react'
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	Input,
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/components/ui'
import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'
import { Loader2, Search } from 'lucide-react'
import { EmptyStateContainer } from '../EmptyStateContainer'
import { useGetRegisteredTopicQuery } from '@/services/topicApi'
import { TopicRegisteredCard } from '../card/TopicRegisteredCard'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useDebounce } from '@/hooks/useDebounce'
import FieldsCombobox from '@/components/common/combobox/FieldCombobox'
import { CustomPagination } from '@/components/PaginationBar'

export const TopicRegisteredChildren = () => {
	const [queries, setQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 6,
		search_by: ['titleVN', 'titleEng'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'asc',
		filter: undefined,
		filter_by: 'fieldIds'
	})
	//Lấy đề tài đã đăng ký
	const { data: registerTopics, isLoading, isFetching } = useGetRegisteredTopicQuery({ queries })
	//Lấy tất cả các lĩnh vực
	// const { data: fields } = useGetFieldsQuery()
	// // const [cancelRegistration, { isLoading: isCancelling, isSuccess }] = useCancelRegistrationMutation()

	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Danh sách đề tài', path: '/topics' },
		{ label: 'Đề tài đã đăng ký' }
	])
	// Search
	const [searchTerm, setSearchTerm] = useState('')
	const setQuery = (query: string) => {
		setQueries((prev) => ({ ...prev, query }))
	}
	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })
	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	const emptyList = registerTopics?.data.length === 0 && queries.query === ''
	return (
		<div className='flex w-full flex-col justify-center space-y-4'>
			{emptyList ? (
				<EmptyStateContainer type='registered' />
			) : (
				<>
					{/* Search and Filters */}
					<Card className='w-full p-0'>
						<CardHeader>
							<CardTitle className='flex items-center gap-2'>
								<h1 className='text-2xl font-bold text-primary'>Danh sách đề tài bạn đã đăng ký</h1>
							</CardTitle>
						</CardHeader>
						<CardContent className='space-y-4'>
							<div className='flex flex-col gap-4 sm:flex-row'>
								<div className='relative flex-1'>
									<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
									<Input
										placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
										className='pl-10'
										value={searchTerm}
										onChange={(e) => onEdit(e.target.value)}
									/>
								</div>

								<FieldsCombobox
									selectedFields={queries.filter ? queries.filter : []}
									onSelectionChange={(value: string[]) => {
										setQueries((prev) => ({ ...prev, filter: value }))
									}}
								/>
								<Select value={queries.sort_by}>
									<SelectTrigger className='w-full sm:w-[150px]'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='createdAt'>Mới nhất</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</CardContent>
					</Card>
					<div className='flex w-full gap-6'>
						<div className='grid w-full grid-cols-1 gap-6 lg:grid-cols-2'>
							{isLoading || isFetching ? (
								// Loader khi đang fetch dữ liệu
								<div className='col-span-2 flex h-64 w-full items-center justify-center'>
									<div className='flex flex-col items-center'>
										<Loader2 className='h-16 w-16 animate-spin text-primary' />
										<p className='mt-3 text-sm text-muted-foreground'>
											Đang tải đề tài đã đăng ký...
										</p>
									</div>
								</div>
							) : registerTopics?.data.length === 0 ? (
								// Empty state khi không có dữ liệu (kể cả search)
								<div className='col-span-2 flex h-64 w-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50'>
									<p className='text-center text-gray-500'>
										{queries.query
											? `Không tìm thấy đề tài nào có liên quan tới "${queries.query}"`
											: 'Bạn chưa đăng ký đề tài nào'}
									</p>
								</div>
							) : (
								// Hiển thị danh sách đề tài
								registerTopics?.data.map((topic) => (
									<TopicRegisteredCard key={topic._id} topic={topic} />
								))
							)}
						</div>
					</div>
					{registerTopics?.meta && registerTopics?.meta.totalPages > 1 && (
						<CustomPagination
							meta={registerTopics?.meta}
							onPageChange={(p) => setQueries((prev) => ({ ...prev, page: p }))}
						/>
					)}
				</>
			)}
		</div>
	)
}
