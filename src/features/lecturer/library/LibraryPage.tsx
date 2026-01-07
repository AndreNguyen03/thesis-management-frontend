import { useState, useEffect, useRef } from 'react'
import {
	Search,
	Filter,
	Star,
	Download,
	Eye,
	BookOpen,
	ArrowUpRight,
	Loader2,
	FileText,
	User,
	Database
} from 'lucide-react'

import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback } from '@/components/ui/Avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog'
import { Checkbox } from '@/components/ui/checkbox'
import { usePageBreadcrumb } from '@/hooks'
import { useAdvanceSearchTopicsInLibraryQuery } from '@/services/topicVectorApi'
import type { RequestGetTopicsInAdvanceSearch } from '@/models/topicVector.model'
import type { TopicInLibrary } from '@/models'
import { stripHtml } from '@/utils/lower-case-html'
import { useGetMajorComboboxQuery, useGetYearComboboxQuery } from '@/services/topicApi'
import { useLogTopicInteractionMutation } from '@/services/topic-interactionApi'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import DOMPurify from 'dompurify'
import { downloadFileWithURL } from '@/lib/utils'
import Evaluation from './Evaluation'
import { useGetTopicStatsQuery } from '@/services/ratingApi'

// --- TYPES ---
interface DocumentLinks {
	report: string
	sourceCode?: string
	dataset?: string
}

interface Review {
	id: number
	user: string
	avatar?: string
	rating: number
	comment: string
	date: string
}

interface Thesis {
	id: string
	titleVN: string
	titleEng: string
	abstract: string
	year: number
	major: { code: string; name: string }
	fields: string[]
	supervisor: { name: string; avatar?: string }
	students: string[]
	stats: {
		views: number
		downloads: number
		rating: number
		reviews: number
	}
	documents: DocumentLinks
	reviews: Review[]
}
// --- HELPER: Color Generator ---
// Hash function to convert majorId to consistent color index
const hashMajorId = (majorId: string): number => {
	let hash = 0
	for (let i = 0; i < majorId.length; i++) {
		hash = majorId.charCodeAt(i) + ((hash << 5) - hash)
	}
	return Math.abs(hash) % 10 // 10 colors
}

const getMajorColor = (majorId: string) => {
	const colorIndex = hashMajorId(majorId)
	switch (colorIndex) {
		case 0:
			return 'bg-blue-50 text-blue-700 border-blue-200'
		case 1:
			return 'bg-emerald-50 text-emerald-700 border-emerald-200'
		case 2:
			return 'bg-orange-50 text-orange-700 border-orange-200'
		case 3:
			return 'bg-purple-50 text-purple-700 border-purple-200'
		case 4:
			return 'bg-pink-50 text-pink-700 border-pink-200'
		case 5:
			return 'bg-indigo-50 text-indigo-700 border-indigo-200'
		case 6:
			return 'bg-teal-50 text-teal-700 border-teal-200'
		case 7:
			return 'bg-cyan-50 text-cyan-700 border-cyan-200'
		case 8:
			return 'bg-amber-50 text-amber-700 border-amber-200'
		case 9:
			return 'bg-rose-50 text-rose-700 border-rose-200'
		default:
			return 'bg-slate-50 text-slate-700 border-slate-200'
	}
}

