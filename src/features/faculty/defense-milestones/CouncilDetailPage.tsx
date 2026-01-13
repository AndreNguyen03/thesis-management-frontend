import { useEffect, useState } from 'react'
import { useParams, useNavigate, useSearchParams } from 'react-router-dom'
import {
	useGetCouncilByIdQuery,
	useUpdateTopicOrderMutation,
	useRemoveTopicFromCouncilMutation
} from '@/services/defenseCouncilApi'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Calendar, MapPin, Users, Loader2, AlertCircle, Goal, ArrowLeft, ArrowRight } from 'lucide-react'
import { toast } from 'sonner'
import TopicsInCouncilTable from './components/TopicsInCouncilTable'
import AddTopicDialog from './components/AddTopicDialog'
import CouncilHeader from './components/CouncilHeade'
import { useGetDefenseMilestoneDetailByIdQuery } from '@/services/milestoneApi'
import AwaitingTopicTable from './datatable/AwaitingTopicTable'
import type { PaginationQueryParamsDto } from '@/models/query-params'
import { useGetTopicsAwaitingEvaluationInPeriodQuery } from '@/services/topicApi'
import { useDebounce } from '@/hooks/useDebounce'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui'
import type { GetTopicsInBatchMilestoneDto } from '@/models/milestone.model'
import { se } from 'date-fns/locale'
export default function CouncilDetailPage() {
	const { councilId, periodId, templateId } = useParams<{ councilId: string; periodId: string; templateId: string }>()
	const [selectedTopics, setSelectedTopics] = useState<GetTopicsInBatchMilestoneDto[]>([])
	const navigate = useNavigate()
	const [searchParams, setSearchParams] = useSearchParams()
	const [isAddTopicOpen, setIsAddTopicOpen] = useState(false)
	const [isShowAwaitingTopicsList, setIsShowAwaitingTopicsList] = useState(false)
	//endpoint lấy chi tiết hội đồng bảo vệ
	const { data: council, isLoading, error } = useGetCouncilByIdQuery(councilId!)
	//enpoitn lấy thông tin đợt bảo vệ
	const { data: defenseMilestoneDetail } = useGetDefenseMilestoneDetailByIdQuery(
		{ milestoneTemplateId: templateId || '' },
		{ skip: !templateId }
	)
	const [isChosingMode, setIsChosingMode] = useState(false)
	const [topicQueries, setTopicQueries] = useState<PaginationQueryParamsDto>({
		limit: 15,
		page: 1,
		query: '',
		search_by: ['titleVN', 'titleEng', 'students.fullName']
	})
	useEffect(() => {
		setIsShowAwaitingTopicsList(searchParams.get('IsShowAwaitingTopics') === '1')
		setIsAddTopicOpen(searchParams.get('addTopic') === '1')
		
	}, [searchParams, periodId, templateId])
	const {
		data: paginationTopicData,
		isLoading: isLoadingTopics,
		refetch: refetchAwaitingTopics
	} = useGetTopicsAwaitingEvaluationInPeriodQuery({
		periodId: periodId!,
		queryParams: topicQueries,
		milestoneId: templateId
	})

	const [searchTerm, setSearchTerm] = useState('')

	const setQuery = (query: string) => {
		setTopicQueries((prev) => ({ ...prev, query }))
	}

	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })

	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}
	const [updateTopicOrder] = useUpdateTopicOrderMutation()
	const [removeTopic] = useRemoveTopicFromCouncilMutation()
	const handleReorderTopics = async (topicId: string, newOrder: number) => {
		if (!councilId) return
		try {
			await updateTopicOrder({ councilId, topicId, defenseOrder: newOrder }).unwrap()
			toast.success('Cập nhật thứ tự bảo vệ thành công')
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}
	// State filter for awaiting topics
	const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'blocked' | 'pending' | 'completed'>('all')
	// Filtered topics for AwaitingTopicTable
	const filteredAwaitingTopics =
		paginationTopicData?.data?.filter((topic: any) => {
			if (statusFilter === 'all') return true
			if (statusFilter === 'pending') return !topic.isPublished && !topic.isBlocked && !topic.isCompleted
			if (statusFilter === 'published') return topic.isPublished
			if (statusFilter === 'blocked') return topic.isBlocked
			if (statusFilter === 'completed') return topic.isCompleted
			return true
		}) || []
	const handleRemoveTopic = async (topicId: string) => {
		if (!councilId) return
		try {
			await removeTopic({ councilId, topicId }).unwrap()
			toast.success('Xóa đề tài khỏi hội đồng thành công')
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}
	const updateSelectedTopicsInUrl = (topics: GetTopicsInBatchMilestoneDto[]) => {
		const ids = topics.map((t) => t._id).join(',')
		setSearchParams({ ...Object.fromEntries(searchParams), selected: ids })
		setSelectedTopics(topics)
	}

	useEffect(() => {
		const selectedIds = (searchParams.get('selected') || '').split(',').filter(Boolean)
		if (paginationTopicData?.data) {
			const topics = paginationTopicData.data.filter((t) => selectedIds.includes(t._id))
			setSelectedTopics(topics)
		}
	}, [searchParams, paginationTopicData])
	const handleResetSelectedTopicsInUrl = () => {
		setIsChosingMode(false)
		setSelectedTopics([])
		setSearchParams({ ...Object.fromEntries(searchParams), addTopic: '0', IsShowAwaitingTopics: '0', selected: '' })
	}
	if (isLoading) {
		return (
			<div className='flex h-full w-full items-center justify-center'>
				<Loader2 className='h-8 w-8 animate-spin text-primary' />
			</div>
		)
	}

	if (error || !council) {
		return (
			<div className='flex h-screen items-center justify-center'>
				<div className='text-center'>
					<AlertCircle className='mx-auto h-12 w-12 text-red-500' />
					<h3 className='mt-4 text-lg font-semibold'>Không tìm thấy hội đồng</h3>
					<p className='mt-2 text-sm text-muted-foreground'>
						Hội đồng không tồn tại hoặc bạn không có quyền truy cập
					</p>
					<Button className='mt-4' onClick={() => navigate(-1)}>
						Quay lại
					</Button>
				</div>
			</div>
		)
	}

	return (
		<div className='container mx-auto space-y-6 p-6'>
			{/* Header */}
			<CouncilHeader council={council} />

			{/* Council Info Card */}
			<Card className='p-1'>
				<CardHeader>
					<CardTitle>Thông tin hội đồng</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='grid gap-4 md:grid-cols-3'>
						<div className='flex items-center gap-3'>
							<Calendar className='h-5 w-5 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Thời gian</p>
								<p className='font-medium'>
									{new Date(council.scheduledDate).toLocaleString('vi-VN', {
										weekday: 'long',
										year: 'numeric',
										month: 'long',
										day: 'numeric',
										hour: '2-digit',
										minute: '2-digit'
									})}
								</p>
							</div>
						</div>
						<div className='flex items-center gap-3'>
							<MapPin className='h-5 w-5 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Địa điểm</p>
								<p className='font-medium'>{council.location}</p>
							</div>
						</div>
						<div className='flex items-center gap-3'>
							<Users className='h-5 w-5 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Số đề tài</p>
								<p className='font-medium'>{council.topics?.length || 0} đề tài</p>
							</div>
						</div>
						<div className='flex items-center gap-3'>
							<Goal className='h-5 w-5 text-muted-foreground' />
							<div>
								<p className='text-sm text-muted-foreground'>Đợt bảo vệ</p>
								<span className='text-[18px] font-semibold text-blue-700'>
									{defenseMilestoneDetail?.title}
								</span>
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Topics Table */}
			<Card className='p-1'>
				<div className='relative'>
					<div
						className={cn(
							'left-0 top-0 z-20 h-full w-full transition-transform duration-500 ease-in-out',
							!isShowAwaitingTopicsList ? 'translate-x-0' : 'absolute -translate-x-full opacity-0'
						)}
					>
						<CardHeader className='flex flex-row items-center justify-between pb-2'>
							<CardTitle>Danh sách đề tài ({council.topics?.length || 0})</CardTitle>
							<Button
								onClick={() => {
									setIsShowAwaitingTopicsList(true)
									setSearchParams({ ...Object.fromEntries(searchParams), IsShowAwaitingTopics: '1' })
								}}
								variant='outline'
								className={cn('mt-0')}
							>
								<ArrowLeft />
								Thêm từ ({paginationTopicData?.meta?.totalItems || 0}) đề tài đang chờ
							</Button>
						</CardHeader>
						<CardContent>
							{council.topics && council.topics.length > 0 ? (
								<TopicsInCouncilTable
									topics={council.topics}
									onReorder={handleReorderTopics}
									onRemove={handleRemoveTopic}
									councilId={councilId!}
								/>
							) : (
								<div className='py-12 text-center text-muted-foreground'>
									<p>Chưa có đề tài nào được phân công</p>
								</div>
							)}
						</CardContent>
					</div>
					<div
						className={cn(
							'right-0 top-0 z-20 mt-5 h-full w-full transition-transform duration-500 ease-in-out',
							isShowAwaitingTopicsList ? 'translate-x-0' : 'absolute translate-x-full opacity-0'
						)}
					>
						<CardContent>
							<div className='flex flex-col justify-between gap-4 py-2 sm:flex-col'>
								<div className='flex items-center gap-4'>
									<Button
										onClick={() => {
											setIsShowAwaitingTopicsList(false)
											setSearchParams({
												...Object.fromEntries(searchParams),
												IsShowAwaitingTopics: '0'
											})
										}}
										variant='outline'
									>
										DS đề tài ({council.topics?.length || 0}) trong hội đồng
										<ArrowRight />
									</Button>
									<h2 className='text-[18px] font-semibold'>
										Đề tài chờ đánh giá ({paginationTopicData?.data.length || 0})
									</h2>
								</div>
								<div className='flex items-center justify-between gap-4'>
									<Input
										placeholder='Tìm kiếm đề tài, sinh viên...'
										value={searchTerm}
										onChange={(e) => onEdit(e.target.value)}
										className='w-[400px] border-gray-300 bg-white'
									/>
									{!isChosingMode && (
										<Button className='h-fit' onClick={() => setIsChosingMode(true)}>
											Chọn đề tài
										</Button>
									)}

									{isChosingMode && (
										<div className='flex gap-2'>
											<Button
												className='h-fit bg-orange-400'
												onClick={() => {
													setIsChosingMode(false)
													setSelectedTopics([])
												}}
											>
												Bỏ chọn
											</Button>
											<Button
												className='h-fit disabled:bg-gray-500'
												disabled={isLoadingTopics || selectedTopics.length === 0}
												onClick={() => {
													setIsAddTopicOpen(true)
													setSearchParams({
														...Object.fromEntries(searchParams),
														addTopic: '1'
													})
												}}
											>
												Phân công ({selectedTopics.length})
											</Button>
										</div>
									)}
								</div>
							</div>

							<AwaitingTopicTable
								isChosingMode={isChosingMode}
								isLoadingTopics={isLoadingTopics}
								error={error}
								paginationTopicData={
									paginationTopicData
										? {
												...paginationTopicData,
												data: filteredAwaitingTopics,
												meta: paginationTopicData.meta!
											}
										: undefined
								}
								setQuery={setTopicQueries}
								selectedTopics={selectedTopics}
								setSelectedTopics={(id: string) => {
									const selectedTopic = paginationTopicData?.data.find((topic) => topic._id === id)
									if (!selectedTopic) return
									setSelectedTopics((prev) => {
										if (prev.some((topic) => topic._id === id)) {
											const newSelectedTopics = prev.filter((topic) => topic._id !== id)
											updateSelectedTopicsInUrl(newSelectedTopics)
											return newSelectedTopics
										} else {
											const newSelectedTopics = [...prev, selectedTopic]
											updateSelectedTopicsInUrl(newSelectedTopics)
											return newSelectedTopics
										}
									})
								}}
							/>
						</CardContent>
					</div>
				</div>
			</Card>

			{/* Add Topic Dialog */}
			<AddTopicDialog
				open={isAddTopicOpen}
				onOpenChange={(open) => {
					setIsAddTopicOpen(open)
					setSearchParams({ ...Object.fromEntries(searchParams), addTopic: open ? '1' : '0' })
				}}
				councilId={councilId!}
				periodId={periodId!}
				chosenTopics={selectedTopics}
				onRemoveTopic={(topicId: string) => {
					setSelectedTopics((prev) => prev.filter((topic) => topic._id !== topicId))
				}}
				onReset={handleResetSelectedTopicsInUrl}
				totalInCouncilNum={council.topics.length}
			/>
		</div>
	)
}
