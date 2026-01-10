/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useState } from 'react'
import { List, FileCheck } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { usePageBreadcrumb } from '@/hooks'

import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'
import {
	type StudentRegistrationStatus,
	type GeneralTopic,
	type GetFieldNameReponseDto,
	type ITopicDetail,
	type PaginationTopicsRegistrationQueryParams,
	type ResponseMiniLecturerDto,
	type StudentUser
} from '@/models'
import { type GetCurrentPeriod } from '@/models/period.model'
import { getPeriodTitle } from '@/utils/utils'
import { useCreateRegistrationMutation, useLeaveTopicMutation } from '@/services/registrationApi'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CurrentTime } from '../topics/CurrentTime'
import { FilterBar } from '../topics/FilterBar'
import { SkeletonLoader } from '../topics/SkeletonLoader'
import { TopicListItem } from '../topics/TopicListItem'
import { EmptyState } from '../topics/EmptyState'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { ConfirmModal } from '../topics/ConfirmModal'
import { CancelConfirmModal } from '../topics/CancelConfirmModal'
import { PeriodHeaderSkeleton } from './PeriodHeaderSkeleton'
import { Skeleton } from '@/components/ui/skeleton'
import { useAdvanceSearchRegisteringTopicsQuery } from '@/services/topicVectorApi'
// import {  useLazyGetTopicByIdQuery } from '@/services/topicApi'
import RegistrationHistory from '../../TopicList/registered/children/RegistrationHistory'
import { RecommendationPanel } from '../recommendation/RecommendationPanel'
import { RecommendationButton } from '../recommendation/RecommendationButton'
import { TopicRegistrationSkeleton } from './TopicRegistrationSkeleton'
import { useAppSelector } from '@/store'
import { socketService } from '@/services/socket.service'

