import { useState } from 'react'
import { StatsCard } from '@/components/StatsCard'
import { TopicsTable } from '@/components/TopicsTable'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Search, FileText, Clock, CheckCircle2, AlertCircle, Bell } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'


export interface Topic {
	id: string
	title: string
	field: string
	registrations: {
		current: number
		max: number
	}
	deadline: string
	status: TopicStatus
	createdAt: string
	description?: string
	type?: 'Đồ án' | 'Khóa luận' | 'NCKH'
	coAdvisor?: string
	skills?: string[]
	references?: { name: string; url?: string; file?: File }[]
}

export const mockTopics: Topic[] = [
	{
		id: '1',
		title: 'Xây dựng hệ thống quản lý thư viện số',
		field: 'Công nghệ phần mềm',
		registrations: { current: 3, max: 5 },
		deadline: '2025-11-15',
		status: 'open',
		createdAt: '2025-10-01',
		type: 'Đồ án',
		description:
			'Phát triển ứng dụng web quản lý thư viện số với các tính năng mượn trả sách, tìm kiếm, và quản lý độc giả'
	},
	{
		id: '2',
		title: 'Ứng dụng AI trong phân tích cảm xúc văn bản tiếng Việt',
		field: 'Trí tuệ nhân tạo',
		registrations: { current: 2, max: 2 },
		deadline: '2025-11-20',
		status: 'open',
		createdAt: '2025-10-03',
		type: 'Khóa luận',
		description: 'Nghiên cứu và triển khai mô hình deep learning để phân tích cảm xúc trong văn bản tiếng Việt'
	},
	{
		id: '3',
		title: 'Hệ thống IoT giám sát môi trường thông minh',
		field: 'Internet vạn vật',
		registrations: { current: 5, max: 3 },
		deadline: '2025-10-25',
		status: 'in-progress',
		createdAt: '2025-09-15',
		type: 'Đồ án',
		description: 'Xây dựng hệ thống cảm biến IoT để giám sát và cảnh báo chất lượng môi trường'
	},
	{
		id: '4',
		title: 'Phát triển chatbot hỗ trợ tư vấn tuyển sinh',
		field: 'Xử lý ngôn ngữ tự nhiên',
		registrations: { current: 1, max: 2 },
		deadline: '2025-12-01',
		status: 'open',
		createdAt: '2025-10-05',
		type: 'NCKH',
		coAdvisor: 'TS. Nguyễn Văn B'
	},
	{
		id: '5',
		title: 'Ứng dụng blockchain trong quản lý chuỗi cung ứng',
		field: 'Blockchain',
		registrations: { current: 2, max: 2 },
		deadline: '2025-06-30',
		status: 'completed',
		createdAt: '2025-03-01',
		type: 'Khóa luận'
	},
	{
		id: '6',
		title: 'Hệ thống nhận diện khuôn mặt realtime',
		field: 'Computer Vision',
		registrations: { current: 3, max: 3 },
		deadline: '2025-11-10',
		status: 'in-progress',
		createdAt: '2025-09-20',
		type: 'Đồ án'
	},
	{
		id: '7',
		title: 'Phân tích dữ liệu lớn với Apache Spark',
		field: 'Big Data',
		registrations: { current: 0, max: 2 },
		deadline: '2025-11-30',
		status: 'open',
		createdAt: '2025-10-08',
		type: 'Khóa luận'
	},
	{
		id: '8',
		title: 'Game di động sử dụng Unity Engine',
		field: 'Phát triển game',
		registrations: { current: 4, max: 4 },
		deadline: '2025-11-05',
		status: 'in-progress',
		createdAt: '2025-09-10',
		type: 'Đồ án'
	},
	{
		id: '9',
		title: 'Hệ thống quản lý bãi đỗ xe thông minh',
		field: 'IoT & Nhúng',
		registrations: { current: 1, max: 2 },
		deadline: '2025-11-25',
		status: 'pending',
		createdAt: '2025-10-10',
		type: 'Đồ án',
		description: 'Thiết kế hệ thống IoT để quản lý và giám sát bãi đỗ xe tự động'
	},
	{
		id: '10',
		title: 'Ứng dụng học tập trực tuyến với gamification',
		field: 'E-learning',
		registrations: { current: 0, max: 3 },
		deadline: '2025-12-10',
		status: 'pending',
		createdAt: '2025-10-11',
		type: 'Khóa luận',
		coAdvisor: 'TS. Trần Thị C',
		description: 'Xây dựng nền tảng e-learning tích hợp yếu tố game hóa để tăng động lực học tập'
	},
	{
		id: '11',
		title: 'Phân tích bảo mật ứng dụng web với OWASP',
		field: 'An ninh mạng',
		registrations: { current: 2, max: 2 },
		deadline: '2025-11-18',
		status: 'pending',
		createdAt: '2025-10-12',
		type: 'NCKH',
		description: 'Nghiên cứu và áp dụng chuẩn OWASP để phân tích lỗ hổng bảo mật'
	}
]

