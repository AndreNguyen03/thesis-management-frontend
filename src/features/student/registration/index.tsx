import { useState, useCallback } from 'react'
import { FilterBar } from './topics/FilterBar'
import { TopicListItem } from './topics/TopicListItem'
import { TopicDetailPanel } from './topics/TopicDetailPanel'
import { SkeletonLoader } from './topics/SkeletonLoader'
import { EmptyState } from './topics/EmptyState'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { List, FileCheck } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { usePageBreadcrumb } from '@/hooks'
import { CurrentTime } from './topics/CurrentTime'
import type { FilterState, RegistrationPeriod, RegisteredTopic } from './types'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'
import type {
    ApiError,
	GeneralTopic,
	GetFieldNameReponseDto,
	PaginationTopicsQueryParams,
	ResponseMiniLecturerDto
} from '@/models'
import { useGetTopicsInPhaseQuery } from '@/services/topicApi'
import { useAppSelector } from '@/store'
import { PeriodPhaseName } from '@/models/period.model'
import { getPeriodTitle } from '@/utils/utils'
import { useCreateRegistrationMutation, useLeaveTopicMutation } from '@/services/registrationApi'
import { LoadingState } from '@/components/ui/LoadingState'

export default function TopicRegistration() {
	// ------------------ SHARED STATE ------------------
	const currentPeriod = useAppSelector((state) => state.period.currentPeriod)

	const [queryParams, setQueryParams] = useState<PaginationTopicsQueryParams>({
		page: 1,
		limit: 10,
		search_by: 'titleVN,titleEng',
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		status: 'all',
		rulesPagination: 99,
		lecturerIds: [],
		fieldIds: [],
		queryStatus: [],
		phase: PeriodPhaseName.OPEN_REGISTRATION
	})

	const [selectedTopic, setSelectedTopic] = useState<GeneralTopic | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [activeTab, setActiveTab] = useState<'list' | 'registered'>('list')
	const [registeredTopic, setRegisteredTopic] = useState<GeneralTopic | null>(null)

	// ------------------ REGISTRATION MUTATIONS ------------------
	const [createRegistration] = useCreateRegistrationMutation()
	const [leaveTopic] = useLeaveTopicMutation()

	// ------------------ QUERY HOOK ------------------
	const { data: paginated, isLoading: isLoadingTopics } = useGetTopicsInPhaseQuery(
		{
			periodId: currentPeriod!._id,
			queries: queryParams
		},
		{ skip: !currentPeriod?._id }
	)

	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Đăng kí đề tài' }])

	// ------------------ SHARED HANDLERS ------------------
	const handlePageChange = useCallback(
		(newPage: number) => {
			if (newPage > 0 && newPage <= (paginated?.meta.totalPages ?? 0)) {
				setQueryParams((prev) => ({ ...prev, page: newPage }))
			}
		},
		[paginated?.meta.totalPages]
	)

	const handleTopicClick = useCallback((topic: GeneralTopic) => {
		setSelectedTopic(topic)
		setIsPanelOpen(true)
	}, [])

	const canRegister = currentPeriod?.currentPhase === PeriodPhaseName.OPEN_REGISTRATION && !registeredTopic

	
	// ------------------ REGISTRATION HANDLERS ------------------
	const handleRegisterClick = useCallback(
		async (topic: GeneralTopic) => {
			if (registeredTopic) {
				toast({
					title: 'Bạn đã đăng ký đề tài',
					description: 'Hãy hủy đề tài hiện tại trước khi đăng ký đề tài mới.',
					variant: 'destructive'
				})
				return
			}

			try {
				await createRegistration({ topicId: topic._id }).unwrap()
				setRegisteredTopic(topic)
				setActiveTab('registered')
				toast({ title: 'Đăng ký thành công!' })
			} catch (error) {
				toast({
					title: 'Đăng ký thất bại',
					description: `Vui lòng thử lại sau. ${(error as ApiError)?.data?.message ?? ''}`,
					variant: 'destructive'
				})
			}
		},
		[registeredTopic, createRegistration]
	)

	const handleCancelRegistration = useCallback(async () => {
		if (!registeredTopic) return

		try {
			await leaveTopic({ topicId: registeredTopic._id }).unwrap()
			setRegisteredTopic(null)
			setActiveTab('list')
			toast({ title: 'Hủy đăng ký thành công!' })
		} catch (error) {
			toast({
				title: 'Hủy thất bại',
				description: `Vui lòng thử lại sau. ${(error as ApiError)?.data?.message ?? ''}`,
				variant: 'destructive'
			})
		}
	}, [registeredTopic, leaveTopic])

	// ------------------ PAGINATION RENDERER ------------------
	const renderPagination = () => {
		const currentPage = queryParams.page ?? 1
		const totalPages = paginated?.meta.totalPages ?? 0

		if (totalPages <= 1) return null

		const pagesToShow = [currentPage - 1, currentPage, currentPage + 1].filter((p) => p >= 1 && p <= totalPages)

		return (
			<nav aria-label='Phân trang' className='relative z-[100] pt-4'>
				<Pagination>
					<PaginationContent className='gap-1'>
						{/* Previous */}
						<PaginationItem>
							<PaginationPrevious
								href='#'
								onClick={(e) => {
									e.preventDefault()
									handlePageChange(currentPage - 1)
								}}
								className={currentPage <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
							/>
						</PaginationItem>

						{/* First page */}
						<PaginationItem>
							<PaginationLink
								href='#'
								onClick={(e) => {
									e.preventDefault()
									handlePageChange(1)
								}}
								isActive={currentPage === 1}
								className='pointer-events-auto cursor-pointer ring-0'
							>
								1
							</PaginationLink>
						</PaginationItem>

						{/* Left dots */}
						{currentPage > 3 && (
							<PaginationItem>
								<span className='px-2 text-muted-foreground'>...</span>
							</PaginationItem>
						)}

						{/* Nearby pages */}
						{pagesToShow.map((p) => (
							<PaginationItem key={p}>
								<PaginationLink
									href='#'
									onClick={(e) => {
										e.preventDefault()
										handlePageChange(p)
									}}
									isActive={currentPage === p}
									className='pointer-events-auto cursor-pointer ring-0'
								>
									{p}
								</PaginationLink>
							</PaginationItem>
						))}

						{/* Right dots */}
						{currentPage < totalPages - 2 && (
							<PaginationItem>
								<span className='px-2 text-muted-foreground'>...</span>
							</PaginationItem>
						)}

						{/* Last page */}
						{totalPages > 1 && currentPage !== totalPages && (
							<PaginationItem>
								<PaginationLink
									href='#'
									onClick={(e) => {
										e.preventDefault()
										handlePageChange(totalPages)
									}}
									isActive={currentPage === totalPages}
									className='pointer-events-auto cursor-pointer ring-0'
								>
									{totalPages}
								</PaginationLink>
							</PaginationItem>
						)}

						{/* Next */}
						<PaginationItem>
							<PaginationNext
								href='#'
								onClick={(e) => {
									e.preventDefault()
									handlePageChange(currentPage + 1)
								}}
								className={
									currentPage >= totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'
								}
							/>
						</PaginationItem>
					</PaginationContent>
				</Pagination>
			</nav>
		)
	}

	// ------------------ LOADING & EMPTY STATE ------------------
	if (isLoadingTopics || !paginated) {
		return <LoadingState message='Đang tải dữ liệu' />
	}

	if (paginated.data.length === 0) {
		return (
			<div className='max-h-[calc(100vh)] overflow-y-auto bg-background'>
				{/* HEADER */}
				<header className='border-b bg-card'>
					<div className='container py-4'>
						<h1 className='text-xl font-bold'>Đăng ký đề tài</h1>
						<p className='mt-1 text-xs'>
							{getPeriodTitle(currentPeriod!)} | hiện tại: <CurrentTime />
						</p>
					</div>
				</header>

				{/* TABS */}
				<div className='sticky top-0 z-20 border-b bg-card'>
					<div className='container'>
						<Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'list' | 'registered')}>
							<TabsList className='h-10'>
								<TabsTrigger value='list'>
									<List className='mr-1 h-4 w-4' /> Danh sách
								</TabsTrigger>
								<TabsTrigger value='registered'>
									<FileCheck className='mr-1 h-4 w-4' /> Đã đăng ký
									{registeredTopic && <Badge className='ml-1 h-4 px-1 text-[10px]'>1</Badge>}
								</TabsTrigger>
							</TabsList>
						</Tabs>
					</div>
				</div>

				<EmptyState
					onClearFilters={() =>
						setQueryParams({
							...queryParams,
							query: '',
							lecturerIds: [],
							fieldIds: [],
							queryStatus: []
						})
					}
				/>
			</div>
		)
	}

	// ------------------ RENDER ------------------
	return (
		<div className='max-h-[calc(100vh)] overflow-y-auto bg-background'>
			{/* HEADER */}
			<header className='border-b bg-card'>
				<div className='container py-4'>
					<h1 className='text-xl font-bold'>Đăng ký đề tài</h1>
					<p className='mt-1 text-xs'>
						{getPeriodTitle(currentPeriod!)} | hiện tại: <CurrentTime />
					</p>
				</div>
			</header>

			{/* TABS */}
			<div className='sticky top-0 z-20 border-b bg-card'>
				<div className='container'>
					<Tabs value={activeTab} onValueChange={(val) => setActiveTab(val as 'list' | 'registered')}>
						<TabsList className='h-10'>
							<TabsTrigger value='list'>
								<List className='mr-1 h-4 w-4' /> Danh sách
							</TabsTrigger>
							<TabsTrigger value='registered'>
								<FileCheck className='mr-1 h-4 w-4' /> Đã đăng ký
								{registeredTopic && <Badge className='ml-1 h-4 px-1 text-[10px]'>1</Badge>}
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{activeTab === 'list' ? (
				<>
					{/* FILTER BAR */}
					<div className='sticky top-10 z-10 bg-card'>
						<FilterBar
							queryParams={queryParams}
							onSetQueryParams={setQueryParams}
						/>
					</div>

					<main className='container py-4'>
						<div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
							{paginated.data.map((topic) => (
								<TopicListItem
									key={topic._id}
									topic={topic}
									onClick={() => handleTopicClick(topic)}
									onRegister={() => handleRegisterClick(topic)}
									disabled={!canRegister}
									isRegistered={registeredTopic?._id === topic._id}
								/>
							))}
						</div>

						{renderPagination()}
					</main>
				</>
			) : (
				<main className='container py-6'>
					{/* Render registered or no registration state here if needed */}
				</main>
			)}

			<TopicDetailPanel topic={selectedTopic} isOpen={isPanelOpen} onClose={() => setIsPanelOpen(false)} />

			{/* Add Cancel button in registered tab or modal if needed */}
		</div>
	)
}
