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
import { Skeleton } from '@/components/ui/skeleton'
import { Bookmark } from 'lucide-react'

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
	const { data: savedTopicsData, isLoading, isFetching } = useGetSavedTopicsQuery({ queries })
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

	const totalCount = savedTopicsData?.data?.length ?? 0
	const isSearching = queries.query !== '' || (queries.filter !== undefined && queries.filter[0] !== 'all')

	const shouldShowSummary = totalCount > 0 && !(isSearching && totalCount === 0)

	return (
		<div className='mx-5 h-full w-full space-y-6 pt-10'>
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
			<div className='w-full space-y-4'>
				{shouldShowSummary && (
					<div className='flex w-full items-center justify-between'>
						<p className='text-md font-bold text-muted-foreground'>
							{isSearching
								? `Tìm thấy ${totalCount} đề tài có liên quan`
								: `Bạn đã lưu ${totalCount} đề tài`}
						</p>
					</div>
				)}
				<div className='flex flex-col gap-4 align-middle'>
					{/* Loading */}
					{isLoading || isFetching ? (
						<SavedTopicsSkeleton />
					) : totalCount === 0 ? (
						<SavedTopicsEmptyState isSearching={isSearching} />
					) : (
						<>
							<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
								{savedTopicsData!.data.map((topic) => (
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

const SavedTopicsSkeleton = () => {
	return (
		<div className='mx-5 h-full w-full space-y-6 pt-10'>
			{/* Header */}
			<div className='grid grid-cols-3 items-center space-y-2 rounded-md bg-white px-4 py-4'>
				<Skeleton className='h-8 w-64' />

				<div className='col-span-2 flex flex-col gap-4 sm:flex-row'>
					<Skeleton className='h-10 flex-1' />
					<Skeleton className='h-10 w-[200px]' />
					<Skeleton className='h-10 w-[150px]' />
				</div>
			</div>

			{/* Result info */}
			<Skeleton className='h-5 w-64' />

			{/* Topic cards */}
			<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
				{Array.from({ length: 8 }).map((_, i) => (
					<div key={i} className='space-y-4 rounded-xl border border-border bg-white p-4'>
						<Skeleton className='h-6 w-3/4' />
						<Skeleton className='h-4 w-full' />
						<Skeleton className='h-4 w-5/6' />
						<div className='flex justify-between pt-2'>
							<Skeleton className='h-4 w-24' />
							<Skeleton className='h-8 w-20 rounded-md' />
						</div>
					</div>
				))}
			</div>
		</div>
	)
}

interface Props {
	isSearching?: boolean
}

const SavedTopicsEmptyState = ({ isSearching }: Props) => {
	return (
		<div className='flex flex-col items-center justify-center rounded-xl bg-white py-20 text-center'>
			<div className='mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-secondary'>
				<Bookmark className='h-8 w-8 text-muted-foreground' />
			</div>

			<h3 className='text-lg font-semibold'>
				{isSearching ? 'Không tìm thấy đề tài phù hợp' : 'Bạn chưa lưu đề tài nào'}
			</h3>

			<p className='mt-2 max-w-md text-sm text-muted-foreground'>
				{isSearching
					? 'Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để xem thêm kết quả.'
					: 'Những đề tài bạn lưu sẽ xuất hiện tại đây để bạn dễ dàng theo dõi và quản lý.'}
			</p>
		</div>
	)
}