const getStripColor = (indx: number) => {
	switch (indx) {
		case 0:
			return 'bg-blue-500'
		default:
			return 'bg-green-500'
	}
}
// --- COMPONENT: LIBRARY CARD ---
const LibraryCard = ({ thesis, index }: { thesis: TopicInLibrary; index: number }) => {
	return (
		<Card className='group flex h-full flex-col border-slate-200 p-0 transition-all duration-300 hover:shadow-lg'>
			{/* Header Strip */}
			<div
				className={`h-2 w-full rounded-t-xl ${index <= 4 ? getStripColor(index) : getStripColor(Math.floor(index / 2))}`}
			/>

			<CardHeader className='pb-3 pt-5'>
				<div className='mb-2 flex items-start justify-between'>
					<Badge variant='outline' className={`${getMajorColor(thesis.major._id)} font-medium`}>
						{thesis.major.name}
					</Badge>
					<span className='rounded bg-slate-50 px-2 py-1 font-mono text-xs text-slate-400'>
						{thesis.year}
					</span>
				</div>

				<h3
					className='line-clamp-2 text-lg font-bold leading-snug text-slate-800 transition-colors group-hover:text-primary'
					title={thesis.titleVN}
				>
					{thesis.titleVN}
				</h3>
				<p className='mt-1 line-clamp-1 text-xs font-medium italic text-slate-500'>{thesis.titleEng}</p>
			</CardHeader>

			<CardContent className='flex-1 space-y-4'>
				{/* Abstract snippet */}
				<p className='line-clamp-3 text-sm leading-relaxed text-slate-600'>{stripHtml(thesis.description)}</p>

				{/* Tags */}
				<div className='flex flex-wrap gap-1.5'>
					{thesis.fields.map((field) => (
						<Badge
							key={field.name}
							variant='secondary'
							className='bg-slate-100 text-[10px] font-normal text-slate-600 hover:bg-slate-200'
						>
							#{field.name}
						</Badge>
					))}
				</div>

				{/* Authors */}
				<div className='flex items-center gap-3 border-t border-slate-50 pt-2'>
					<div className='flex -space-x-2'>
						{thesis.studentsRegistered.map((st, idx) => (
							<Avatar key={idx} className='h-6 w-6 border-2 border-white ring-1 ring-slate-100'>
								<AvatarFallback className='bg-slate-200 text-[9px] text-slate-600'>
									{st.fullName.charAt(0)}
								</AvatarFallback>
							</Avatar>
						))}
					</div>
					<span className='text-xs text-slate-500'>
						HD:{' '}
						<span className='font-medium text-slate-700'>
							{thesis.lecturers.map((l) => ` ${l.fullName}`).join(', ')}
						</span>
					</span>
				</div>
			</CardContent>

			<CardFooter className='flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-6 py-3'>
				{/* Stats */}
				<div className='flex gap-4 text-xs font-medium text-slate-500'>
					<div className='flex items-center gap-1'>
						<Eye className='h-3.5 w-3.5' /> {thesis.stats.views}
					</div>
					<div className='flex items-center gap-1'>
						<Download className='h-3.5 w-3.5' /> {thesis.stats.downloads}
					</div>
					<div className='flex items-center gap-1 text-amber-500'>
						<Star className='h-3.5 w-3.5 fill-current' /> {thesis.stats.averageRating.toFixed(1)}
					</div>
				</div>
				<Dialog>
					<DialogTrigger asChild>
						<Button
							size='sm'
							variant='ghost'
							className='h-8 hover:bg-white hover:text-primary hover:shadow-sm'
						>
							Chi tiết <ArrowUpRight className='ml-1 h-3.5 w-3.5' />
						</Button>
					</DialogTrigger>
					<DetailDialogContent thesis={thesis} />
				</Dialog>
			</CardFooter>
		</Card>
	)
}