export default function TopicRegistration() {
	// ------------------ PAGINATION STATE ------------------

	const { id } = useParams<{ id: string }>()

	const location = useLocation()
	const periodFromState = location.state?.period
	const period = periodFromState ? (periodFromState as GetCurrentPeriod) : null

	const [queryParams, setQueryParams] = useState<PaginationTopicsRegistrationQueryParams>({
		page: 1,
		limit: 10,
		search_by: ['titleVN', 'titleEng'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		status: 'all',
		rulesPagination: 99,
		lecturerIds: [],
		fieldIds: [],
		queryStatus: []
	})

	// ------------------ FILTER STATE ------------------
	// Mock period

	const {
		data: paginated,
		isLoading: isLoadingTopics,
		refetch
	} = useAdvanceSearchRegisteringTopicsQuery({
		periodId: id!,
		queries: queryParams
	})

	const navigate = useNavigate()
	// const [triggerGetTopicDetail] = useLazyGetTopicByIdQuery()
	// ------------------ OTHER STATES ------------------
	const [selectedTopic, setSelectedTopic] = useState<GeneralTopic | null>(null)
	const [isRecommendOpen, setIsRecommendOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('list')
	const [topicToRegister, setTopicToRegister] = useState<GeneralTopic | null>(null)
	const [selectedFields, setSelectedFields] = useState<GetFieldNameReponseDto[]>([])
	const [selectedLecturers, setSelectedLecturers] = useState<ResponseMiniLecturerDto[]>([])
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isRegistering, setIsRegistering] = useState(false)
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
	const [isCancelling, setIsCancelling] = useState(false)
	//handle registration
	const [createRegistration] = useCreateRegistrationMutation()
	const [leaveTopic] = useLeaveTopicMutation()

	// const { data: registeredPaginated } = useGetRegisteredTopicQuery({
	// 	queries: {
	// 		page: 1,
	// 		limit: 1
	// 	}
	// })

	// const registeredTopic = registeredPaginated?.data?.[0] ?? null
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Đăng kí đề tài' }])

	const userId = useAppSelector((state) => (state.auth.user as StudentUser)?.userId)

	useEffect(() => {
		if (!userId) return
		socketService.connect(userId, '/period')

		const cleanup = socketService.on('/period', 'periodDashboard:update', () => {
			console.log('Received periodDashboard:update event, refetching student dashboard data...')
			refetch()
		})

		return () => {
			cleanup()
			socketService.disconnect('/period')
		}
	}, [userId, refetch])

	// ------------------ HANDLERS ------------------`

	const handleSelectionChangeFields = useCallback((newFields: GetFieldNameReponseDto[]) => {
		setSelectedFields(newFields)
		const fieldIds = newFields.map((field) => field._id)
		setQueryParams((prev) => ({ ...prev, fieldIds, page: 1 }))
	}, [])

	const handleSelectionChangeLecturers = useCallback((newLecturers: ResponseMiniLecturerDto[]) => {
		setSelectedLecturers(newLecturers)
		const lecturerIds = newLecturers.map((lecturer) => lecturer._id)
		setQueryParams((prev) => ({ ...prev, lecturerIds, page: 1 }))
	}, [])

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= (paginated?.meta.totalPages ?? 1)) {
			setQueryParams((prev) => ({ ...prev, page: newPage }))
		}
	}

	const handleRegisterClick = (topic: GeneralTopic) => {
		setTopicToRegister(topic)
		setIsConfirmOpen(true)
	}

	const handleConfirmRegister = async () => {
		if (!topicToRegister) return
		setIsRegistering(true)

		try {
			await createRegistration({ topicId: topicToRegister._id }).unwrap()
			setActiveTab('registered')
			setIsConfirmOpen(false)
		} catch (err: any) {
			toast({
				title: 'Không thể đăng ký',
				description: err?.data?.message || 'Đăng ký thất bại',
				variant: 'destructive'
			})
		} finally {
			setIsRegistering(false)
		}
	}

	const handleOpenCancelModal = (topic: GeneralTopic) => {
		setSelectedTopic(topic)
		setIsCancelModalOpen(true)
	}

	const handleCancelRegistration = async () => {
		setIsCancelling(true)

		try {
			await leaveTopic({ topicId: selectedTopic!._id }).unwrap()
			setActiveTab('list')
			setIsCancelModalOpen(false)
		} catch (err: any) {
			toast({
				title: 'Không thể hủy',
				description: err?.data?.message || 'Hủy thất bại',
				variant: 'destructive'
			})
		} finally {
			setIsCancelling(false)
		}
	}

	const handleViewTopic = async (_id: string) => {
		navigate(`/detail-topic/${_id}`)
		//const { data } = await triggerGetTopicDetail({ id: _id })
		// if (data) setSelectedTopic(data)
	}

	// ------------------ UI ------------------
	if (!period || isLoadingTopics) {
		return <TopicRegistrationSkeleton />
	}

	return (
		<div className='max-h-[calc(100vh)] w-full overflow-y-auto bg-background pt-6'>
			{/* HEADER */}
			{!period ? (
				<PeriodHeaderSkeleton />
			) : (
				<header className='border-b bg-card'>
					<div className='container py-4'>
						<h1 className='text-xl font-bold'>Đăng ký đề tài</h1>
						<p className='mt-1 text-xs'>
							{getPeriodTitle(period)} | hiện tại: <CurrentTime />
						</p>
					</div>
				</header>
			)}

			{/* TABS */}
			<div className='sticky top-0 z-20 border-b bg-card'>
				<div className='container'>
					<Tabs value={activeTab} onValueChange={setActiveTab}>
						<TabsList className='h-10'>
							<TabsTrigger value='list'>
								<List className='mr-1 h-4 w-4' /> Danh sách
							</TabsTrigger>
							<TabsTrigger value='registered'>
								<FileCheck className='mr-1 h-4 w-4' /> Đã đăng ký
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{/* CONTENT */}
			{activeTab === 'list' ? (
				<>
					{/* FILTER BAR */}
					<div className='sticky top-10 z-10 bg-card'>
						<FilterBar
							selectedFields={selectedFields}
							selectedLecturers={selectedLecturers}
							queryParams={queryParams}
							onSetQueryParams={setQueryParams}
							onSelectionChangeFields={handleSelectionChangeFields}
							onSelectionChangeLecturers={handleSelectionChangeLecturers}
						/>
					</div>

					<main className='container py-4'>
						{isLoadingTopics ? (
							<SkeletonLoader count={6} />
						) : paginated?.data.length === 0 ? (
							<EmptyState
								onClearFilters={() =>
									setQueryParams({
										query: '',
										lecturerIds: [],
										fieldIds: [],
										queryStatus: []
									})
								}
							/>
						) : (
							<div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
								{paginated?.data.map((topic) => (
									<TopicListItem
										key={topic._id}
										topic={topic}
										onClick={() =>
											handleViewTopic(
												queryParams.rulesPagination === 100 ? topic.original_id! : topic._id
											)
										}
										onRegister={() => handleRegisterClick(topic)}
										isRegistering={isRegistering && topicToRegister?._id === topic._id}
										onUnregister={() => handleOpenCancelModal(topic)}
									/>
								))}
							</div>
						)}

						{/* PAGINATION */}
						{paginated && paginated.meta.totalPages > 1 && (
							<nav aria-label='Phân trang' className='relative z-[100] pt-4'>
								<Pagination>
									<PaginationContent className='gap-1'>
										{' '}
										{/* ⭐ FIX QUAN TRỌNG */}
										{/* Previous */}
										<PaginationItem>
											<PaginationPrevious
												href='#'
												onClick={(e) => {
													e.preventDefault()
													handlePageChange(queryParams.page! - 1)
												}}
												className={
													queryParams.page! <= 1
														? 'pointer-events-none opacity-50'
														: 'cursor-pointer'
												}
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
												isActive={queryParams.page === 1}
												className='pointer-events-auto cursor-pointer ring-0'
											>
												1
											</PaginationLink>
										</PaginationItem>
										{/* Left dots */}
										{queryParams.page! > 3 && (
											<PaginationItem>
												<span className='px-2 text-muted-foreground'>...</span>
											</PaginationItem>
										)}
										{[queryParams.page! - 1, queryParams.page!, queryParams.page! + 1].map((p) => {
											if (p <= 1 || p >= paginated!.meta.totalPages) return null
											return (
												<PaginationItem key={p}>
													<PaginationLink
														href='#'
														onClick={(e) => {
															e.preventDefault()
															handlePageChange(p)
														}}
														isActive={queryParams.page === p}
														className='pointer-events-auto cursor-pointer ring-0'
													>
														{p}
													</PaginationLink>
												</PaginationItem>
											)
										})}
										{queryParams.page! < paginated.meta.totalPages - 2 && (
											<PaginationItem>
												<span className='px-2 text-muted-foreground'>...</span>
											</PaginationItem>
										)}
										{paginated.meta.totalPages > 1 && (
											<PaginationItem>
												<PaginationLink
													href='#'
													onClick={(e) => {
														e.preventDefault()
														handlePageChange(paginated.meta.totalPages)
													}}
													isActive={queryParams.page === paginated.meta.totalPages}
													className='pointer-events-auto cursor-pointer ring-0'
												>
													{paginated.meta.totalPages}
												</PaginationLink>
											</PaginationItem>
										)}
										{/* Next */}
										<PaginationItem>
											<PaginationNext
												href='#'
												onClick={(e) => {
													e.preventDefault()
													handlePageChange(queryParams.page! + 1)
												}}
												className={
													queryParams.page! >= paginated.meta.totalPages
														? 'pointer-events-none opacity-50'
														: 'cursor-pointer'
												}
											/>
										</PaginationItem>
									</PaginationContent>
								</Pagination>
							</nav>
						)}
					</main>
				</>
			) : (
				<>
					{/* 🔹 Skeleton khi đang load period */}
					{!period ? (
						<div className='container space-y-4 py-6'>
							<Skeleton className='h-20 w-full rounded-lg' />
						</div>
					) : (
						<main className='container py-6'>
							<RegistrationHistory periodId={period?._id} />
						</main>
					)}
				</>
			)}

			<ConfirmModal
				isOpen={isConfirmOpen}
				topic={topicToRegister}
				onConfirm={handleConfirmRegister}
				onClose={() => setIsConfirmOpen(false)}
				isLoading={isRegistering}
			/>

			<CancelConfirmModal
				registeredTopic={selectedTopic}
				isOpen={isCancelModalOpen}
				onConfirm={handleCancelRegistration}
				onClose={() => setIsCancelModalOpen(false)}
				isLoading={isCancelling}
			/>

			{/* Recommendation Panel */}
			<RecommendationPanel isOpen={isRecommendOpen} onClose={() => setIsRecommendOpen(false)} periodId={id!} />

			{/* Floating Button */}
			<RecommendationButton onClick={() => setIsRecommendOpen(true)} isOpen={isRecommendOpen} />
		</div>
	)
}
