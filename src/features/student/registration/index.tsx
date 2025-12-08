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
import {  List, FileCheck } from 'lucide-react'
import { toast } from '@/hooks/use-toast'
import { usePageBreadcrumb } from '@/hooks'
import { CurrentTime } from './topics/CurrentTime'
import type { Topic, FilterState, RegistrationPeriod, RegisteredTopic } from './types'
import { generateMockTopics } from './mock'
import {
	Pagination,
	PaginationContent,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious
} from '@/components/ui/pagination'

const ITEMS_PER_PAGE = 8

export default function TopicRegistration() {
	// ------------------ PAGINATION STATE ------------------
	const [page, setPage] = useState(1)
	const [topics, setTopics] = useState<Topic[]>([])
	const [totalItems, setTotalItems] = useState(0)
	const [totalPages, setTotalPages] = useState(1)
	const [isLoading, setIsLoading] = useState(true)

	// ------------------ FILTER STATE ------------------
	const [filters, setFilters] = useState<FilterState>({
		search: '',
		advisor: '',
		field: '',
		status: 'all'
	})

	// ------------------ OTHER STATES ------------------
	const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
	const [isPanelOpen, setIsPanelOpen] = useState(false)
	const [activeTab, setActiveTab] = useState('list')
	const [registeredTopic, setRegisteredTopic] = useState<RegisteredTopic | null>(null)
	const [topicToRegister, setTopicToRegister] = useState<Topic | null>(null)
	const [isConfirmOpen, setIsConfirmOpen] = useState(false)
	const [isRegistering, setIsRegistering] = useState(false)
	const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)
	const [isCancelling, setIsCancelling] = useState(false)

	// Mock period
	const [period] = useState<RegistrationPeriod>({
		phase: 'open',
		startDate: new Date(),
		endDate: new Date(Date.now() + 5 * 24 * 3600 * 1000),
		name: 'Đợt đăng ký đề tài HK1'
	})

	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Đăng kí đề tài' }])

	// ------------------ FETCH TOPICS (PAGINATION) ------------------
	const fetchTopics = useCallback(async () => {
		setIsLoading(true)

		// ❗ Đây là mock API — bạn thay bằng API thật
		setTimeout(() => {
			const filtered = mockFilter(filters)

			const start = (page - 1) * ITEMS_PER_PAGE
			const paginated = filtered.slice(start, start + ITEMS_PER_PAGE)

			setTopics(paginated)
			setTotalItems(filtered.length)
			setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE))

			setIsLoading(false)
		}, 500)
	}, [page, filters])

	useEffect(() => {
		fetchTopics()
	}, [page, filters])

	// ------------------ HANDLERS ------------------

	const handlePageChange = (newPage: number) => {
		if (newPage > 0 && newPage <= totalPages) {
			setPage(newPage)
		}
	}

	const handleFiltersChange = (newFilters: FilterState) => {
		setFilters(newFilters)
		setPage(1) // reset page
	}

	const handleTopicClick = (topic: Topic) => {
		setSelectedTopic(topic)
		setIsPanelOpen(true)
	}

	const handleRegisterClick = (topic: Topic) => {
		if (registeredTopic) {
			toast({
				title: 'Bạn đã đăng ký đề tài',
				description: 'Hãy hủy đề tài hiện tại trước khi đăng ký đề tài mới.',
				variant: 'destructive'
			})
			return
		}
		setTopicToRegister(topic)
		setIsConfirmOpen(true)
	}

	const handleConfirmRegister = async () => {
		if (!topicToRegister) return
		setIsRegistering(true)
		await new Promise((r) => setTimeout(r, 1000))

		setRegisteredTopic({
			topic: topicToRegister,
			registeredAt: new Date()
		})

		setIsRegistering(false)
		setIsConfirmOpen(false)
		setIsPanelOpen(false)
		setActiveTab('registered')
	}

	const handleCancelRegistration = async () => {
		if (!registeredTopic) return
		setIsCancelling(true)
		await new Promise((r) => setTimeout(r, 1000))

		setRegisteredTopic(null)
		setIsCancelling(false)
		setIsCancelModalOpen(false)
		setActiveTab('list')
	}

	// ------------------ UI ------------------
	const canRegister = period.phase === 'open' && !registeredTopic

	return (
		<div className='max-h-[calc(100vh)] overflow-y-auto bg-background'>
			{/* HEADER */}
			<header className='border-b bg-card'>
				<div className='container py-4'>
					<h1 className='text-xl font-bold'>Đăng ký đề tài</h1>
					<p className='mt-1 text-xs'>
						{period.name} | hiện tại: <CurrentTime />
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
						<FilterBar filters={filters} onFiltersChange={handleFiltersChange} />
					</div>

					<main className='container py-4'>
						{isLoading ? (
							<SkeletonLoader count={6} />
						) : topics.length === 0 ? (
							<EmptyState
								onClearFilters={() =>
									handleFiltersChange({
										search: '',
										advisor: '',
										field: '',
										status: 'all'
									})
								}
							/>
						) : (
							<div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
								{topics.map((topic) => (
									<TopicListItem
										key={topic.id}
										topic={topic}
										onClick={() => handleTopicClick(topic)}
										onRegister={() => handleRegisterClick(topic)}
										isRegistering={isRegistering && topicToRegister?.id === topic.id}
										disabled={!canRegister}
										isRegistered={registeredTopic?.topic.id === topic.id}
									/>
								))}
							</div>
						)}

						{/* PAGINATION */}
						{totalPages > 1 && (
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
													handlePageChange(page - 1)
												}}
												className={
													page <= 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
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
												isActive={page === 1}
												className='pointer-events-auto cursor-pointer ring-0'
											>
												1
											</PaginationLink>
										</PaginationItem>
										{/* Left dots */}
										{page > 3 && (
											<PaginationItem>
												<span className='px-2 text-muted-foreground'>...</span>
											</PaginationItem>
										)}
										{[page - 1, page, page + 1].map((p) => {
											if (p <= 1 || p >= totalPages) return null
											return (
												<PaginationItem key={p}>
													<PaginationLink
														href='#'
														onClick={(e) => {
															e.preventDefault()
															handlePageChange(p)
														}}
														isActive={page === p}
														className='pointer-events-auto cursor-pointer ring-0'
													>
														{p}
													</PaginationLink>
												</PaginationItem>
											)
										})}
										{page < totalPages - 2 && (
											<PaginationItem>
												<span className='px-2 text-muted-foreground'>...</span>
											</PaginationItem>
										)}
										{totalPages > 1 && (
											<PaginationItem>
												<PaginationLink
													href='#'
													onClick={(e) => {
														e.preventDefault()
														handlePageChange(totalPages)
													}}
													isActive={page === totalPages}
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
													handlePageChange(page + 1)
												}}
												className={
													page >= totalPages
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
					{registeredTopic ? (
						<RegisteredTopicCard
							registeredTopic={registeredTopic}
							phase={period.phase}
							onCancel={() => setIsCancelModalOpen(true)}
							isCancelling={isCancelling}
						/>
					) : (
						<NoRegistrationCard phase={period.phase} />
					)}
				</main>
			)}

			<TopicDetailPanel
				topic={selectedTopic}
				isOpen={isPanelOpen}
				onClose={() => setIsPanelOpen(false)}
				onRegister={handleConfirmRegister}
				isRegistering={isRegistering}
			/>

			<ConfirmModal
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
			/>
		</div>
	)
}

// ---------------------------------------------------------------
// MOCK FILTER (bạn thay bằng API thật)
// ---------------------------------------------------------------
function mockFilter(filters: FilterState): Topic[] {
	const ALL = generateMockTopics(132) // nếu bạn đang có mock này
	return ALL.filter((t) => {
		if (filters.search && !t.title.toLowerCase().includes(filters.search.toLowerCase())) return false
		if (filters.advisor && t.advisor.id !== filters.advisor) return false
		if (filters.field && t.field !== filters.field) return false
		if (filters.status === 'available' && t.status === 'full') return false
		if (filters.status === 'full' && t.status !== 'full') return false
		return true
	})
}