// --- COMPONENT: DETAIL DIALOG CONTENT ---
const DetailDialogContent = ({ thesis }: { thesis: TopicInLibrary }) => {
	const [loading, setLoading] = useState(false)
	const [logTopicInteraction] = useLogTopicInteractionMutation()
	const viewTimerRef = useRef<NodeJS.Timeout | null>(null)
	const hasLoggedView = useRef(false)

	//endpoint lấy các đánh giá
	const { data: topicStats, isLoading: isLoadingTopicStats } = useGetTopicStatsQuery(thesis._id)

	// Chỉ tính lượt xem khi người dùng xem đề tài ít nhất 2 phút
	useEffect(() => {
		// Đặt timer 2 phút (120000ms)
		viewTimerRef.current = setTimeout(() => {
			if (!hasLoggedView.current) {
				logTopicInteraction({
					topicId: thesis._id,
					action: 'view'
				})
				hasLoggedView.current = true
			}
		}, 120000) // 2 phút

		// Cleanup: Hủy timer khi component unmount (đóng dialog trước 2 phút)
		return () => {
			if (viewTimerRef.current) {
				clearTimeout(viewTimerRef.current)
			}
		}
	}, [thesis._id, logTopicInteraction])

	return (
		<DialogContent className='flex max-h-[100vh] min-h-[70vh] max-w-5xl flex-col gap-0 overflow-hidden p-0'>
			<div className='grid min-h-[70vh] grid-cols-12'>
				{/* Left Column: Info */}
				<div className='col-span-12 h-full max-h-[90vh] overflow-y-auto bg-white p-6 md:col-span-8 md:p-8'>
					<div className='mb-6'>
						<Badge variant='outline' className='mb-3'>
							{thesis.major.name} • {thesis.year}
						</Badge>
						<h2 className='mb-2 text-2xl font-bold text-slate-900'>{thesis.titleVN}</h2>
						<h3 className='text-lg font-medium italic text-slate-500'>({thesis.titleEng})</h3>
					</div>

					<Tabs defaultValue='abstract' className='w-full'>
						<TabsList className='mb-4'>
							<TabsTrigger
								value='abstract'
								className='data-[state=active]:bg-blue-600 data-[state=active]:text-white'
							>
								Tóm tắt
							</TabsTrigger>
							<TabsTrigger
								value='reviews'
								className='data-[state=active]:bg-blue-600 data-[state=active]:text-white'
							>
								Đánh giá {`${thesis.stats.reviewCount}`}
							</TabsTrigger>
						</TabsList>

						<TabsContent value='abstract' className='space-y-6'>
							<div className='prose prose-sm max-w-none text-slate-600'>
								<div
									className='prose max-w-none rounded-lg bg-gray-50 p-4 text-gray-700'
									// Sử dụng DOMPurify để đảm bảo an toàn, tránh XSS
									dangerouslySetInnerHTML={{
										__html: DOMPurify.sanitize(thesis.description || '<p>Chưa có mô tả</p>')
									}}
								/>
							</div>

							<div className='rounded-lg border border-slate-100 bg-slate-50 p-4'>
								<h4 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
									<User className='h-4 w-4' /> Thông tin tác giả
								</h4>
								<div className='grid grid-cols-2 gap-4 text-sm'>
									<div>
										<p className='mb-1 text-slate-500'>Sinh viên thực hiện:</p>
										<ul className='list-inside list-disc font-medium text-slate-800'>
											{thesis.studentsRegistered.map((s) => (
												<li key={s._id}>{s.fullName}</li>
											))}
										</ul>
									</div>
									<div>
										<p className='mb-1 text-slate-500'>Giảng viên hướng dẫn:</p>
										<p className='font-medium text-slate-800'>
											{thesis.lecturers.map((l) => l.fullName).join(', ')}
										</p>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value='reviews'>
							<Evaluation
								topicId={thesis._id}
								averageRating={topicStats?.averageRating}
								reviewCount={topicStats?.totalRatings}
								distribution={topicStats?.distribution || {}}
							/>
						</TabsContent>
					</Tabs>
				</div>
				{/* Right Column: Meta & Actions */}
				<div className='col-span-12 flex h-full max-h-[90vh] flex-col gap-6 overflow-y-auto border-l border-slate-200 bg-slate-50/80 p-6 md:col-span-4'>
					{/* Actions Box */}
					<div className='space-y-3'>
						<h4 className='flex items-center gap-2 font-bold text-slate-900'>
							<Download className='h-4 w-4' /> Tài liệu
						</h4>
						<Button
							className='w-full justify-start'
							variant='default'
							onClick={async () => {
								if (thesis.finalProduct?.thesisReport?.fileUrl) {
									setLoading(true)
									await new Promise((resolve) => setTimeout(resolve, 1000))
									downloadFileWithURL(
										thesis.finalProduct?.thesisReport?.fileUrl,
										`Bao_cao_toan_van_${thesis._id}.pdf`
									)
									setLoading(false)
								} else {
									setLoading(true)
									await new Promise((resolve) => setTimeout(resolve, 3000))
									setLoading(false)
								}
							}}
							disabled={loading}
						>
							{loading ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' /> Đang kiểm tra...
								</>
							) : (
								<>
									<Download className='mr-2 h-4 w-4' /> Tải báo cáo toàn văn (.pdf)
								</>
							)}
						</Button>
						<Button className='w-full justify-start' variant='gray'>
							<FileText className='mr-2 h-4 w-4' /> Xem bản báo cáo (online)
						</Button>
					</div>

					<Separator />

					{/* Metadata Box */}
					<div className='space-y-4 text-sm'>
						<h4 className='font-bold text-slate-900'>Thông tin chi tiết</h4>

						<div className='flex justify-between border-b border-dashed border-slate-200 py-1'>
							<span className='text-slate-500'>Mã đề tài</span>
							<span className='font-mono font-medium'>{thesis._id.toUpperCase()}</span>
						</div>
						<div className='flex justify-between border-b border-dashed border-slate-200 py-1'>
							<span className='text-slate-500'>Lượt xem</span>
							<span className='font-medium'>{thesis.stats.views}</span>
						</div>
						<div className='flex justify-between border-b border-dashed border-slate-200 py-1'>
							<span className='text-slate-500'>Tải xuống</span>
							<span className='font-medium'>{thesis.stats.downloads}</span>
						</div>
						<div className='flex justify-between border-b border-dashed border-slate-200 py-1'>
							<span className='text-slate-500'>Đánh giá</span>
							<div className='flex items-center gap-1 font-medium text-amber-600'>
								{thesis.stats.averageRating} <Star className='h-3 w-3 fill-current' />
							</div>
						</div>
					</div>

					<div className='mt-auto'>
						<p className='text-center text-xs text-slate-400'>
							Tài liệu được lưu trữ & bảo vệ bản quyền bởi {thesis.periodInfo.faculty.name}
						</p>
					</div>
				</div>
			</div>
		</DialogContent>
	)
}

