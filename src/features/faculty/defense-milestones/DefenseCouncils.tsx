import { useAppSelector } from '@/store'
import { useGetDefenseMilestoneDetailByIdQuery } from '@/services/milestoneApi'
import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Calendar, Clock, Users, ChevronRight, Loader2, Filter } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { Input } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'
import { formatPeriodInfo2 } from '@/utils/utils'

import { useGetPeriodDetailQuery } from '@/services/periodApi'
import { useGetCouncilsQuery } from '@/services/defenseCouncilApi'
import type { QueryDefenseCouncilsParams, ResDefenseCouncil } from '@/models/defenseCouncil.model'
import CreateDefenseCouncilForm from './CreateDefenseCouncilForm'

export default function DefenseCouncils() {
	const user = useAppSelector((state) => state.auth.user)
	const { periodId, templateId } = useParams()
	const navigate = useNavigate()
	const [searchTerm, setSearchTerm] = useState('')
	const [isNewDefenseCouncil, setIsNewDefenseCouncil] = useState(false)
	const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'blocked' | 'pending'>('all')
	//query params
	const [queryParams, setQueryParams] = useState<QueryDefenseCouncilsParams>({
		page: 1,
		limit: 10,
		search_by: ['title', 'location', 'periodInfo.year'],
		query: '',
		milestoneTemplateId: templateId,
		sort_by: 'dueDate',
		sort_order: 'desc'
	})
	//endpoint lấy các hội dồng trong đợt bảo vệ
	const { data: defenseCouncils, isLoading } = useGetCouncilsQuery(queryParams)
	const setQuerySearch = (val: string) => {
		setQueryParams((prev) => ({
			...prev,
			query: val
		}))
	}
	//endpoint lấy thông tin của kì hiện tại
	const {
		data: periodDetail,
		isLoading: isPeriodDetailLoading,
		error: periodError
	} = useGetPeriodDetailQuery(periodId || '', {
		skip: !periodId
	})
	//enpoitn lấy thông tin của đợt bảo vệ hiện tại
	const { data: defenseMilestoneDetail } = useGetDefenseMilestoneDetailByIdQuery(
		{ milestoneTemplateId: templateId || '' },
		{ skip: !templateId }
	)
	const debounceOnChange = useDebounce({ onChange: setQuerySearch, duration: 400 })
	const handleSearch = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	const getStatusBadge = (milestone: any) => {
		if (milestone.isBlock) {
			return (
				<Badge variant='secondary' className='bg-orange-600'>
					Đã khóa
				</Badge>
			)
		}
		if (milestone.isPublished) {
			return (
				<Badge variant='default' className='bg-green-600'>
					Đã công bố
				</Badge>
			)
		}
		return (
			<Badge variant='outline' className='border-blue-600 text-blue-600'>
				Chờ xử lý
			</Badge>
		)
	}
	const handleYear = (value: string) => {
		setQueryParams((prev) => ({
			...prev,
			year: value === 'Tất cả' ? undefined : value
		}))
	}
	return (
		<div className='container mx-auto space-y-6 p-6'>
			{/* Header */}
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold tracking-tight'>Quản lý các hội đồng bảo vệ</h1>
				<p className='text-muted-foreground'>
					Danh sách tất cả hội đồng bảo vệ trong đợt{' '}
					<span className='font-semibold text-blue-700'>{defenseMilestoneDetail?.title}</span>
				</p>
				<p>
					{periodDetail ? (
						<span className='font-semibold text-blue-700'>{formatPeriodInfo2(periodDetail)}</span>
					) : (
						'Đang tải...'
					)}
				</p>
			</div>

			{/* Filters & Search */}
			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
				<Input
					placeholder='Tìm kiếm theo tên đợt bảo vệ, địa điểm...'
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
					className='max-w-md'
				/>

				<div className='flex items-center gap-4'>
					<Filter className='h-4 w-4 text-muted-foreground' />
					{/* Năm học */}
					{/* <div className='space-y-3'>
						<Select
							value={queryParams.year === undefined ? 'Tất cả' : queryParams.year}
							onValueChange={(value) => handleYear(value)}
						>
							<SelectTrigger className='w-full bg-white'>
								<SelectValue placeholder='Chọn năm' />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='Tất cả'>Tất cả</SelectItem>
								{yearOptions?.map((y) => (
									<SelectItem key={y} value={y}>
										{y}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div> */}
					<div className='flex gap-2'>
						<Button
							variant={statusFilter === 'all' ? 'default' : 'outline'}
							size='sm'
							onClick={() => setStatusFilter('all')}
						>
							Tất cả
						</Button>
						<Button
							variant={statusFilter === 'pending' ? 'default' : 'outline'}
							size='sm'
							onClick={() => setStatusFilter('pending')}
						>
							Chờ xử lý
						</Button>
						<Button
							variant={statusFilter === 'published' ? 'default' : 'outline'}
							size='sm'
							onClick={() => setStatusFilter('published')}
						>
							Đã công bố
						</Button>
						<Button
							variant={statusFilter === 'blocked' ? 'default' : 'outline'}
							size='sm'
							onClick={() => setStatusFilter('blocked')}
						>
							Đã khóa
						</Button>
					</div>
				</div>
			</div>

			{/* Stats */}
			{/* <div className='grid gap-4 md:grid-cols-4'>
				<Card className='p-0'>
					<CardHeader className='pb-3'>
						<CardDescription>Tổng số đợt</CardDescription>
						<CardTitle className='text-3xl'>{milestonesData?.data.length || 0}</CardTitle>
					</CardHeader>
				</Card>
				<Card className='p-0'>
					<CardHeader className='pb-3'>
						<CardDescription>Chờ xử lý</CardDescription>
						<CardTitle className='text-3xl text-blue-600'>
							{milestonesData?.data.filter((m) => !m.isPublished && !m.isBlock).length || 0}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className='p-0'>
					<CardHeader className='pb-3'>
						<CardDescription>Đã công bố</CardDescription>
						<CardTitle className='text-3xl text-green-600'>
							{milestonesData?.data.filter((m) => m.isPublished).length || 0}
						</CardTitle>
					</CardHeader>
				</Card>
				<Card className='p-0'>
					<CardHeader className='pb-3'>
						<CardDescription>Đã khóa</CardDescription>
						<CardTitle className='text-3xl text-orange-600'>
							{milestonesData?.data.filter((m) => m.isBlock).length || 0}
						</CardTitle>
					</CardHeader>
				</Card>
			</div> */}

			{/* Milestones List */}
			{isLoading ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			) : defenseCouncils && Array.isArray(defenseCouncils.data) && defenseCouncils.data.length > 0 ? (
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{defenseCouncils.data.map((council: ResDefenseCouncil) => (
						<Card
							key={council.milestoneTemplateId + council.name}
							className='cursor-pointer p-0 transition-all hover:border-primary/50 hover:shadow-lg'
						>
							<CardHeader>
								<div className='flex items-start justify-between gap-2'>
									<div className='flex-1'>
										<CardTitle className='text-lg'>{council.name}</CardTitle>
										<CardDescription className='mt-1'>{council.location}</CardDescription>
									</div>
									{council.isCompleted ? (
										<Badge variant='secondary' className='bg-green-600'>
											Đã hoàn thành
										</Badge>
									) : council.isPublished ? (
										<Badge variant='default' className='bg-blue-600'>
											Đã công bố
										</Badge>
									) : (
										<Badge variant='outline' className='border-blue-600 text-blue-600'>
											Chờ xử lý
										</Badge>
									)}
								</div>
							</CardHeader>
							<CardContent className='space-y-3'>
								{/* Date & Time */}
								<div className='flex items-center gap-2 text-sm'>
									<Calendar className='h-4 w-4 text-muted-foreground' />
									<span>
										{new Date(council.scheduledDate).toLocaleDateString('vi-VN', {
											weekday: 'long',
											year: 'numeric',
											month: 'long',
											day: 'numeric'
										})}
									</span>
								</div>
								<div className='flex items-center gap-2 text-sm'>
									<Clock className='h-4 w-4 text-muted-foreground' />
									<span>
										{new Date(council.scheduledDate).toLocaleTimeString('vi-VN', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>
								{/* Topics Count */}
								<div className='flex items-center gap-2 text-sm'>
									<Users className='h-4 w-4 text-muted-foreground' />
									<span>{council.topicsNum || 0} đề tài</span>
								</div>
								{/* Created By */}
								<div className='flex items-center gap-2 text-sm'>
									<span className='font-semibold'>Người tạo:</span>
									<span>{council.createdBy.fullName}</span>
								</div>
								<div className='flex flex-wrap justify-center gap-2'>
									<Button
										className='mt-2 w-fit'
										variant='outline'
										onClick={() =>
											navigate(`/defense-milestones/${council.milestoneTemplateId}/scoring`)
										}
									>
										Quản lý chấm điểm
										<ChevronRight className='ml-2 h-4 w-4' />
									</Button>
									<Button
										className='mt-2 w-fit'
										variant='outline'
										onClick={() =>
											navigate(`/period/${periodId}/defense-milestones-in-period/${council.milestoneTemplateId}/manage-council-assignment/${council._id}`)
										}
									>
										Phân công hội đồng
										<ChevronRight className='ml-2 h-4 w-4' />
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			) : (
				!isNewDefenseCouncil && (
					<Card className='p-12'>
						<div className='text-center'>
							<Users className='mx-auto h-12 w-12 text-muted-foreground/50' />
							<h3 className='mt-4 text-lg font-semibold'>
								{searchTerm || statusFilter !== 'all'
									? 'Không tìm thấy hội đồng nào'
									: 'Chưa có hội đồng nào'}
							</h3>
							<p className='mt-2 text-sm text-muted-foreground'>
								{searchTerm || statusFilter !== 'all'
									? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
									: 'Chưa có hội đồng nào được tạo trong hệ thống.'}
							</p>
							{searchTerm || statusFilter !== 'all' ? (
								''
							) : (
								<span
									className='cursor-pointer text-blue-700 hover:font-semibold hover:underline'
									onClick={() => setIsNewDefenseCouncil(true)}
								>
									Tạo hội đồng
								</span>
							)}
						</div>
					</Card>
				)
			)}
			{isNewDefenseCouncil && (
				<CreateDefenseCouncilForm
					milestoneTemplateId={templateId || ''}
					onCancel={() => setIsNewDefenseCouncil(false)}
					onSuccess={() => {
						setIsNewDefenseCouncil(false)
						//refetch list
						setQueryParams((prev) => ({
							...prev
						}))
					}}
				/>
			)}
		</div>
	)
}
