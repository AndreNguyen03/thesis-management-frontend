import React, { useState, useCallback, useEffect, useMemo } from 'react'
import { useDebounce } from '@/hooks/useDebounce'
import { LibraryDashboard } from './components/LibraryDashboard'
import { Skeleton } from '@/components/ui/skeleton'
import { MajorDistributionChart, TrendChart } from './components/LibraryChart'
import { SearchBar } from './components/SearchBar'
import { LibraryTable } from './components/LibraryTable'
import { LibraryDetailModal } from './components/LibraryDetailModal'
import { useAdvanceSearchTopicsInLibraryQuery } from '@/services/topicVectorApi'
import {
	useGetMajorComboboxQuery,
	useGetSystemMajorDistributionQuery,
	useGetSystemMonthlyStatsQuery,
	useGetSystemOverviewStatsQuery,
	useGetYearComboboxQuery
} from '@/services/topicApi'
import type { RequestGetTopicsInAdvanceSearch } from '@/models/topicVector.model'
import type { ApiError, MonthlyStat, TopicInLibrary } from '@/models'
import { useBreadcrumb } from '@/hooks'

const ManageLibraryPage: React.FC = () => {
	const { setHidden } = useBreadcrumb()

	useEffect(() => {
		setHidden(true)
		return () => {
			setHidden(false)
		}
	}, [setHidden])

	const [selectedTopic, setSelectedTopic] = useState<TopicInLibrary | null>(null)
	const [showDetail, setShowDetail] = useState(false)
	const [page, setPage] = useState(1)
	const pageSize = 5
	const [searchValue, setSearchValue] = useState('')

	const handleSelectTopic = (topic: TopicInLibrary) => {
		setSelectedTopic(topic)
		setShowDetail(true)
	}

	const [queries, setQueries] = useState<RequestGetTopicsInAdvanceSearch>({
		limit: 20,
		page: 1,
		query: '',
		rulesPagination: 99,
		search_by: ['titleVN', 'titleEng', 'description'],
		majorIds: [],
		year: 'Tất cả'
	})
	const {
		data: topicsInLibrary,
		isLoading,
		error
	} = useAdvanceSearchTopicsInLibraryQuery({ queries: { ...queries, page, limit: pageSize } })


	const { data: overview, isLoading: loadingOverview, error: errorOverview } = useGetSystemOverviewStatsQuery()

	const {
		data: monthlyStats = [],
		isLoading: loadingMonthlyStats,
		error: errorMonthlyStats
	} = useGetSystemMonthlyStatsQuery({ months: 12 })

	const trendData = useMemo(() => {
		// monthlyStats: [{ month: 'YYYY-MM', views, downloads }, ...]
		const map = new Map<string, { views: number; downloads: number }>()
		monthlyStats.forEach((m: MonthlyStat) => map.set(m.month, { views: m.views || 0, downloads: m.downloads || 0 }))

		const now = new Date()
		const res: { month: string; views: number; downloads: number }[] = []
		for (let i = 11; i >= 0; i--) {
			const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
			const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
			const val = map.get(key) || { views: 0, downloads: 0 }
			res.push({ month: `T${d.getMonth() + 1}`, views: val.views, downloads: val.downloads })
		}
		return res
	}, [monthlyStats])

	const { data: majors, isLoading: loadingMajors, error: errorMajors } = useGetSystemMajorDistributionQuery()

	// Debounced search handler
	const handleSearchImmediate = useCallback((searchTerm: string) => {
		setQueries((prev) => ({
			...prev,
			page: 1,
			query: searchTerm
		}))
	}, [])

	const debouncedSearch = useDebounce({ onChange: handleSearchImmediate, duration: 400 })

	const handleSearchChange = (value: string) => {
		setSearchValue(value) // update UI ngay lập tức
		debouncedSearch(value) // debounce API
	}

	const selectMajor = (majorId: string) => {
		setQueries((prev) => ({
			...prev,
			page: 1,
			majorIds: majorId === 'Tất cả' ? [] : [majorId]
		}))
	}
	const handleYear = (year: string | number) => {
		setQueries((prev) => ({
			...prev,
			page: 1,
			year: year
		}))
	}

	// const handleSelectSort = (sortBy: string) => {
	// 	setQueries((prev) => ({
	// 		...prev,
	// 		sort_by: sortBy === 'rel' ? undefined : sortBy === 'new' ? 'defenseDate' : 'averageRating',
	// 		sort_order: sortBy === 'rel' ? undefined : sortBy === 'new' ? 'desc' : 'desc'
	// 	}))
	// }

	//Lấy metaData
	//Ngành
	const { data: majorOptions, isLoading: isLoadingMajors } = useGetMajorComboboxQuery()
	//Năm bảo vệ
	const { data: yearOptions, isLoading: isLoadingYears } = useGetYearComboboxQuery()

	console.log('🔥 topicsInLibrary:', topicsInLibrary)
	console.log('majorOptions:', majorOptions)
	console.log('yearOptions:', yearOptions)

	useEffect(() => {
		const errors = [
			{ key: 'topics', err: error },
			{ key: 'overview', err: errorOverview },
			{ key: 'monthly', err: errorMonthlyStats },
			{ key: 'majors', err: errorMajors }
		].filter((e) => e.err)

		if (errors.length > 0) {
			console.error('ManageLibraryPage API errors:', errors)
		}
	}, [error, errorOverview, errorMonthlyStats, errorMajors])

	return (
		<div className='min-h-screen w-full bg-background'>
			{/* Main Content */}
			<main className='mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8'>
				{/* Page Title */}
				<div className='mb-6'>
					<h2 className='text-2xl font-bold text-foreground'>Quản lý Thư viện số</h2>
					<p className='mt-1 text-muted-foreground'>Tra cứu, thống kê và quản trị đề tài trong thư viện số</p>
				</div>

				{/* Stats Cards */}
				<section className='mb-6'>
					{isLoading || loadingOverview ? (
						<div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'>
							{[...Array(5)].map((_, i) => (
								<Skeleton key={i} className='h-28 w-full rounded-xl' />
							))}
						</div>
					) : (
						<LibraryDashboard overview={overview} monthlyStats={monthlyStats} />
					)}
				</section>

				{/* Charts Section */}
				<section className='mb-6 grid grid-cols-1 gap-4 lg:grid-cols-3'>
					{loadingMajors || loadingMonthlyStats ? (
						<>
							<div className='lg:col-span-2'>
								<Skeleton className='h-64 w-full rounded-xl' />
							</div>
							<div>
								<Skeleton className='h-64 w-full rounded-xl' />
							</div>
						</>
					) : (
						<>
							<div className='lg:col-span-2'>
								<TrendChart data={trendData} />
							</div>
							<div>
								<MajorDistributionChart data={majors ?? undefined} />
							</div>
						</>
					)}
				</section>

				{( errorOverview || errorMonthlyStats || errorMajors) && (
					<section className='mb-4'>
						<div className='space-y-2'>
							{errorOverview && (
								<div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
									Lỗi thống kê tổng quan:{' '}
									{(errorOverview as ApiError)?.data?.message || 'Không thể tải dữ liệu'}
								</div>
							)}
							{errorMonthlyStats && (
								<div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
									Lỗi thống kê tháng:{' '}
									{(errorMonthlyStats as ApiError)?.data?.message || 'Không thể tải dữ liệu'}
								</div>
							)}
							{errorMajors && (
								<div className='rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700'>
									Lỗi phân bố ngành:{' '}
									{(errorMajors as ApiError)?.data?.message || 'Không thể tải dữ liệu'}
								</div>
							)}
						</div>
					</section>
				)}

				{/* Search Bar */}
				<section className='mb-4'>
					{isLoadingMajors || isLoadingYears ? (
						<div className='flex gap-2'>
							<Skeleton className='h-12 w-full rounded-lg' />
							<Skeleton className='h-12 w-[140px] rounded-lg' />
							<Skeleton className='h-12 w-[120px] rounded-lg' />
						</div>
					) : (
						<SearchBar
							searchQuery={searchValue}
							onSearch={handleSearchChange}
							majorValue={queries.majorIds && queries.majorIds[0] ? queries.majorIds[0] : 'Tất cả'}
							onMajorChange={selectMajor}
							yearValue={queries.year ?? 'Tất cả'}
							onYearChange={handleYear}
							majorOptions={[
								{ value: 'Tất cả', label: 'Tất cả ngành' },
								...(majorOptions?.map(
									(m: { value?: string; _id?: string; label?: string; name?: string }) => ({
										value: m.value || m._id || 'unknown',
										label: m.label || m.name || 'Không xác định'
									})
								) || [])
							]}
							yearOptions={[
								{ value: 'Tất cả', label: 'Tất cả năm' },
								...(yearOptions?.map((y: string) => ({ value: String(y), label: String(y) })) || [])
							]}
						/>
					)}
				</section>

				{/* Topics Table */}
				<section className='mb-6'>
					<div className='mb-3 flex items-center justify-between'>
						<h3 className='text-lg font-semibold text-foreground'>Danh sách đề tài</h3>
						<span className='text-sm text-muted-foreground'>
							Hiển thị{' '}
							{pageSize > (topicsInLibrary?.meta?.totalItems ?? 0)
								? (topicsInLibrary?.meta?.totalItems ?? 0)
								: pageSize}{' '}
							/ {topicsInLibrary?.meta?.totalItems ?? 0} đề tài
						</span>
					</div>
					{isLoading ? (
						<div className='space-y-2'>
							{[...Array(pageSize)].map((_, i) => (
								<Skeleton key={i} className='h-16 w-full rounded-lg' />
							))}
						</div>
					) : (
						<LibraryTable
							topics={topicsInLibrary?.data || []}
							isLoading={isLoading}
							totalCount={topicsInLibrary?.meta?.totalItems || 0}
							page={page}
							pageSize={pageSize}
							onPageChange={setPage}
							onSelectTopic={handleSelectTopic}
						/>
					)}
				</section>
			</main>

			{/* Detail Modal */}
			<LibraryDetailModal open={showDetail} topic={selectedTopic} onClose={() => setShowDetail(false)} />
		</div>
	)
}

export { ManageLibraryPage }
