import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Calendar, Clock, MapPin, Users, ChevronRight, Loader2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Input } from '@/components/ui'
import { useDebounce } from '@/hooks/useDebounce'
import { useGetAssignedDefenseMilestonesQuery } from '@/services/milestoneApi'
import { CouncilMemberRoleOptions, type CouncilMemberRole } from '@/models/milestone.model'
import { formatPeriodInfoMiniPeriod } from '@/utils/utils'

export default function LecturerDefenseMilestonesPage() {
	const navigate = useNavigate()
	const [searchTerm, setSearchTerm] = useState('')
	const [debouncedSearch, setDebouncedSearch] = useState('')

	const { data: milestonesData, isLoading } = useGetAssignedDefenseMilestonesQuery({
		search: debouncedSearch
	})

	const debounceOnChange = useDebounce({ onChange: setDebouncedSearch, duration: 400 })

	const handleSearch = (val: string) => {
		setSearchTerm(val)
		debounceOnChange(val)
	}

	return (
		<div className='container mx-auto space-y-6 p-6'>
			{/* Header */}
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold tracking-tight'>Danh sách đợt bảo vệ</h1>
				<p className='text-muted-foreground'>Các đợt bảo vệ khóa luận mà bạn được phân công tham gia</p>
			</div>

			{/* Search Bar */}
			<div className='flex items-center gap-4'>
				<Input
					placeholder='Tìm kiếm theo tên đợt bảo vệ, địa điểm...'
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
					className='max-w-md'
				/>
				<div className='ml-auto text-sm text-muted-foreground'>
					{milestonesData && `${milestonesData.length} đợt bảo vệ`}
				</div>
			</div>

			{/* Milestones List */}
			{isLoading ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			) : milestonesData && milestonesData.length > 0 ? (
				<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
					{milestonesData.map((milestone) => (
						<Card
							key={milestone._id}
							className='cursor-pointer p-0 transition-all hover:border-primary/50 hover:shadow-lg'
							onClick={() => navigate(`/defense-milestones/${milestone._id}/scoring`)}
						>
							<CardHeader>
								<div className='flex items-start justify-between gap-2'>
									<div className='flex-1'>
										<CardTitle className='text-lg'>{milestone.title}</CardTitle>
										<CardDescription className='mt-1'>
											{formatPeriodInfoMiniPeriod(milestone.periodInfo) || 'Kỳ học'}
										</CardDescription>
									</div>
									{CouncilMemberRoleOptions[milestone.myRole as CouncilMemberRole].label}
								</div>
							</CardHeader>
							<CardContent className='space-y-3'>
								{/* Date & Time */}
								<div className='flex items-center gap-2 text-sm'>
									<Calendar className='h-4 w-4 text-muted-foreground' />
									<span>
										{new Date(milestone.dueDate).toLocaleDateString('vi-VN', {
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
										{new Date(milestone.dueDate).toLocaleTimeString('vi-VN', {
											hour: '2-digit',
											minute: '2-digit'
										})}
									</span>
								</div>

								{/* Location */}
								{milestone.location && (
									<div className='flex items-center gap-2 text-sm'>
										<MapPin className='h-4 w-4 text-muted-foreground' />
										<span className='line-clamp-1'>{milestone.location}</span>
									</div>
								)}

								{/* Topics Count */}
								<div className='flex items-center gap-2 text-sm'>
									<Users className='h-4 w-4 text-muted-foreground' />
									<span>{milestone.topicsCount || 0} đề tài</span>
								</div>

								{/* Status Badges */}
								<div className='flex flex-wrap gap-2 pt-2'>
									{milestone.isPublished && (
										<Badge variant='default' className='bg-green-600'>
											Đã công bố
										</Badge>
									)}
									{milestone.isBlock ? (
										<Badge variant='secondary' className='bg-orange-600'>
											Đã khóa
										</Badge>
									) : (
										<Badge variant='secondary' className='bg-orange-200'>
											Chưa khóa bảng điểm
										</Badge>
									)}
								</div>

								{/* Action Button */}
								<Button className='mt-2 w-full' variant='outline'>
									Xem chi tiết
									<ChevronRight className='ml-2 h-4 w-4' />
								</Button>
							</CardContent>
						</Card>
					))}
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
