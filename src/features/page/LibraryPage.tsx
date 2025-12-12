import React, { useState, useMemo } from 'react'
import {
	Search,
	Filter,
	Star,
	Download,
	Eye,
	BookOpen,
	Calendar,
	User,
	Layers,
	Globe,
	GraduationCap,
	FileText,
	Github,
	Database,
	X,
	ChevronRight,
	ArrowUpRight,
	LayoutGrid,
	List
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePageBreadcrumb } from '@/hooks'

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

// --- MOCK DATA ---
const MOCK_DATA: Thesis[] = Array.from({ length: 8 }).map((_, i) => ({
	id: `t-${i}`,
	titleVN:
		i % 2 === 0
			? 'Nghiên cứu và xây dựng hệ thống gợi ý khóa học thông minh dựa trên lộ trình cá nhân hóa'
			: 'Phát triển ứng dụng nhận diện biển số xe sử dụng YOLOv8 và Optical Character Recognition',
	titleEng:
		i % 2 === 0
			? 'Research and development of an intelligent course recommendation system based on personalized roadmap'
			: 'Development of license plate recognition application using YOLOv8 and Optical Character Recognition',
	abstract:
		'Đề tài tập trung giải quyết vấn đề quá tải thông tin khi sinh viên lựa chọn khóa học. Bằng cách áp dụng các thuật toán Collaborative Filtering và Content-based Filtering, hệ thống đề xuất các lộ trình học tập tối ưu...',
	year: 2023 - (i % 3),
	major: i % 2 === 0 ? { code: 'SE', name: 'Kỹ thuật Phần mềm' } : { code: 'AI', name: 'Trí tuệ Nhân tạo' },
	fields: i % 2 === 0 ? ['Web App', 'Recommender System'] : ['Computer Vision', 'Deep Learning'],
	supervisor: { name: i % 2 === 0 ? 'TS. Nguyễn Văn A' : 'ThS. Lê Thị B' },
	students: ['Trần Văn C', 'Phạm Thị D'],
	stats: {
		views: 120 + i * 10,
		downloads: 45 + i,
		rating: 4.5 + Math.random() * 0.5,
		reviews: 5 + i
	},
	documents: {
		report: 'report.pdf',
		sourceCode: i % 2 !== 0 ? 'github.com/project' : undefined,
		dataset: i % 2 !== 0 ? 'kaggle.com/data' : undefined
	},
	reviews: []
}))

const MAJORS = ['Tất cả', 'Kỹ thuật Phần mềm', 'Trí tuệ Nhân tạo', 'An toàn Thông tin', 'Hệ thống Thông tin']
const YEARS = ['Tất cả', '2024', '2023', '2022', '2021']

// --- HELPER: Color Generator ---
const getMajorColor = (code: string) => {
	switch (code) {
		case 'SE':
			return 'bg-blue-50 text-blue-700 border-blue-200'
		case 'AI':
			return 'bg-emerald-50 text-emerald-700 border-emerald-200'
		case 'IS':
			return 'bg-orange-50 text-orange-700 border-orange-200'
		default:
			return 'bg-slate-50 text-slate-700 border-slate-200'
	}
}

