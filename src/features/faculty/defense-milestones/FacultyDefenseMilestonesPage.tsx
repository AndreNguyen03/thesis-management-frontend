// import { useAppSelector } from '@/store'
// import { useGetAllDefenseMilestonesQuery, useGetDefenseMilestoneYearsQuery } from '@/services/milestoneApi'
// import { useState } from 'react'
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
// import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/Button'
// import { Calendar, Clock, MapPin, Users, ChevronRight, Loader2, Filter } from 'lucide-react'
// import { useNavigate } from 'react-router-dom'
// import { Input, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui'
// import { useDebounce } from '@/hooks/useDebounce'
// import { formatPeriodInfoMiniPeriod } from '@/utils/utils'
// import {
// 	CouncilMemberRoleOptions,
// 	type CouncilMemberRole,
// 	type PaginationAllDefenseMilestonesQuery
// } from '@/models/milestone.model'

// export default function FacultyDefenseMilestonesPage() {
// 	const user = useAppSelector((state) => state.auth.user)
// 	const navigate = useNavigate()
// 	const [searchTerm, setSearchTerm] = useState('')

// 	const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'blocked' | 'pending'>('all')
// 	//query params
// 	const [queryParams, setQueryParams] = useState<PaginationAllDefenseMilestonesQuery>({
// 		page: 1,
// 		limit: 10,
// 		search_by: ['title', 'location', 'periodInfo.year'],
// 		query: '',
// 		year: undefined,
// 		sort_by: 'dueDate',
// 		sort_order: 'desc'
// 	})
// 	//endpoint lấy các mốc bảo vệ
// 	const { data: milestonesData, isLoading } = useGetAllDefenseMilestonesQuery(queryParams)
// 	//endpoint lấy combobox option cho năm
// 	const { data: yearOptions, isLoading: isYearOptionsLoading } = useGetDefenseMilestoneYearsQuery()
// 	const setQuerySearch = (val: string) => {
// 		setQueryParams((prev) => ({
// 			...prev,
// 			query: val
// 		}))
// 	}
// 	const debounceOnChange = useDebounce({ onChange: setQuerySearch, duration: 400 })
// 	const handleSearch = (val: string) => {
// 		setSearchTerm(val)
// 		debounceOnChange(val)
// 	}

// 	const getStatusBadge = (milestone: any) => {
// 		if (milestone.isBlock) {
// 			return (
// 				<Badge variant='secondary' className='bg-orange-600'>
// 					Đã khóa
// 				</Badge>
// 			)
// 		}
// 		if (milestone.isPublished) {
// 			return (
// 				<Badge variant='default' className='bg-green-600'>
// 					Đã công bố
// 				</Badge>
// 			)
// 		}
// 		return (
// 			<Badge variant='outline' className='border-blue-600 text-blue-600'>
// 				Chờ xử lý
// 			</Badge>
// 		)
// 	}
// 	const handleYear = (value: string) => {
// 		setQueryParams((prev) => ({
// 			...prev,
// 			year: value === 'Tất cả' ? undefined : value
// 		}))
// 	}
// 	return (
// 		<div className='container mx-auto space-y-6 p-6'>
// 			{/* Header */}
// 			<div className='space-y-2'>
// 				<h1 className='text-3xl font-bold tracking-tight'>Quản lý đợt bảo vệ</h1>
// 				<p className='text-muted-foreground'>Danh sách tất cả các đợt bảo vệ khóa luận của khoa</p>
// 			</div>

// 			{/* Filters & Search */}
// 			<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
// 				<Input
// 					placeholder='Tìm kiếm theo tên đợt bảo vệ, địa điểm...'
// 					value={searchTerm}
// 					onChange={(e) => handleSearch(e.target.value)}
// 					className='max-w-md'
// 				/>

