import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Archive, Eye, EyeOff, CheckCircle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@/components/ui/Dialog'
import { toast } from 'sonner'
import {
	useGetTopicsInDefenseMilestoneForArchiveQuery,
	useBulkArchiveTopicsMutation,
	useBulkHideTopicsMutation
} from '@/services/milestoneApi'
import { Skeleton } from '@/components/ui/skeleton'

interface TopicItem {
	topicId: string
	titleVN: string
	titleEng: string
	students: Array<{
		userId: string
		fullName: string
		studentCode?: string
	}>
	lecturers: Array<{
		userId: string
		fullName: string
		title: string
	}>
	finalScore?: number
	gradeText?: string
	isScored: boolean
	isLocked: boolean
	isPublishedToLibrary: boolean
	isHiddenInLibrary: boolean
	currentStatus: string
	councilName?: string
	defenseDate?: Date
	hasFullDocuments: boolean
}

export function ManageTopicsInDefenseMilestone() {
	const { milestoneTemplateId } = useParams<{ milestoneTemplateId: string; periodId: string }>()
	const navigate = useNavigate()

	// State
	const [selectedTopics, setSelectedTopics] = useState<string[]>([])
	const [filterLibraryStatus, setFilterLibraryStatus] = useState<string>('all')
	const [filterScored, setFilterScored] = useState<string>('all')
	const [searchText, setSearchText] = useState('')
	const [showArchiveModal, setShowArchiveModal] = useState(false)
	const [showHideModal, setShowHideModal] = useState(false)
	const [hideAction, setHideAction] = useState<'hide' | 'unhide'>('hide')

	// Build query
	const query: any = {}
	if (filterLibraryStatus === 'in-library') query.isInLibrary = true
	else if (filterLibraryStatus === 'not-in-library') query.isInLibrary = false
	if (filterScored === 'scored') query.isScored = true
	else if (filterScored === 'not-scored') query.isScored = false
	if (searchText) query.search = searchText

	// API Hooks
	const { data, isLoading, refetch } = useGetTopicsInDefenseMilestoneForArchiveQuery({
		milestoneTemplateId: milestoneTemplateId!,
		query
	})

	const [bulkArchive, { isLoading: isArchiving }] = useBulkArchiveTopicsMutation()
	const [bulkHide, { isLoading: isHiding }] = useBulkHideTopicsMutation()

	const topics: TopicItem[] = data?.topics || []
	const total = data?.total || 0

	// Handlers
	const handleSelectAll = (checked: boolean) => {
		if (checked) {
			setSelectedTopics(topics.map((t) => t.topicId))
		} else {
			setSelectedTopics([])
		}
	}

	const handleSelectTopic = (topicId: string, checked: boolean) => {
		if (checked) {
			setSelectedTopics([...selectedTopics, topicId])
		} else {
			setSelectedTopics(selectedTopics.filter((id) => id !== topicId))
		}
	}

	const handleArchive = async () => {
		if (selectedTopics.length === 0) {
			toast.error('Vui lòng chọn ít nhất 1 đề tài')
			return
		}

		try {
			const result = await bulkArchive({ topicIds: selectedTopics }).unwrap()
			toast.success(result.message)
			if (result.failedTopics && result.failedTopics.length > 0) {
				result.failedTopics.forEach((failed: any) => {
					toast.warning(`${failed.topicId}: ${failed.reason}`)
				})
			}
			setShowArchiveModal(false)
			setSelectedTopics([])
			refetch()
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra khi lưu đề tài')
		}
	}

	const handleHide = async () => {
		if (selectedTopics.length === 0) {
			toast.error('Vui lòng chọn ít nhất 1 đề tài')
			return
		}

		try {
			const result = await bulkHide({
				topicIds: selectedTopics,
				isHidden: hideAction === 'hide'
			}).unwrap()
			toast.success(result.message)
			setShowHideModal(false)
			setSelectedTopics([])
			refetch()
		} catch (error: any) {
			toast.error(error?.data?.message || 'Có lỗi xảy ra')
		}
	}

	const getStatusBadge = (topic: TopicItem) => {
		if (!topic.isScored) {
			return (
				<Badge variant='outline' className='bg-yellow-50 text-yellow-700'>
					Chưa chấm
				</Badge>
			)
		}
		if (topic.isPublishedToLibrary && !topic.isHiddenInLibrary) {
			return (
				<Badge variant='outline' className='bg-green-50 text-green-700'>
					Trong thư viện
				</Badge>
			)
		}
		if (topic.isPublishedToLibrary && topic.isHiddenInLibrary) {
			return (
				<Badge variant='outline' className='bg-gray-50 text-gray-700'>
					Đã ẩn
				</Badge>
			)
		}
		return (
			<Badge variant='outline' className='bg-blue-50 text-blue-700'>
				Đã chấm
			</Badge>
		)
	}

	const canArchiveSelected = () => {
		const selected = topics.filter((t) => selectedTopics.includes(t.topicId))
		return selected.some((t) => t.isScored && !t.isPublishedToLibrary && (t.finalScore ?? 0) >= 5.5)
	}

	return (
		<div className='container mx-auto py-6'>
			{/* Header */}
			<div className='mb-6 flex items-center justify-between'>
				<div className='flex items-center gap-3'>
					<Button variant='ghost' size='icon' onClick={() => navigate(-1)}>
						<ArrowLeft className='h-5 w-5' />
					</Button>
					<div>
						<h1 className='text-2xl font-bold'>Quản lý lưu trữ đề tài</h1>
						<p className='text-sm text-muted-foreground'>Chọn đề tài đạt yêu cầu để lưu vào thư viện số</p>
					</div>
				</div>
			</div>

			{/* Filters */}
			<Card className='mb-6 p-4'>
				<div className='grid grid-cols-1 gap-4 md:grid-cols-4'>
					<div>
						<label className='mb-2 block text-sm font-medium'>Tìm kiếm</label>
						<Input
							placeholder='Tên đề tài...'
							value={searchText}
							onChange={(e) => setSearchText(e.target.value)}
						/>
					</div>
					<div>
						<label className='mb-2 block text-sm font-medium'>Trạng thái chấm điểm</label>
						<Select value={filterScored} onValueChange={setFilterScored}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả</SelectItem>
								<SelectItem value='scored'>Đã chấm</SelectItem>
								<SelectItem value='not-scored'>Chưa chấm</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<label className='mb-2 block text-sm font-medium'>Trạng thái thư viện</label>
						<Select value={filterLibraryStatus} onValueChange={setFilterLibraryStatus}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='all'>Tất cả</SelectItem>
								<SelectItem value='in-library'>Trong thư viện</SelectItem>
								<SelectItem value='not-in-library'>Chưa lưu</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div className='flex items-end'>
						<Button variant='outline' onClick={refetch} className='w-full'>
							<Filter className='mr-2 h-4 w-4' />
							Làm mới
						</Button>
					</div>
				</div>
			</Card>

			{/* Actions */}
			<div className='mb-4 flex items-center justify-between'>
				<div className='flex items-center gap-2'>
					<Checkbox
						checked={selectedTopics.length === topics.length && topics.length > 0}
						onCheckedChange={handleSelectAll}
					/>
					<span className='text-sm text-muted-foreground'>
						Đã chọn {selectedTopics.length}/{total} đề tài
					</span>
				</div>
				<div className='flex gap-2'>
					<Button
						variant='outline'
						size='sm'
						disabled={selectedTopics.length === 0 || !canArchiveSelected()}
						onClick={() => setShowArchiveModal(true)}
					>
						<Archive className='mr-2 h-4 w-4' />
						Lưu vào thư viện ({selectedTopics.length})
					</Button>
					<Button
						variant='outline'
						size='sm'
						disabled={selectedTopics.length === 0}
						onClick={() => {
							setHideAction('hide')
							setShowHideModal(true)
						}}
					>
						<EyeOff className='mr-2 h-4 w-4' />
						Ẩn ({selectedTopics.length})
					</Button>
					<Button
						variant='outline'
						size='sm'
						disabled={selectedTopics.length === 0}
						onClick={() => {
							setHideAction('unhide')
							setShowHideModal(true)
						}}
					>
						<Eye className='mr-2 h-4 w-4' />
						Hiện ({selectedTopics.length})
					</Button>
				</div>
			</div>

			{/* Topics List */}
			{isLoading ? (
				<div className='space-y-3'>
					{[1, 2, 3, 4, 5].map((i) => (
						<Skeleton key={i} className='h-32 w-full' />
					))}
				</div>
			) : topics.length === 0 ? (
				<Card className='p-12 text-center'>
					<p className='text-muted-foreground'>Không tìm thấy đề tài nào</p>
				</Card>
			) : (
				<div className='space-y-3'>
					{topics.map((topic) => (
						<Card key={topic.topicId} className='p-4 transition-shadow hover:shadow-md'>
							<div className='flex items-start gap-4'>
								<Checkbox
									checked={selectedTopics.includes(topic.topicId)}
									onCheckedChange={(checked) => handleSelectTopic(topic.topicId, checked as boolean)}
									disabled={
										!topic.isScored ||
										(topic.finalScore !== undefined &&
											topic.finalScore < 5.5 &&
											!topic.isPublishedToLibrary)
									}
								/>
								<div className='flex-1'>
									<div className='mb-2 flex items-start justify-between'>
										<div className='flex-1'>
											<h3 className='mb-1 font-semibold text-foreground'>{topic.titleVN}</h3>
											<p className='text-sm italic text-muted-foreground'>{topic.titleEng}</p>
										</div>
										<div className='flex gap-2'>{getStatusBadge(topic)}</div>
									</div>

									<div className='mb-2 grid grid-cols-2 gap-4 text-sm'>
										<div>
											<span className='font-medium'>Sinh viên: </span>
											<span className='text-muted-foreground'>
												{topic.students.map((s) => s.fullName).join(', ')}
											</span>
										</div>
										<div>
											<span className='font-medium'>GVHD: </span>
											<span className='text-muted-foreground'>
												{topic.lecturers.map((l) => `${l.title} ${l.fullName}`).join(', ')}
											</span>
										</div>
										<div>
											<span className='font-medium'>Hội đồng: </span>
											<span className='text-muted-foreground'>{topic.councilName || 'N/A'}</span>
										</div>
										{topic.isScored && (
											<div>
												<span className='font-medium'>Điểm: </span>
												<span
													className={`font-semibold ${
														(topic.finalScore ?? 0) >= 5.5
															? 'text-green-600'
															: 'text-red-600'
													}`}
												>
													{topic.finalScore?.toFixed(2) || 'N/A'}
												</span>
												{topic.gradeText && (
													<span className='ml-2 text-muted-foreground'>
														({topic.gradeText})
													</span>
												)}
											</div>
										)}
									</div>

									<div className='flex items-center gap-4 text-xs text-muted-foreground'>
										<div className='flex items-center gap-1'>
											{topic.hasFullDocuments ? (
												<>
													<CheckCircle className='h-3 w-3 text-green-500' />
													<span>Có đầy đủ tài liệu</span>
												</>
											) : (
												<>
													<span className='text-orange-500'>⚠</span>
													<span>Thiếu tài liệu</span>
												</>
											)}
										</div>
										{!topic.isScored && <span className='text-yellow-600'>Chưa chấm điểm</span>}
										{topic.isScored && (topic.finalScore ?? 0) < 5.5 && (
											<span className='text-red-600'>Chưa đạt điểm yêu cầu (≥ 5.5)</span>
										)}
									</div>
								</div>
							</div>
						</Card>
					))}
				</div>
			)}

			{/* Archive Confirmation Modal */}
			<Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Xác nhận lưu đề tài vào thư viện</DialogTitle>
						<DialogDescription>
							Bạn đang lưu {selectedTopics.length} đề tài vào thư viện số. Chỉ những đề tài đạt điểm ≥ 5.5
							và có đầy đủ tài liệu mới được lưu trữ.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant='outline' onClick={() => setShowArchiveModal(false)}>
							Hủy
						</Button>
						<Button onClick={handleArchive} disabled={isArchiving}>
							{isArchiving ? 'Đang xử lý...' : 'Xác nhận lưu'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Hide/Unhide Confirmation Modal */}
			<Dialog open={showHideModal} onOpenChange={setShowHideModal}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{hideAction === 'hide' ? 'Xác nhận ẩn đề tài' : 'Xác nhận hiện đề tài'}
						</DialogTitle>
						<DialogDescription>
							{hideAction === 'hide'
								? `Bạn đang ẩn ${selectedTopics.length} đề tài khỏi thư viện. Đề tài vẫn được lưu trong hệ thống nhưng sẽ không hiển thị với người dùng.`
								: `Bạn đang hiện lại ${selectedTopics.length} đề tài trong thư viện.`}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant='outline' onClick={() => setShowHideModal(false)}>
							Hủy
						</Button>
						<Button onClick={handleHide} disabled={isHiding}>
							{isHiding ? 'Đang xử lý...' : 'Xác nhận'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	)
}
