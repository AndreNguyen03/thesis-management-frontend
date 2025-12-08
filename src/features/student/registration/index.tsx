import { useState, useMemo, useEffect, useCallback } from 'react'
import { FilterBar } from './topics/FilterBar'
import { TopicListItem } from './topics/TopicListItem'
import { TopicDetailPanel } from './topics/TopicDetailPanel'
import { ConfirmModal } from './topics/ConfirmModal'
import { CancelConfirmModal } from './topics/CancelConfirmModal'
import { SkeletonLoader } from './topics/SkeletonLoader'
import { EmptyState } from './topics/EmptyState'
// import { BeforePhaseNotice } from './topics/BeforePhaseNotice'
import { RegisteredTopicCard } from './topics/RegisteredTopicCard'
import { NoRegistrationCard } from './topics/NoRegistrationCard'
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

export default function TopicRegistration() {
	// ------------------ PAGINATION STATE ------------------

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
		phase: PeriodPhaseName.OPEN_REGISTRATION || ''
	})
	// ------------------ FILTER STATE ------------------
	// Mock period
	const currentPeriod = useAppSelector((state) => state.period.currentPeriod)
	const {
		data: paginated,
		refetch: refetchTopics,
		isLoading: isLoadingTopics
	} = useGetTopicsInPhaseQuery(
		{
			periodId: currentPeriod?._id!,
			queries: queryParams
		},
		{ skip: !currentPeriod?._id }
	)
	// ------------------ OTHER STATES ------------------
	const [selectedTopic, setSelectedTopic] = useState<GeneralTopic | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('list')
	const [registeredTopic, setRegisteredTopic] = useState<GeneralTopic | null>(null)
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
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Đăng kí đề tài' }])

	// ------------------ FETCH TOPICS (PAGINATION) ------------------
	useEffect(() => {
		refetchTopics()
	}, [queryParams])

	// ------------------ HANDLERS ------------------

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= queryParams.page!) {
			setQueryParams((prev) => ({ ...prev, page: newPage }))
		}
	}

	const handleTopicClick = (topic: GeneralTopic) => {
		setSelectedTopic(topic)
		setIsPanelOpen(true)
	}

	const handleRegisterClick = async (topic: GeneralTopic) => {
		if (registeredTopic) {
			toast({
				title: 'Bạn đã đăng ký đề tài',
				description: 'Hãy hủy đề tài hiện tại trước khi đăng ký đề tài mới.',
				variant: 'destructive'
			})
			return
		}
		await createRegistration({ topicId: topic._id })
		//setTopicToRegister(topic)
		setIsConfirmOpen(true)
	}

	const handleConfirmRegister = async () => {
		if (!topicToRegister) return
		setIsRegistering(true)
		await new Promise((r) => setTimeout(r, 1000))

		setRegisteredTopic(topicToRegister!)

		setIsRegistering(false)
		setIsConfirmOpen(false)
		setIsPanelOpen(false)
		setActiveTab('registered')
	}

	const handleCancelRegistration = async () => {
		if (!registeredTopic) return
		setIsCancelling(true)
		await new Promise((r) => setTimeout(r, 1000))
		await leaveTopic({ topicId: registeredTopic._id })
		setRegisteredTopic(null)
		setIsCancelling(false)
		setIsCancelModalOpen(false)
		setActiveTab('list')
	}

	// ------------------ UI ------------------
	const canRegister = currentPeriod?.currentPhase === PeriodPhaseName.OPEN_REGISTRATION && !registeredTopic
	const handleOnQuery = (val: string) => {
		setQueryParams((prev) => ({ ...prev, query: val, page: 1 }))
	}
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
					<Tabs value={activeTab} onValueChange={setActiveTab}>
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
							onSelectionChangeFields={setSelectedFields}
							onSelectionChangeLecturers={setSelectedLecturers}
							onQuery={handleOnQuery}
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
										onClick={() => handleTopicClick(topic)}
										onRegister={() => handleRegisterClick(topic)}
										isRegistering={isRegistering && topicToRegister?._id === topic._id}
										disabled={!canRegister}
										isRegistered={registeredTopic?._id === topic._id}
									/>
								))}
							</div>
						)}

						{/* PAGINATION */}
						{paginated?.meta.totalPages! > 1 && (
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
											if (p <= 1 || p >= paginated?.meta.totalPages!) return null
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
										{queryParams.page! < paginated?.meta.totalPages! - 2 && (
											<PaginationItem>
												<span className='px-2 text-muted-foreground'>...</span>
											</PaginationItem>
										)}
										{paginated?.meta.totalPages! > 1 && (
											<PaginationItem>
												<PaginationLink
													href='#'
													onClick={(e) => {
														e.preventDefault()
														handlePageChange(paginated?.meta.totalPages!)
													}}
													isActive={queryParams.page === paginated?.meta.totalPages!}
													className='pointer-events-auto cursor-pointer ring-0'
												>
													{paginated?.meta.totalPages!}
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
													queryParams.page! >= paginated?.meta.totalPages!
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
				<main className='container py-6'>
					{/* {registeredTopic ? (
						<RegisteredTopicCard
							registeredTopic={registeredTopic}
							phase={currentPeriod?.currentPhase}
							onCancel={() => setIsCancelModalOpen(true)}
							isCancelling={isCancelling}
						/>
					) : (
						<NoRegistrationCard phase={currentPeriod?.currentPhase} />
					)} */}
				</main>
			)}

			<TopicDetailPanel
				topic={selectedTopic}
				isOpen={isPanelOpen}
				onClose={() => setIsPanelOpen(false)}
				onRegister={handleConfirmRegister}
				isRegistering={isRegistering}
			/>

			{/* <ConfirmModal
				isOpen={isConfirmOpen}
				topic={topicToRegister}
				onConfirm={handleConfirmRegister}
				onClose={() => setIsConfirmOpen(false)}
				isLoading={isRegistering}
			/>

			<CancelConfirmModal
				registeredTopic={registeredTopic}
				isOpen={isCancelModalOpen}
				onConfirm={handleCancelRegistration}
				onClose={() => setIsCancelModalOpen(false)}
				isLoading={isCancelling}
			/> */}
		</div>
	)
}

// ---------------------------------------------------------------
// MOCK FILTER (bạn thay bằng API thật)
// ---------------------------------------------------------------
