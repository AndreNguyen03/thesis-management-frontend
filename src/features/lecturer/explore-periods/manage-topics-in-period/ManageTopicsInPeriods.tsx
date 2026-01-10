import React, { useEffect, useState } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Badge, Button, Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
import { CustomPagination } from '@/components/PaginationBar'
import { EmptyState } from '@/components/ui/EmptyState'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetTopicsInPhaseQuery, useLecturerGetTopicsInPhaseQuery } from '@/services/topicApi'
import {
	topicStatusLabels,
	type ApiError,
	type GeneralTopic,
	type PaginationLecturerGetTopicsInPhaseParams,
	type PaginationTopicsQueryParams,
	type Topic
} from '@/models'
import { formatPeriodInfo, formatPeriodInfo2, getUserIdFromAppUser, PhaseInfo } from '@/utils/utils'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'
import TopicsDataTable from './TopicsDataTableInPeriod'
import { socketService } from '@/services/socket.service'
import { useAppSelector } from '@/store'
//cần được bảo vệ bởi role giảng viên
const ManageTopicsInPeriods = () => {
	const user = useAppSelector((state) => state.auth.user)

	const userId = getUserIdFromAppUser(user)
	const { periodId } = useParams<{ periodId: string }>()
	const navigate = useNavigate()
	const [queryParams, setQueryParams] = useState<PaginationLecturerGetTopicsInPhaseParams>({
		page: 1,
		limit: 10,
		search_by: ['titleVN', 'titleEng'],
		query: '',
		sort_by: 'createdAt',
		sort_order: 'desc',
		status: 'all'
	})
	const location = useLocation()

	const [searchTerm, setSearchTerm] = useState('')

	const setQuery = (query: string) => {
		setQueryParams((prev) => ({ ...prev, query }))
	}

	const debounceOnChange = useDebounce({ onChange: setQuery, duration: 400 })

	const onEdit = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	const {
		data: topicsData,
		isLoading,
		error,
		refetch
	} = useLecturerGetTopicsInPhaseQuery(
		{
			periodId: periodId!,
			params: queryParams
		},
		{ skip: !periodId }
	)
	const [topics, setTopics] = useState<GeneralTopic[] | undefined>()

	useEffect(() => {
		if (topicsData) {
			setTopics(topicsData.data)
		}
	}, [topicsData])

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

	// Định nghĩa các phase để hiển thị progress
	const allPhases = [
		{ phase: 'submit_topic', label: PhaseInfo.submit_topic.label },
		{ phase: 'open_registration', label: PhaseInfo.open_registration.label },
		{ phase: 'execution', label: PhaseInfo.execution.label },
		{ phase: 'completion', label: PhaseInfo.completion.label }
	]

	const getPhaseIndex = (phase: string) => {
		return allPhases.findIndex((p) => p.phase === phase)
	}

	return (
		<>
			<div className='container mx-auto px-4 py-6'>
				<div className='mb-6'>
					<Button variant='outline' size='sm' onClick={() => navigate(-1)} className='mb-4'>
						<ChevronRight className='mr-2 h-4 w-4 rotate-180' />
						Quay lại
					</Button>
					<div>
						<h1 className='text-3xl font-bold text-gray-900'>Quản lý Đề tài trong Kỳ</h1>
						<p className='mt-0.5 text-xs text-slate-500'>
							{(topicsData?.meta.periodInfo && formatPeriodInfo2(topicsData?.meta.periodInfo)) ||
								'Đang tải...'}
						</p>
					</div>

					<p className='mt-2 text-sm text-gray-600'>Theo dõi và quản lý các đề tài đã nộp trong kỳ học</p>
				</div>

				{/* Filters & Search */}
				<div className='mb-6 flex flex-col gap-4 rounded-lg bg-white p-4 shadow-sm sm:flex-row sm:items-center'>
					<Input
						placeholder='Tìm kiếm theo tên đề tài...'
						value={searchTerm}
						onChange={(e) => onEdit(e.target.value)}
						className='w-full border-gray-300 sm:w-96'
					/>

					<div className='flex items-center gap-3'>
						<Select
							onValueChange={(newValue) => {
								setQueryParams((prev) => ({ ...prev, phase: newValue }))
							}}
						>
							<SelectTrigger className='w-48 border-gray-300'>
								<SelectValue placeholder='Lọc theo pha' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả các pha</SelectItem>
								<SelectItem value='submit_topic'>Nộp đề tài</SelectItem>
								<SelectItem value='open_registration'>Mở đăng ký</SelectItem>
								<SelectItem value='execution'>Thực hiện</SelectItem>
								<SelectItem value='completion'>Hoàn thành</SelectItem>
							</SelectContent>
						</Select>

						<Select
							onValueChange={(newValue) => {
								setQueryParams((prev) => ({ ...prev, status: newValue }))
							}}
						>
							<SelectTrigger className='w-48 border-gray-300'>
								<SelectValue placeholder='Lọc theo trạng thái' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả trạng thái</SelectItem>
								<SelectItem value='draft'>Bản nháp</SelectItem>
								<SelectItem value='submitted'>Đã nộp</SelectItem>
								<SelectItem value='under_review'>Đang xét duyệt</SelectItem>
								<SelectItem value='approved'>Đã duyệt</SelectItem>
								<SelectItem value='rejected'>Bị từ chối</SelectItem>
								<SelectItem value='pending_registration'>Mở đăng ký</SelectItem>
								<SelectItem value='registered'>Đã có đăng ký</SelectItem>
								<SelectItem value='in_progress'>Đang thực hiện</SelectItem>
								<SelectItem value='graded'>Đã chấm điểm</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				{/* Topics Grid */}
				<div className='space-y-4'>
					<TopicsDataTable data={topics} isLoading={isLoading} error={error as ApiError | null} />

					{/* Pagination */}
					{topicsData?.meta && topicsData.meta.totalPages > 1 && (
						<div className='mt-6'>
							<CustomPagination
								meta={topicsData.meta}
								onPageChange={(p) => setQueryParams((prev) => ({ ...prev, page: p }))}
							/>
						</div>
					)}
				</div>
			</div>
		</>
	)
}

export default ManageTopicsInPeriods