// --- COMPONENT: LIBRARY CARD ---
const LibraryCard = ({ thesis }: { thesis: Thesis }) => {
	return (
		<Card className='group flex h-full flex-col border-slate-200 p-0 transition-all duration-300 hover:shadow-lg'>
			{/* Header Strip */}
			<div
				className={`h-2 w-full rounded-t-xl ${thesis.major.code === 'SE' ? 'bg-blue-500' : 'bg-emerald-500'}`}
			/>

			<CardHeader className='pb-3 pt-5'>
				<div className='mb-2 flex items-start justify-between'>
					<Badge variant='outline' className={`${getMajorColor(thesis.major.code)} font-medium`}>
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
				<p className='line-clamp-3 text-sm leading-relaxed text-slate-600'>{thesis.abstract}</p>

				{/* Tags */}
				<div className='flex flex-wrap gap-1.5'>
					{thesis.fields.map((field) => (
						<Badge
							key={field}
							variant='secondary'
							className='bg-slate-100 text-[10px] font-normal text-slate-600 hover:bg-slate-200'
						>
							#{field}
						</Badge>
					))}
				</div>

				{/* Authors */}
				<div className='flex items-center gap-3 border-t border-slate-50 pt-2'>
					<div className='flex -space-x-2'>
						{thesis.students.map((st, idx) => (
							<Avatar key={idx} className='h-6 w-6 border-2 border-white ring-1 ring-slate-100'>
								<AvatarFallback className='bg-slate-200 text-[9px] text-slate-600'>
									{st.charAt(0)}
								</AvatarFallback>
							</Avatar>
						))}
					</div>
					<span className='text-xs text-slate-500'>
						HD: <span className='font-medium text-slate-700'>{thesis.supervisor.name}</span>
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
						<Star className='h-3.5 w-3.5 fill-current' /> {thesis.stats.rating.toFixed(1)}
					</div>
				</div>

				{/* Actions */}
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
const DetailDialogContent = ({ thesis }: { thesis: Thesis }) => {
	return (
		<DialogContent className='flex max-h-[90vh] max-w-4xl flex-col gap-0 overflow-hidden p-0'>
			<div className='grid h-full grid-cols-12'>
				{/* Left Column: Info */}
				<div className='col-span-12 h-full max-h-[90vh] overflow-y-auto bg-white p-6 md:col-span-8 md:p-8'>
					<div className='mb-6'>
						<Badge variant='outline' className='mb-3'>
							{thesis.major.name} • {thesis.year}
						</Badge>
						<h2 className='mb-2 text-2xl font-bold text-slate-900'>{thesis.titleVN}</h2>
						<h3 className='text-lg font-medium italic text-slate-500'>{thesis.titleEng}</h3>
					</div>

					<Tabs defaultValue='abstract' className='w-full'>
						<TabsList className='mb-4'>
							<TabsTrigger value='abstract'>Tóm tắt</TabsTrigger>
							<TabsTrigger value='reviews'>Đánh giá ({thesis.stats.reviews})</TabsTrigger>
						</TabsList>

						<TabsContent value='abstract' className='space-y-6'>
							<div className='prose prose-sm max-w-none text-slate-600'>
								<p>{thesis.abstract}</p>
								<p>
									Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
									incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
									exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
								</p>
							</div>

							<div className='rounded-lg border border-slate-100 bg-slate-50 p-4'>
								<h4 className='mb-3 flex items-center gap-2 text-sm font-semibold'>
									<User className='h-4 w-4' /> Thông tin tác giả
								</h4>
								<div className='grid grid-cols-2 gap-4 text-sm'>
									<div>
										<p className='mb-1 text-slate-500'>Sinh viên thực hiện:</p>
										<ul className='list-inside list-disc font-medium text-slate-800'>
											{thesis.students.map((s) => (
												<li key={s}>{s}</li>
											))}
										</ul>
									</div>
									<div>
										<p className='mb-1 text-slate-500'>Giảng viên hướng dẫn:</p>
										<p className='font-medium text-slate-800'>{thesis.supervisor.name}</p>
									</div>
								</div>
							</div>
						</TabsContent>

						<TabsContent value='reviews'>
							<div className='py-10 text-center text-slate-500'>Chưa có đánh giá nào cho đề tài này.</div>
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
						<Button className='w-full justify-start' variant='default'>
							<FileText className='mr-2 h-4 w-4' /> Báo cáo toàn văn (.pdf)
						</Button>
						{thesis.documents.sourceCode && (
							<Button className='w-full justify-start' variant='outline'>
								<Github className='mr-2 h-4 w-4' /> Source Code (Git)
							</Button>
						)}
						{thesis.documents.dataset && (
							<Button className='w-full justify-start' variant='outline'>
								<Database className='mr-2 h-4 w-4' /> Dataset
							</Button>
						)}
					</div>

					<Separator />

					{/* Metadata Box */}
					<div className='space-y-4 text-sm'>
						<h4 className='font-bold text-slate-900'>Thông tin chi tiết</h4>

						<div className='flex justify-between border-b border-dashed border-slate-200 py-1'>
							<span className='text-slate-500'>Mã đề tài</span>
							<span className='font-mono font-medium'>{thesis.id.toUpperCase()}</span>
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
								{thesis.stats.rating} <Star className='h-3 w-3 fill-current' />
							</div>
						</div>
					</div>

					<div className='mt-auto'>
						<p className='text-center text-xs text-slate-400'>
							Tài liệu được lưu trữ & bảo vệ bản quyền bởi Khoa CNTT.
						</p>
					</div>
				</div>
			</div>
		</DialogContent>
	)
}

// --- MAIN PAGE ---
export const LibraryPage = () => {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedMajor, setSelectedMajor] = useState('Tất cả')
	const [selectedYear, setSelectedYear] = useState('Tất cả')
	usePageBreadcrumb([{ label: 'Trang chủ', path: '/' }, { label: 'Thư viện số' }])
	// Filter Logic (Simple)
	const filteredData = useMemo(() => {
		return MOCK_DATA.filter((t) => {
			const matchSearch = t.titleVN.toLowerCase().includes(searchTerm.toLowerCase())
			const matchMajor = selectedMajor === 'Tất cả' || t.major.name === selectedMajor
			const matchYear = selectedYear === 'Tất cả' || t.year.toString() === selectedYear
			return matchSearch && matchMajor && matchYear
		})
	}, [searchTerm, selectedMajor, selectedYear])

	return (
		<div className='min-h-screen bg-white'>
			{/* 1. HERO SECTION (Search Centric) */}
			<div className='relative overflow-hidden bg-slate-900 px-4 py-12 text-white'>
				{/* Abstract Background Pattern */}
				<div className='pointer-events-none absolute left-0 top-0 h-full w-full opacity-10'>
					<div className='absolute right-0 top-0 h-96 w-96 -translate-y-1/2 translate-x-1/2 transform rounded-full bg-blue-500 mix-blend-screen blur-3xl'></div>
					<div className='absolute bottom-0 left-0 h-72 w-72 -translate-x-1/3 translate-y-1/3 transform rounded-full bg-emerald-500 mix-blend-screen blur-3xl'></div>
				</div>

				<div className='container relative z-10 mx-auto max-w-4xl space-y-6 text-center'>
					<div className='space-y-2'>
						<div className='mb-4 flex justify-center'>
							<div className='rounded-xl border border-white/20 bg-white/10 p-3 backdrop-blur-sm'>
								<BookOpen className='h-8 w-8 text-blue-400' />
							</div>
						</div>
						<h1 className='text-3xl font-bold tracking-tight md:text-4xl'>Thư viện Khóa luận & Đồ án số</h1>
						<p className='text-lg text-slate-300'>
							Khám phá, tra cứu và tham khảo hàng ngàn công trình nghiên cứu của sinh viên.
						</p>
					</div>

					<div className='relative mx-auto max-w-2xl'>
						<Search className='absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400' />
						<Input
							placeholder='Nhập tên đề tài, tác giả, hoặc từ khóa chuyên ngành...'
							className='h-14 rounded-full border-0 bg-white pl-12 pr-4 text-lg text-slate-900 shadow-xl focus-visible:ring-2 focus-visible:ring-blue-500'
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
						<Button className='absolute right-2 top-2 h-10 rounded-full bg-blue-600 px-6 hover:bg-blue-700'>
							Tìm kiếm
						</Button>
					</div>

					<div className='flex flex-wrap justify-center gap-2 text-sm text-slate-400'>
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
						<div className='sticky top-24 space-y-6'>
							<div className='flex items-center gap-2 text-lg font-bold text-slate-800'>
								<Filter className='h-5 w-5' /> Bộ lọc
							</div>

							{/* Năm học */}
							<div className='space-y-3'>
								<label className='text-sm font-semibold text-slate-700'>Năm bảo vệ</label>
								<Select value={selectedYear} onValueChange={setSelectedYear}>
									<SelectTrigger className='w-full bg-slate-50'>
										<SelectValue placeholder='Chọn năm' />
									</SelectTrigger>
									<SelectContent>
										{YEARS.map((y) => (
											<SelectItem key={y} value={y}>
												{y}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<Separator />

							{/* Chuyên ngành */}
							<div className='space-y-3'>
								<label className='text-sm font-semibold text-slate-700'>Chuyên ngành</label>
								<div className='space-y-2'>
									{MAJORS.slice(1).map((major) => (
										<div key={major} className='flex items-center space-x-2'>
											<Checkbox
												id={major}
												checked={selectedMajor === major}
												onCheckedChange={(c) => setSelectedMajor(c ? major : 'Tất cả')}
											/>
											<label
												htmlFor={major}
												className='cursor-pointer text-sm font-medium leading-none text-slate-600 peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
											>
												{major}
											</label>
										</div>
									))}
								</div>
							</div>

							<Separator />

							<div className='rounded-xl border border-blue-100 bg-blue-50 p-4'>
								<h4 className='mb-2 flex items-center gap-2 text-sm font-semibold text-blue-900'>
									<Star className='h-4 w-4 fill-blue-500 text-blue-500' /> Đề tài xuất sắc
								</h4>
								<p className='mb-3 text-xs text-blue-700'>
									Xem danh sách các đề tài đạt điểm 9.0+ và được hội đồng đánh giá cao.
								</p>
								<Button
									variant='outline'
									size='sm'
									className='w-full border-blue-200 bg-white text-blue-700 hover:bg-blue-100'
								>
									Xem ngay
								</Button>
							</div>
						</div>
					</aside>

					{/* RESULTS GRID */}
					<div className='flex-1'>
						<div className='mb-6 flex items-center justify-between'>
							<h2 className='text-xl font-bold text-slate-800'>
								Kết quả tìm kiếm ({filteredData.length})
							</h2>
							<div className='flex items-center gap-2'>
								<span className='text-sm text-slate-500'>Sắp xếp theo:</span>
								<Select defaultValue='rel'>
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

						{filteredData.length > 0 ? (
							<div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
								{filteredData.map((thesis) => (
									<LibraryCard key={thesis.id} thesis={thesis} />
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
										setSearchTerm('')
										setSelectedMajor('Tất cả')
										setSelectedYear('Tất cả')
									}}
								>
									Xóa bộ lọc
								</Button>
							</div>
						)}

						{/* Pagination (Mock) */}
						{filteredData.length > 0 && (
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