// --- MAIN PAGE ---
export const LibraryPage = () => {
	const [queries, setQueries] = useState<RequestGetTopicsInAdvanceSearch>({
		limit: 20,
		page: 1,
		query: '',
		rulesPagination: 99,
		search_by: ['titleVN', 'titleEng', 'description'],
		majorIds: [],
		year: 'Tất cả'
	})
	const { data: topicsInLibrary, isLoading, error } = useAdvanceSearchTopicsInLibraryQuery({ queries: queries })

	const handleSearch = (searchTerm: string) => {
		setQueries((prev) => ({
			...prev,
			query: searchTerm
		}))
	}
	const selectMajor = (majorId: string) => {
		setQueries((prev) => ({
			...prev,
			majorIds: majorId === 'Tất cả' ? [] : [majorId]
		}))
	}
	const handleYear = (year: string) => {
		setQueries((prev) => ({
			...prev,
			year: year
		}))
	}

	const handleSelectSort = (sortBy: string) => {
		setQueries((prev) => ({
			...prev,
			sort_by: sortBy === 'rel' ? undefined : sortBy === 'new' ? 'defenseDate' : 'averageRating',
			sort_order: sortBy === 'rel' ? undefined : sortBy === 'new' ? 'desc' : 'desc'
		}))
	}
	//Lấy metaData
	//Ngành
	const { data: majorOptions, isLoading: isLoadingMajors } = useGetMajorComboboxQuery()
	//Năm bảo vệ
	const { data: yearOptions, isLoading: isLoadingYears } = useGetYearComboboxQuery()

	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Thư viện số' }])

	return (
		<div className='h-100vh w-full overflow-auto bg-white'>
			{/* 1. HERO SECTION (Search Centric) */}
			<div className='relative overflow-hidden bg-slate-900 px-4 py-12 text-white'>
				<div className='container relative z-10 mx-auto max-w-4xl space-y-6 text-center'>
					<div className='space-y-2'>
						<div className='mb-4 flex justify-center'>
							<div className='rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm'>
								<BookOpen className='h-8 w-8 text-blue-400' />
							</div>
						</div>
						<h1 className='text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl'>
							Thư viện Khóa luận & Đồ án số
						</h1>
						<p className='text-sm text-slate-300 sm:text-base md:text-lg'>
							Khám phá, tra cứu và tham khảo hàng ngàn công trình nghiên cứu của sinh viên.
						</p>
					</div>

					{/* Search Box */}
					<div className='relative mx-auto w-full max-w-2xl'>
						<Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400' />
						<Input
							placeholder='Nhập tên đề tài, tác giả, hoặc từ khóa chuyên ngành...'
							className='h-12 w-full rounded-full border-0 bg-white pl-12 pr-24 text-sm text-slate-900 shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500 sm:h-14 sm:text-lg'
							value={queries.query}
							onChange={(e) => handleSearch(e.target.value)}
						/>
						<Button className='absolute right-2 top-1/2 h-10 -translate-y-1/2 rounded-full bg-blue-600 px-4 hover:bg-blue-700 sm:px-6'>
							Tìm kiếm
						</Button>
					</div>

					{/* Keywords */}
					<div className='flex flex-wrap justify-center gap-2 text-xs text-slate-400 sm:text-sm'>
						<span>Từ khóa phổ biến:</span>
						{['Machine Learning', 'Blockchain', 'IoT', 'Mobile App', 'E-commerce'].map((k) => (
							<span
								key={k}
								className='cursor-pointer text-blue-300 underline decoration-dotted underline-offset-4 transition-colors hover:text-white'
							>
								{k}
							</span>
						))}
					</div>
				</div>
			</div>

			{/* 2. MAIN CONTENT */}
			<div className='container mx-auto px-4 py-8'>
				<div className='flex flex-col gap-8 lg:flex-row'>
					{/* SIDEBAR FILTER */}
					<aside className='w-full shrink-0 space-y-6 lg:w-64'>
						<div className='sticky top-24 space-y-6 lg:top-20'>
							<div className='flex items-center gap-2 text-lg font-bold text-slate-800'>
								<Filter className='h-5 w-5' /> Bộ lọc
							</div>

							{/* Chuyển Select và Checkbox thành full width & touch-friendly */}
							<div className='space-y-3'>
								<label className='text-sm font-semibold text-slate-700'>Năm bảo vệ</label>
								{isLoadingYears ? (
									<Loader2 className='h-5 w-5 animate-spin' />
								) : (
									<Select
										value={queries.year === undefined ? 'Tất cả' : queries.year}
										onValueChange={(value) => handleYear(value)}
									>
										<SelectTrigger className='w-full bg-slate-50'>
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
								)}
							</div>

							<Separator />

							<div className='space-y-3'>
								<label className='text-sm font-semibold text-slate-700'>Chuyên ngành</label>
								<div className='space-y-2'>
									{majorOptions &&
										majorOptions.map((major) => (
											<div
												key={major._id}
												className='flex items-center space-x-2'
												title={major.facultyName}
											>
												<Checkbox
													id={major._id}
													checked={queries.majorIds?.includes(major._id) ?? false}
													onCheckedChange={(c) => {
														if (c) {
															//truyền majorId
															selectMajor(major._id)
														} else {
															selectMajor('Tất cả')
														}
													}}
												/>
												<label
													htmlFor={major.name}
													className='cursor-pointer text-sm font-medium leading-none text-slate-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
												>
													{major.name}
												</label>
												<span className='text-xs text-slate-500'>({major.count})</span>
											</div>
										))}
								</div>
							</div>
						</div>
					</aside>

					{/* RESULTS GRID */}
					<div className='flex-1'>
						<div className='mb-6 flex items-center justify-between'>
							<h2 className='text-xl font-bold text-slate-800'>
								Kết quả tìm kiếm ({topicsInLibrary?.data.length})
							</h2>
							<div className='flex items-center gap-2'>
								<span className='text-sm text-slate-500'>Sắp xếp theo:</span>
								<Select defaultValue='rel' onValueChange={handleSelectSort}>
									<SelectTrigger className='h-9 w-[140px]'>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value='rel'>Liên quan nhất</SelectItem>
										<SelectItem value='new'>Mới nhất</SelectItem>
										<SelectItem value='view'>Xem nhiều nhất</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{topicsInLibrary && topicsInLibrary.data.length > 0 ? (
							<div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
								{topicsInLibrary?.data.map((topic, index) => (
									<LibraryCard key={topic._id} thesis={topic} index={index} />
								))}
							</div>
						) : (
							<div className='rounded-xl border border-dashed border-slate-200 bg-slate-50 py-20 text-center'>
								<div className='mx-auto mb-4 w-fit rounded-full bg-white p-4 shadow-sm'>
									<Search className='h-8 w-8 text-slate-300' />
								</div>
								<h3 className='text-lg font-medium text-slate-900'>Không tìm thấy tài liệu</h3>
								<p className='mt-1 text-slate-500'>Vui lòng thử lại với từ khóa khác.</p>
								<Button
									variant='link'
									onClick={() => {
										handleSearch('')
										selectMajor('Tất cả')
										handleYear('Tất cả')
									}}
								>
									Xóa bộ lọc
								</Button>
							</div>
						)}

						{/* Pagination (Mock) */}
						{topicsInLibrary && topicsInLibrary.data.length > 0 && (
							<div className='mt-10 flex justify-center'>
								<Button variant='outline' className='mx-auto w-40'>
									Xem thêm
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}