const Index = () => {
	const [searchQuery, setSearchQuery] = useState('')
	const [statusFilter, setStatusFilter] = useState<TopicStatus | 'all'>('all')

	// Calculate statistics
	const stats = {
		open: mockTopics.filter((t) => t.status === 'open').length,
		inProgress: mockTopics.filter((t) => t.status === 'in-progress').length,
		completed: mockTopics.filter((t) => t.status === 'completed').length,
		pending: mockTopics.filter((t) => t.status === 'pending').length,
		total: mockTopics.length
	}

	// Filter topics
	const filteredTopics = mockTopics.filter((topic) => {
		const matchesSearch =
			topic.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
			topic.field.toLowerCase().includes(searchQuery.toLowerCase())
		const matchesStatus = statusFilter === 'all' || topic.status === statusFilter
		return matchesSearch && matchesStatus
	})

	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='flex flex-col gap-4 md:flex-row md:items-center md:justify-between'>
				<div>
					<h1 className='text-3xl font-bold text-foreground'>Tổng quan đề tài</h1>
					<p className='mt-1 text-muted-foreground'>Quản lý và theo dõi tiến độ đề tài hướng dẫn</p>
				</div>
				<Button className='gap-2 bg-gradient-primary shadow-md hover:opacity-90'>
					<Plus className='h-5 w-5' />
					Đăng đề tài mới
				</Button>
			</div>

			{/* Pending Alert */}
			{stats.pending > 0 && (
				<Alert className='border-warning bg-warning/10'>
					<Bell className='text-warning h-4 w-4' />
					<AlertDescription className='text-foreground'>
						<span className='font-semibold'>Bạn có {stats.pending} đề tài đang chờ phê duyệt</span> — Vui
						lòng kiểm tra và xét duyệt để sinh viên có thể đăng ký.
					</AlertDescription>
				</Alert>
			)}

			{/* Stats Cards */}
			<div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
				<StatsCard
					title='Đề tài đang mở'
					value={stats.open}
					icon={FileText}
					description='Sẵn sàng nhận đăng ký'
				/>
				<StatsCard title='Đang thực hiện' value={stats.inProgress} icon={Clock} description='Đang hướng dẫn' />
				<StatsCard
					title='Đã hoàn thành'
					value={stats.completed}
					icon={CheckCircle2}
					description='Trong năm học này'
				/>
				<StatsCard
					title='Tổng số đề tài'
					value={stats.total}
					icon={AlertCircle}
					description='Tất cả trạng thái'
				/>
			</div>

			{/* Filters and Search */}
			<div className='flex flex-col gap-4 md:flex-row md:items-center'>
				<div className='relative flex-1'>
					<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground' />
					<Input
						placeholder='Tìm kiếm đề tài theo tên hoặc lĩnh vực...'
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						className='pl-10'
					/>
				</div>
				<Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TopicStatus | 'all')}>
					<SelectTrigger className='w-full md:w-[200px]'>
						<SelectValue placeholder='Lọc theo trạng thái' />
					</SelectTrigger>
					<SelectContent>
						<SelectItem value='all'>Tất cả trạng thái</SelectItem>
						<SelectItem value='open'>Đang mở</SelectItem>
						<SelectItem value='in-progress'>Đang thực hiện</SelectItem>
						<SelectItem value='completed'>Hoàn thành</SelectItem>
						<SelectItem value='pending'>Chờ phê duyệt</SelectItem>
					</SelectContent>
				</Select>
			</div>

			{/* Topics Table */}
			<div>
				<div className='mb-4 flex items-center justify-between'>
					<h2 className='text-xl font-semibold text-foreground'>
						Danh sách đề tài ({filteredTopics.length})
					</h2>
				</div>
				<TopicsTable topics={filteredTopics} />
			</div>
		</div>
	)
}

export default Index