// 				<div className='flex items-center gap-4'>
// 					<Filter className='h-4 w-4 text-muted-foreground' />
// 					{/* Năm học */}
// 					<div className='space-y-3'>
// 						<Select
// 							value={queryParams.year === undefined ? 'Tất cả' : queryParams.year}
// 							onValueChange={(value) => handleYear(value)}
// 						>
// 							<SelectTrigger className='w-full bg-white'>
// 								<SelectValue placeholder='Chọn năm' />
// 							</SelectTrigger>
// 							<SelectContent>
// 								<SelectItem value='Tất cả'>Tất cả</SelectItem>
// 								{yearOptions?.map((y) => (
// 									<SelectItem key={y} value={y}>
// 										{y}
// 									</SelectItem>
// 								))}
// 							</SelectContent>
// 						</Select>
// 					</div>
// 					<div className='flex gap-2'>
// 						<Button
// 							variant={statusFilter === 'all' ? 'default' : 'outline'}
// 							size='sm'
// 							onClick={() => setStatusFilter('all')}
// 						>
// 							Tất cả
// 						</Button>
// 						<Button
// 							variant={statusFilter === 'pending' ? 'default' : 'outline'}
// 							size='sm'
// 							onClick={() => setStatusFilter('pending')}
// 						>
// 							Chờ xử lý
// 						</Button>
// 						<Button
// 							variant={statusFilter === 'published' ? 'default' : 'outline'}
// 							size='sm'
// 							onClick={() => setStatusFilter('published')}
// 						>
// 							Đã công bố
// 						</Button>
// 						<Button
// 							variant={statusFilter === 'blocked' ? 'default' : 'outline'}
// 							size='sm'
// 							onClick={() => setStatusFilter('blocked')}
// 						>
// 							Đã khóa
// 						</Button>
// 					</div>
// 				</div>
// 			</div>

// 			{/* Stats */}
// 			<div className='grid gap-4 md:grid-cols-4'>
// 				<Card className='p-0'>
// 					<CardHeader className='pb-3'>
// 						<CardDescription>Tổng số đợt</CardDescription>
// 						<CardTitle className='text-3xl'>{milestonesData?.data.length || 0}</CardTitle>
// 					</CardHeader>
// 				</Card>
// 				<Card className='p-0'>
// 					<CardHeader className='pb-3'>
// 						<CardDescription>Chờ xử lý</CardDescription>
// 						<CardTitle className='text-3xl text-blue-600'>
// 							{milestonesData?.data.filter((m) => !m.isPublished && !m.isBlock).length || 0}
// 						</CardTitle>
// 					</CardHeader>
// 				</Card>
// 				<Card className='p-0'>
// 					<CardHeader className='pb-3'>
// 						<CardDescription>Đã công bố</CardDescription>
// 						<CardTitle className='text-3xl text-green-600'>
// 							{milestonesData?.data.filter((m) => m.isPublished).length || 0}
// 						</CardTitle>
// 					</CardHeader>
// 				</Card>
// 				<Card className='p-0'>
// 					<CardHeader className='pb-3'>
// 						<CardDescription>Đã khóa</CardDescription>
// 						<CardTitle className='text-3xl text-orange-600'>
// 							{milestonesData?.data.filter((m) => m.isBlock).length || 0}
// 						</CardTitle>
// 					</CardHeader>
// 				</Card>
// 			</div>

// 			{/* Milestones List */}
// 			{isLoading ? (
// 				<div className='flex items-center justify-center py-12'>
// 					<Loader2 className='h-8 w-8 animate-spin text-primary' />
// 				</div>
// 			) : milestonesData && milestonesData.data.length > 0 ? (
// 				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
// 					{milestonesData.data.map((milestone) => (
// 						<Card
// 							key={milestone._id}
// 							className='cursor-pointer p-0 transition-all hover:border-primary/50 hover:shadow-lg'
// 							onClick={() => navigate(`/defense-milestones/${milestone._id}/scoring`)}
// 						>
// 							<CardHeader>
// 								<div className='flex items-start justify-between gap-2'>
// 									<div className='flex-1'>
// 										<CardTitle className='text-lg'>{milestone.title}</CardTitle>
// 										<CardDescription className='mt-1'>
// 											{formatPeriodInfoMiniPeriod(milestone.periodInfo) || 'Kỳ học'}
// 										</CardDescription>
// 									</div>
// 									{getStatusBadge(milestone)}
// 								</div>
// 							</CardHeader>
// 							<CardContent className='space-y-3'>
// 								{/* Date & Time */}
// 								<div className='flex items-center gap-2 text-sm'>
// 									<Calendar className='h-4 w-4 text-muted-foreground' />
// 									<span>
// 										{new Date(milestone.dueDate).toLocaleDateString('vi-VN', {
// 											weekday: 'long',
// 											year: 'numeric',
// 											month: 'long',
// 											day: 'numeric'
// 										})}
// 									</span>
// 								</div>

