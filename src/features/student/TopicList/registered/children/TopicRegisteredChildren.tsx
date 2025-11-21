import { useEffect, useState } from 'react'
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
import { Search } from 'lucide-react'
import { EmptyStateContainer } from '../EmptyStateContainer'
import { useGetRegisteredTopicQuery } from '@/services/topicApi'
import { TopicRegisteredCard } from '../card/TopicRegisteredCard'
import type { Topic } from '@/models'
import type { PaginationQueryParamsDto } from '@/models/query-params'
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
export const TopicRegisteredChildren = () => {
	const [queries, setQueries] = useState<PaginationQueryParamsDto>({
		page: 1,
		limit: 10,
		search_by: 'titleVN',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		filter: 'all',
		filter_by: 'fieldIds'
	})
	//Lấy đề tài đã đăng ký
	const { data: topicData } = useGetRegisteredTopicQuery({ queries })
	//Lấy tất cả các lĩnh vực
	const { data: fields } = useGetFieldsQuery()

	const [registerTopics, setRegisteredTopics] = useState<Topic[]>()
	// // const [cancelRegistration, { isLoading: isCancelling, isSuccess }] = useCancelRegistrationMutation()
	useEffect(() => {
		if (JSON.stringify(registerTopics) !== JSON.stringify(topicData?.data)) {
			setRegisteredTopics(topicData?.data)
		}
	}, [topicData])

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
	// Sự kiện chọn theo lĩnh vực
	//Set nội dung cho filter
	const setFieldString = (fieldId: string) => {
		if (fieldId === 'none') {
			setQueries((prev) => ({ ...prev, filter: undefined }))
		} else {
			setQueries((prev) => ({ ...prev, filter: fieldId }))
		}
	}
	const emptyList = registerTopics?.length === 0 && queries.query === '' && queries.filter === 'all'
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
						<div className='grid grid-cols-1 gap-6 lg:grid-cols-1'>
							{registerTopics && registerTopics?.length > 0 ? (
								<>
									{registerTopics?.map((topic) => (
										<TopicRegisteredCard key={topic._id} topic={topic} />
									))}
									
								</>
							) : (
								<>
									{' '}
									{queries.query === '' ? (
										<span>{`Tìm thấy ${registerTopics?.length} đề tài liên quan`}</span>
									) : (
										<span>{`Không tìm thấy đề tài nào có liên quan tới "${queries.query}"`}</span>
									)}
								</>
							)}
						</div>
					</div>
				</>
			)}
		</div>
	)
}
