import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Archive, Search, Loader2, CheckCircle2, XCircle, AlertCircle, ChevronLeft } from 'lucide-react'
import { useGetTopicsForArchiveInPeriodQuery, useBulkArchiveTopicsInPeriodMutation } from '@/services/milestoneApi'
import { toast } from 'sonner'
import { CustomPagination } from '@/components/PaginationBar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { GetTopicsForArchiveQuery } from '@/models/milestone.model'

export function PeriodArchiveTopicsPage() {
	const { periodId } = useParams<{ periodId: string }>()
	const navigate = useNavigate()

	const [selectedTopics, setSelectedTopics] = useState<Set<string>>(new Set())
	const [showConfirmDialog, setShowConfirmDialog] = useState(false)
	const [searchTerm, setSearchTerm] = useState('')

	const [query, setQuery] = useState<GetTopicsForArchiveQuery>({
		page: 1,
		limit: 20,
		query: '',
		status: 'all'
	})

	const {
		data: topicsData,
		isLoading,
		refetch
	} = useGetTopicsForArchiveInPeriodQuery(
		{
			periodId: periodId!,
			query
		},
		{
			skip: !periodId
		}
	)

	const [bulkArchive, { isLoading: isArchiving }] = useBulkArchiveTopicsInPeriodMutation()

	// Handle search
	const handleSearch = (value: string) => {
		setSearchTerm(value)
		setTimeout(() => {
			setQuery((prev) => ({ ...prev, query: value, page: 1 }))
		}, 300)
	}

	// Handle toggle topic
	const handleToggleTopic = (topicId: string, canArchive: boolean) => {
		if (!canArchive) return

		setSelectedTopics((prev) => {
			const newSet = new Set(prev)
			if (newSet.has(topicId)) {
				newSet.delete(topicId)
			} else {
				newSet.add(topicId)
			}
			return newSet
		})
	}

	// Handle select all
	const handleSelectAll = () => {
		const eligibleTopics = topicsData?.data.filter((t) => t.canArchive) || []

		if (selectedTopics.size === eligibleTopics.length) {
			setSelectedTopics(new Set())
		} else {
			setSelectedTopics(new Set(eligibleTopics.map((t) => t.topicId)))
		}
	}

	// Handle archive
	const handleArchiveTopics = async () => {
		if (selectedTopics.size === 0) return

		try {
			const result = await bulkArchive({
				periodId: periodId!,
				topicIds: Array.from(selectedTopics)
			}).unwrap()

			toast.success(`Đã lưu ${result.successCount}/${selectedTopics.size} đề tài vào thư viện`, {
				description: result.failedCount > 0 ? `${result.failedCount} đề tài lưu thất bại` : undefined
			})

			if (result.failedCount > 0) {
				console.log('Failed topics:', result.failedTopics)
			}

			setSelectedTopics(new Set())
			setShowConfirmDialog(false)
			refetch()
		} catch (error: any) {
			toast.error('Không thể lưu trữ đề tài', {
				description: error?.data?.message || 'Đã xảy ra lỗi'
			})
		}
	}

	const getStatusBadge = (status: string) => {
		switch (status) {
			case 'graded':
				return <Badge className='bg-green-600'>Đã chấm điểm</Badge>
			case 'assigned_defense':
				return <Badge className='bg-blue-600'>Đã phân công</Badge>
			case 'archived':
				return <Badge variant='secondary'>Đã lưu trữ</Badge>
			default:
				return <Badge variant='outline'>{status}</Badge>
		}
	}

	const getGradeBadge = (gradeText: string) => {
		const colorMap: Record<string, string> = {
			'Xuất sắc': 'bg-purple-600',
			Giỏi: 'bg-blue-600',
			Khá: 'bg-green-600',
			'Trung bình': 'bg-yellow-600',
			Yếu: 'bg-red-600'
		}
		return <Badge className={colorMap[gradeText] || 'bg-gray-600'}>{gradeText}</Badge>
	}

	const eligibleCount = topicsData?.data.filter((t) => t.canArchive).length || 0

	return (
		<div className='container mx-auto space-y-6 p-6'>
			{/* Header */}
			<div className='flex items-center justify-between'>
				<div>
					<Button variant='ghost' size='sm' onClick={() => navigate(-1)} className='mb-2'>
						<ChevronLeft className='mr-2 h-4 w-4' />
						Quay lại
					</Button>
					<h1 className='text-3xl font-bold tracking-tight'>Quản lý lưu trữ đề tài vào thư viện</h1>
					<p className='text-muted-foreground'>Chọn các đề tài đạt yêu cầu để lưu vào thư viện số</p>
				</div>
			</div>

			{/* Filters & Actions */}
			<Card className='p-0'>
				<CardHeader>
					<div className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
						<div className='flex flex-1 items-center gap-3'>
							<div className='relative flex-1'>
								<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
								<Input
									placeholder='Tìm kiếm đề tài...'
									value={searchTerm}
									onChange={(e) => handleSearch(e.target.value)}
									className='pl-10'
								/>
							</div>

							<Select
								value={query.status}
								onValueChange={(value) =>
									setQuery((prev) => ({ ...prev, status: value as any, page: 1 }))
								}
							>
								<SelectTrigger className='w-[180px]'>
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value='all'>Tất cả</SelectItem>
									<SelectItem value='graded'>Đã chấm điểm</SelectItem>
									<SelectItem value='assigned'>Đã phân công</SelectItem>
									<SelectItem value='locked'>Đã khóa điểm</SelectItem>
									<SelectItem value='archived'>Đã lưu trữ</SelectItem>
								</SelectContent>
							</Select>
						</div>

						<div className='flex items-center gap-3'>
							<div className='text-sm text-muted-foreground'>
								Đã chọn: <span className='font-semibold'>{selectedTopics.size}</span> / {eligibleCount}
							</div>

							<Button variant='outline' onClick={handleSelectAll} disabled={eligibleCount === 0}>
								{selectedTopics.size === eligibleCount ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
							</Button>

							<Button
								onClick={() => setShowConfirmDialog(true)}
								disabled={selectedTopics.size === 0 || isArchiving}
							>
								{isArchiving ? (
									<>
										<Loader2 className='mr-2 h-4 w-4 animate-spin' />
										Đang lưu...
									</>
								) : (
									<>
										<Archive className='mr-2 h-4 w-4' />
										Lưu vào thư viện ({selectedTopics.size})
									</>
								)}
							</Button>
						</div>
					</div>
				</CardHeader>
			</Card>

			{/* Topics Table */}
			{isLoading ? (
				<div className='flex items-center justify-center py-12'>
					<Loader2 className='h-8 w-8 animate-spin text-primary' />
				</div>
			) : topicsData && topicsData.data.length > 0 ? (
				<Card className='p-0'>
					<CardContent className='p-0'>
						<div className='overflow-x-auto'>
							<Table>
								<TableHeader>
									<TableRow>
										<TableHead className='w-12'>
											<Checkbox
												checked={selectedTopics.size === eligibleCount && eligibleCount > 0}
												onCheckedChange={handleSelectAll}
												disabled={eligibleCount === 0}
											/>
										</TableHead>
										<TableHead>Đề tài</TableHead>
										<TableHead>Sinh viên</TableHead>
										<TableHead>GVHD</TableHead>
										<TableHead className='text-center'>Điểm</TableHead>
										<TableHead className='text-center'>Xếp loại</TableHead>
										<TableHead className='text-center'>Hội đồng</TableHead>
										<TableHead className='text-center'>Trạng thái</TableHead>
										<TableHead className='text-center'>Tình trạng</TableHead>
									</TableRow>
								</TableHeader>
								<TableBody>
									{topicsData.data.map((topic) => (
										<TableRow key={topic.topicId}>
											<TableCell>
												<TooltipProvider>
													<Tooltip>
														<TooltipTrigger asChild>
															<div>
																<Checkbox
																	checked={selectedTopics.has(topic.topicId)}
																	onCheckedChange={() =>
																		handleToggleTopic(
																			topic.topicId,
																			topic.canArchive
																		)
																	}
																	disabled={!topic.canArchive}
																/>
															</div>
														</TooltipTrigger>
														{!topic.canArchive && (
															<TooltipContent>
																<div className='text-xs'>
																	{topic.archiveBlockers.map((b, i) => (
																		<div key={i}>• {b}</div>
																	))}
																</div>
															</TooltipContent>
														)}
													</Tooltip>
												</TooltipProvider>
											</TableCell>

											<TableCell>
												<div className='max-w-md'>
													<div className='line-clamp-2 font-medium'>{topic.titleVN}</div>
													{topic.titleEng && (
														<div className='line-clamp-1 text-xs italic text-muted-foreground'>
															{topic.titleEng}
														</div>
													)}
												</div>
											</TableCell>

											<TableCell>
												<div className='space-y-1'>
													{topic.students.map((s, i) => (
														<div key={i} className='text-sm'>
															<div className='font-medium'>{s.fullName}</div>
															<div className='text-xs text-muted-foreground'>
																{s.studentCode}
															</div>
														</div>
													))}
												</div>
											</TableCell>

											<TableCell>
												<div className='space-y-1'>
													{topic.lecturers.slice(0, 2).map((l, i) => (
														<div key={i} className='text-sm'>
															{l.fullName}
														</div>
													))}
													{topic.lecturers.length > 2 && (
														<div className='text-xs text-muted-foreground'>
															+{topic.lecturers.length - 2} khác
														</div>
													)}
												</div>
											</TableCell>

											<TableCell className='text-center'>
												{topic.finalScore !== undefined ? (
													<Badge className='bg-blue-600 text-white'>
														{topic.finalScore.toFixed(2)}
													</Badge>
												) : (
													<span className='text-sm text-muted-foreground'>--</span>
												)}
											</TableCell>

											<TableCell className='text-center'>
												{topic.gradeText ? (
													getGradeBadge(topic.gradeText)
												) : (
													<span className='text-sm text-muted-foreground'>--</span>
												)}
											</TableCell>

											<TableCell className='text-center'>
												{topic.councilName ? (
													<div className='text-sm'>{topic.councilName}</div>
												) : (
													<span className='text-sm text-muted-foreground'>--</span>
												)}
											</TableCell>

											<TableCell className='text-center'>
												{getStatusBadge(topic.currentStatus)}
											</TableCell>

											<TableCell className='text-center'>
												{topic.canArchive ? (
													<Badge variant='default' className='bg-green-600'>
														<CheckCircle2 className='mr-1 h-3 w-3' />
														Đạt yêu cầu
													</Badge>
												) : topic.isPublishedToLibrary ? (
													<Badge variant='secondary'>
														<Archive className='mr-1 h-3 w-3' />
														Đã lưu
													</Badge>
												) : (
													<TooltipProvider>
														<Tooltip>
															<TooltipTrigger asChild>
																<Badge variant='destructive'>
																	<XCircle className='mr-1 h-3 w-3' />
																	Chưa đạt
																</Badge>
															</TooltipTrigger>
															<TooltipContent>
																<div className='text-xs'>
																	{topic.archiveBlockers.map((b, i) => (
																		<div key={i}>• {b}</div>
																	))}
																</div>
															</TooltipContent>
														</Tooltip>
													</TooltipProvider>
												)}
											</TableCell>
										</TableRow>
									))}
								</TableBody>
							</Table>
						</div>

						{/* Pagination */}
						{topicsData.meta.totalPages > 1 && (
							<div className='border-t p-4'>
								<CustomPagination
									meta={topicsData.meta}
									onPageChange={(page) => setQuery((prev) => ({ ...prev, page }))}
								/>
							</div>
						)}
					</CardContent>
				</Card>
			) : (
				<Card className='p-12'>
					<div className='text-center'>
						<AlertCircle className='mx-auto h-12 w-12 text-muted-foreground/50' />
						<h3 className='mt-4 text-lg font-semibold'>Không có đề tài nào</h3>
						<p className='mt-2 text-sm text-muted-foreground'>
							Không tìm thấy đề tài phù hợp với bộ lọc hiện tại
						</p>
					</div>
				</Card>
			)}

			{/* Confirm Dialog */}
			<AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
				<AlertDialogContent>
					<AlertDialogHeader>
						<AlertDialogTitle>Xác nhận lưu trữ đề tài</AlertDialogTitle>
						<AlertDialogDescription>
							Bạn sắp lưu {selectedTopics.size} đề tài vào thư viện số.
							<div className='mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3'>
								<div className='flex gap-2'>
									<AlertCircle className='h-5 w-5 flex-shrink-0 text-blue-600' />
									<div className='text-sm text-blue-800'>
										<p className='font-semibold'>Lưu ý:</p>
										<ul className='ml-4 mt-1 list-disc space-y-1'>
											<li>Đề tài sẽ được công khai trong thư viện số</li>
											<li>Kết quả bảo vệ sẽ được lưu vào hồ sơ đề tài</li>
											<li>Nội dung đề tài sẽ được vector hóa để hỗ trợ tìm kiếm AI</li>
										</ul>
									</div>
								</div>
							</div>
						</AlertDialogDescription>
					</AlertDialogHeader>
					<AlertDialogFooter>
						<AlertDialogCancel>Hủy</AlertDialogCancel>
						<AlertDialogAction onClick={handleArchiveTopics}>Xác nhận lưu trữ</AlertDialogAction>
					</AlertDialogFooter>
				</AlertDialogContent>
			</AlertDialog>
		</div>
	)
}