// 								<div className='flex items-center gap-2 text-sm'>
// 									<Clock className='h-4 w-4 text-muted-foreground' />
// 									<span>
// 										{new Date(milestone.dueDate).toLocaleTimeString('vi-VN', {
// 											hour: '2-digit',
// 											minute: '2-digit'
// 										})}
// 									</span>
// 								</div>

// 								{/* Location */}
// 								{milestone.location && (
// 									<div className='flex items-center gap-2 text-sm'>
// 										<MapPin className='h-4 w-4 text-muted-foreground' />
// 										<span className='line-clamp-1'>{milestone.location}</span>
// 									</div>
// 								)}

// 								{/* Topics & Lecturers Count */}
// 								<div className='flex items-center justify-between text-sm'>
// 									<div className='flex items-center gap-2'>
// 										<Users className='h-4 w-4 text-muted-foreground' />
// 										<span>{milestone.topicsCount || 0} đề tài</span>
// 									</div>
// 									<div className='flex items-center gap-2'>
// 										<Users className='h-4 w-4 text-muted-foreground' />
// 										<span>{milestone.councilMembers || 0} trong hội đồng</span>
// 									</div>
// 								</div>

// 								{/* Council Info */}
// 								{milestone.defenseCouncil && milestone.defenseCouncil.length > 0 ? (
// 									<div className='rounded-md bg-muted/50 p-2 text-xs'>
// 										<div className='font-semibold'>Hội đồng:</div>
// 										<div className='mt-1 space-y-0.5'>
// 											{milestone.defenseCouncil.slice(0, 2).map((member: any, idx: number) => (
// 												<div key={idx} className='flex items-center justify-between'>
// 													<span className='truncate'>{member.fullName}</span>
// 													<Badge variant='outline' className='ml-2 text-xs'>
// 														{
// 															CouncilMemberRoleOptions[member.role as CouncilMemberRole]
// 																.label
// 														}
// 													</Badge>
// 												</div>
// 											))}
// 											{milestone.defenseCouncil.length > 2 && (
// 												<div className='text-muted-foreground'>
// 													+{milestone.defenseCouncil.length - 2} thành viên khác
// 												</div>
// 											)}
// 										</div>
// 									</div>
// 								) : (
// 									<div className='rounded-md bg-muted/50 p-2 text-xs'>
// 										<div className='font-semibold'>Hội đồng:</div>
// 									</div>
// 								)}

// 								{/* Action Button */}
// 								<Button className='mt-2 w-full' variant='outline'>
// 									Quản lý chấm điểm
// 									<ChevronRight className='ml-2 h-4 w-4' />
// 								</Button>
// 							</CardContent>
// 						</Card>
// 					))}
// 				</div>
// 			) : (
// 				<Card className='p-12'>
// 					<div className='text-center'>
// 						<Users className='mx-auto h-12 w-12 text-muted-foreground/50' />
// 						<h3 className='mt-4 text-lg font-semibold'>
// 							{searchTerm || statusFilter !== 'all'
// 								? 'Không tìm thấy đợt bảo vệ nào'
// 								: 'Chưa có đợt bảo vệ nào'}
// 						</h3>
// 						<p className='mt-2 text-sm text-muted-foreground'>
// 							{searchTerm || statusFilter !== 'all'
// 								? 'Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm'
// 								: 'Chưa có đợt bảo vệ nào được tạo trong hệ thống.'}
// 						</p>
// 					</div>
// 				</Card>
// 			)}
// 		</div>
// 	)
// }
