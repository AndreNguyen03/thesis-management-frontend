import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, MapPin, Users, Loader2 } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetCouncilsQuery } from '@/services/defenseCouncilApi'
import {
	CouncilMemberRoleOptions,
	type CouncilMemberRole,
	type QueryDefenseCouncilsParams
} from '@/models/defenseCouncil.model'
import { formatPeriodInfoMiniPeriod } from '@/utils/utils'
import { CustomPagination } from '@/components/PaginationBar'

export default function LecturerDefenseCouncilsPage() {
	const navigate = useNavigate()
	const location = useLocation()

	const [searchTerm, setSearchTerm] = useState('')

	//query params
	const [queryParams, setQueryParams] = useState<QueryDefenseCouncilsParams>({
		page: 1,
		limit: 10,
		search_by: ['title', 'location', 'periodInfo.year'],
		query: '',
		sort_by: 'dueDate',
		sort_order: 'desc'
	})
	//endpoint lấy các hội dồng trong đợt bảo vệ
	const { data: defenseCouncils, isLoading } = useGetCouncilsQuery(queryParams)

	const debounceOnChange = useDebounce({
		onChange: (val) => {
			setQueryParams((prev) => ({ ...prev, query: val }))
		},
		duration: 400
	})

	const handleSearch = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}
	const handleGotoDetailCouncil = (councilId: string) => {
		navigate(`/defense-councils/${councilId}?from=${encodeURIComponent(location.pathname + location.search)}`)
	}
	console.log('defenseCouncils', defenseCouncils)
	return (
		<div className='container mx-auto space-y-6 p-6 pt-8'>
			{/* Header */}
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold tracking-tight'>Danh sách các hội đồng</h1>
				<p className='text-muted-foreground'>Hiển thị các hội đồng mà giảng viên được phân công</p>
			</div>

			{/* Search Bar */}
			<div className='flex items-center gap-4'>
				<Input
					placeholder='Tìm kiếm theo tên hội đồng, địa điểm...'
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
					className='max-w-md'
				/>
				<div className='ml-auto text-sm text-muted-foreground'>
					{defenseCouncils && `${defenseCouncils.meta.totalItems} đợt bảo vệ`}
				</div>
			</div>

			{/* Milestones List */}
			{isLoading ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			) : defenseCouncils && defenseCouncils.data.length > 0 ? (
				<div className='grid grid-cols-1 gap-4'>
					{defenseCouncils.data.map((council) => (
						<Card
							key={council._id}
							className='cursor-pointer p-0 transition-all hover:border-primary/50 hover:shadow-lg'
							onClick={() => handleGotoDetailCouncil(council._id)}
						>
							<CardHeader>
								<div className='flex items-center gap-2'>
									<div className='flex flex-1 gap-2'>
										<CardTitle className='flex gap-4 text-[15px]'>
											<span className='text-[15px]'>{council.name}</span>
											<span className='text-[15px] font-semibold text-blue-800'>
												{council.defenseMilestone.title}
											</span>
											<span> {formatPeriodInfoMiniPeriod(council.periodInfo) || 'Kỳ học'}</span>
										</CardTitle>
									</div>
									{/* Assignment badge */}
									<div className='flex flex-wrap gap-2 pt-2'>
										{council.yourRoles &&
											council.yourRoles.map((role) => (
												<Badge key={role} variant='outline'>
													{' '}
													{CouncilMemberRoleOptions[role as CouncilMemberRole].label}
												</Badge>
											))}
									</div>
									{/* Status Badges */}
									<div className='flex flex-wrap gap-2 pt-2'>
										{council.isPublished && (
											<Badge variant='default' className='bg-green-600'>
												Đã công bố
											</Badge>
										)}
										{council.isLocked ? (
											<Badge variant='secondary' className='bg-orange-600'>
												Đã khóa
											</Badge>
										) : (
											<Badge variant='secondary' className='bg-orange-200'>
												Chưa khóa bảng điểm
											</Badge>
										)}
									</div>
								</div>
							</CardHeader>
							<CardContent className='space-y-3'>
								{/* Date & Time */}
								<div className='flex items-center gap-4'>
									<div className='flex items-center gap-2 text-sm'>
										<Clock className='h-4 w-4 text-muted-foreground' />
										<span>
											{new Date(council.scheduledDate).toLocaleTimeString('vi-VN', {
												hour: '2-digit',
												minute: '2-digit'
											})}
										</span>
									</div>

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

									{/* Location */}
									{council.location && (
										<div className='flex items-center gap-2 text-sm'>
											<MapPin className='h-4 w-4 text-muted-foreground' />
											<span className='line-clamp-1'>{council.location}</span>
										</div>
									)}

									{/* Topics Count */}
									<div className='flex items-center gap-2 text-sm'>
										<Users className='h-4 w-4 text-muted-foreground' />
										<span>{council.topicsNum || 0} đề tài</span>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
					{isLoading ? (
						<Loader2 className='m-4 h-6 w-6 animate-spin text-primary' />
					) : (
						<CustomPagination
							meta={defenseCouncils?.meta!}
							onPageChange={(page) => setQueryParams((prev) => ({ ...prev, page }))}
						/>
					)}
				</div>
			) : (
				<Card className='p-12'>
					<div className='text-center'>
						<Users className='mx-auto h-12 w-12 text-muted-foreground/50' />
						<h3 className='mt-4 text-lg font-semibold'>Chưa có đợt bảo vệ nào</h3>
						<p className='mt-2 text-sm text-muted-foreground'>
							Bạn chưa được phân công tham gia đợt bảo vệ nào.
						</p>
					</div>
				</Card>
			)}
		</div>
	)
}
