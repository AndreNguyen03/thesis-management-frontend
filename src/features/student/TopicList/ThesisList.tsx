import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@/components/ui'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger
} from '@/components/ui/Dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select'
import { Calendar, Eye, Filter, Search, Send, Star, Users } from 'lucide-react'
import { useState } from 'react'

// Mock data
const theses = [
	{
		id: 1,
		title: 'Phát triển ứng dụng AI cho chẩn đoán y tế',
		description:
			'Nghiên cứu và phát triển hệ thống AI hỗ trợ chẩn đoán bệnh thông qua hình ảnh y tế, ứng dụng deep learning và computer vision.',
		supervisor: 'PGS.TS. Nguyễn Văn A',
		department: 'Khoa Công nghệ Thông tin',
		field: 'Trí tuệ nhân tạo',
		maxStudents: 2,
		registeredStudents: 1,
		deadline: '2024-12-30',
		requirements: ['Python', 'TensorFlow', 'OpenCV', 'Machine Learning'],
		status: 'open',
		rating: 4.8,
		views: 156
	},
	{
		id: 2,
		title: 'Hệ thống quản lý thông minh cho smart city',
		description:
			'Xây dựng platform IoT và big data để quản lý giao thông, môi trường và dịch vú công trong đô thị thông minh.',
		supervisor: 'TS. Trần Thị B',
		department: 'Khoa Công nghệ Thông tin',
		field: 'IoT & Big Data',
		maxStudents: 3,
		registeredStudents: 2,
		deadline: '2024-12-25',
		requirements: ['JavaScript', 'Node.js', 'MongoDB', 'IoT', 'Data Analytics'],
		status: 'open',
		rating: 4.6,
		views: 203
	},
	{
		id: 3,
		title: 'Blockchain cho quản lý chuỗi cung ứng',
		description:
			'Nghiên cứu ứng dụng công nghệ blockchain trong việc theo dõi và quản lý chuỗi cung ứng thực phẩm.',
		supervisor: 'TS. Lê Văn C',
		department: 'Khoa Công nghệ Thông tin',
		field: 'Blockchain',
		maxStudents: 2,
		registeredStudents: 2,
		deadline: '2024-12-20',
		requirements: ['Solidity', 'Web3', 'Smart Contracts', 'React'],
		status: 'full',
		rating: 4.9,
		views: 324
	},
	{
		id: 4,
		title: 'Phân tích sentiment mạng xã hội',
		description:
			'Xây dựng hệ thống phân tích cảm xúc và xu hướng dư luận trên các nền tảng mạng xã hội sử dụng NLP.',
		supervisor: 'ThS. Hoàng Thị D',
		department: 'Khoa Công nghệ Thông tin',
		field: 'Natural Language Processing',
		maxStudents: 1,
		registeredStudents: 0,
		deadline: '2025-01-15',
		requirements: ['Python', 'NLTK', 'Transformers', 'Social Media APIs'],
		status: 'open',
		rating: 4.4,
		views: 89
	}
]

const fields = [
	'Tất cả lĩnh vực',
	'Trí tuệ nhân tạo',
	'IoT & Big Data',
	'Blockchain',
	'Natural Language Processing',
	'Computer Vision',
	'Web Development',
	'Mobile Development'
]

export const ThesisList = () => {
	const [searchTerm, setSearchTerm] = useState('')
	const [selectedField, setSelectedField] = useState('Tất cả lĩnh vực')
	const [sortBy, setSortBy] = useState('newest')
	const [selectedThesis, setSelectedThesis] = useState<any>(null)
	const filteredTheses = theses.filter((thesis) => {
		const matchesSearch =
			thesis.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
			thesis.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
			thesis.supervisor.toLowerCase().includes(searchTerm.toLowerCase())
		const matchesField = selectedField === 'Tất cả lĩnh vực' || thesis.field === selectedField
		return matchesSearch && matchesField
	})

	const sortedTheses = [...filteredTheses].sort((a, b) => {
		switch (sortBy) {
			case 'rating':
				return b.rating - a.rating
			case 'views':
				return b.views - a.views
			case 'deadline':
				return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
			default:
				return b.id - a.id
		}
	})

	const getStatusBadge = (thesis: any) => {
		if (thesis.status === 'full') {
			return <Badge variant='destructive'>Đã đủ</Badge>
		}
		const remaining = thesis.maxStudents - thesis.registeredStudents
		return <Badge variant='default'>{remaining} chỗ trống</Badge>
	}
	return (
		<div className='space-y-6'>
			{/* Header */}
			<div className='space-y-2'>
				<h1 className='text-3xl font-bold text-primary'>Danh sách đề tài</h1>
				<p className='text-muted-foreground'>Tìm kiếm và đăng ký đề tài luận văn phù hợp với bạn</p>
			</div>

			{/* Search and Filters */}
			<Card>
				<CardHeader>
					<CardTitle className='flex items-center gap-2'>
						<Filter className='h-5 w-5' />
						Tìm kiếm và lọc
					</CardTitle>
				</CardHeader>
				<CardContent className='space-y-4'>
					<div className='flex flex-col gap-4 sm:flex-row'>
						<div className='relative flex-1'>
							<Search className='absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform text-muted-foreground' />
							<Input
								placeholder='Tìm kiếm theo tên đề tài, giảng viên...'
								className='pl-10'
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>
						<Select value={selectedField} onValueChange={setSelectedField}>
							<SelectTrigger className='w-full sm:w-[200px]'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{fields.map((field) => (
									<SelectItem key={field} value={field}>
										{field}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						<Select value={sortBy} onValueChange={setSortBy}>
							<SelectTrigger className='w-full sm:w-[150px]'>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value='newest'>Mới nhất</SelectItem>
								<SelectItem value='rating'>Đánh giá cao</SelectItem>
								<SelectItem value='views'>Xem nhiều</SelectItem>
								<SelectItem value='deadline'>Gần deadline</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardContent>
			</Card>

			{/* AI Suggestions */}
			<Card className='border-accent/20 bg-accent/5'>
				<CardHeader>
					<CardTitle className='flex items-center gap-2 text-accent'>
						<Star className='h-5 w-5' />
						Gợi ý AI cho bạn
					</CardTitle>
					<CardDescription>Dựa trên profile và sở thích của bạn</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
						{theses.slice(0, 2).map((thesis) => (
							<div key={thesis.id} className='rounded-lg border border-accent/20 bg-card p-3'>
								<div className='mb-2 flex items-start justify-between'>
									<h4 className='text-sm font-medium'>{thesis.title}</h4>
									<Badge variant='default' className='bg-accent text-xs'>
										95% match
									</Badge>
								</div>
								<p className='mb-2 text-xs text-muted-foreground'>{thesis.supervisor}</p>
								<div className='mb-2 flex gap-1'>
									{thesis.requirements.slice(0, 3).map((req) => (
										<Badge key={req} variant='secondary' className='text-xs'>
											{req}
										</Badge>
									))}
								</div>
								<Button size='sm' className='w-full'>
									Xem chi tiết
								</Button>
							</div>
						))}
					</div>
				</CardContent>
			</Card>

			{/* Results */}
			<div className='space-y-4'>
				<div className='flex items-center justify-between'>
					<p className='text-sm text-muted-foreground'>Tìm thấy {sortedTheses.length} đề tài</p>
				</div>

				<div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
					{sortedTheses.map((thesis) => (
						<Card key={thesis.id} className='transition-shadow hover:shadow-lg'>
							<CardHeader>
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<CardTitle className='text-lg leading-tight'>{thesis.title}</CardTitle>
										<CardDescription className='mt-1'>
											{thesis.supervisor} • {thesis.department}
										</CardDescription>
									</div>
									{getStatusBadge(thesis)}
								</div>
							</CardHeader>
							<CardContent className='space-y-4'>
								<p className='line-clamp-3 text-sm text-muted-foreground'>{thesis.description}</p>

								<div className='space-y-2'>
									<div className='flex items-center gap-4 text-sm text-muted-foreground'>
										<div className='flex items-center gap-1'>
											<Users className='h-4 w-4' />
											{thesis.registeredStudents}/{thesis.maxStudents}
										</div>
										<div className='flex items-center gap-1'>
											<Star className='h-4 w-4' />
											{thesis.rating}
										</div>
										<div className='flex items-center gap-1'>
											<Eye className='h-4 w-4' />
											{thesis.views}
										</div>
									</div>

									<div className='flex items-center gap-1 text-sm text-muted-foreground'>
										<Calendar className='h-4 w-4' />
										Hạn đăng ký: {new Date(thesis.deadline).toLocaleDateString('vi-VN')}
									</div>
								</div>

								<div className='flex flex-wrap gap-1'>
									{thesis.requirements.slice(0, 4).map((req) => (
										<Badge key={req} variant='secondary' className='text-xs'>
											{req}
										</Badge>
									))}
									{thesis.requirements.length > 4 && (
										<Badge variant='outline' className='text-xs'>
											+{thesis.requirements.length - 4}
										</Badge>
									)}
								</div>

								<div className='flex gap-2'>
									<Dialog>
										<DialogTrigger asChild>
											<Button
												variant='outline'
												size='sm'
												className='flex-1'
												onClick={() => setSelectedThesis(thesis)}
											>
												<Eye className='mr-2 h-4 w-4' />
												Chi tiết
											</Button>
										</DialogTrigger>
										<DialogContent className='max-h-[80vh] max-w-2xl overflow-y-auto'>
											{selectedThesis && (
												<>
													<DialogHeader>
														<DialogTitle>{selectedThesis.title}</DialogTitle>
														<DialogDescription>
															{selectedThesis.supervisor} • {selectedThesis.department}
														</DialogDescription>
													</DialogHeader>
													<div className='space-y-4'>
														<div>
															<h4 className='mb-2 font-medium'>Mô tả chi tiết</h4>
															<p className='text-sm text-muted-foreground'>
																{selectedThesis.description}
															</p>
														</div>

														<div>
															<h4 className='mb-2 font-medium'>Yêu cầu kỹ năng</h4>
															<div className='flex flex-wrap gap-2'>
																{selectedThesis.requirements.map((req: string) => (
																	<Badge key={req} variant='secondary'>
																		{req}
																	</Badge>
																))}
															</div>
														</div>

														<div className='grid grid-cols-2 gap-4 text-sm'>
															<div>
																<span className='font-medium'>Lĩnh vực:</span>
																<p className='text-muted-foreground'>
																	{selectedThesis.field}
																</p>
															</div>
															<div>
																<span className='font-medium'>Số lượng SV:</span>
																<p className='text-muted-foreground'>
																	{selectedThesis.registeredStudents}/
																	{selectedThesis.maxStudents}
																</p>
															</div>
														</div>

														<div className='flex justify-end gap-2'>
															<Button variant='outline'>Lưu đề tài</Button>
															<Button
																disabled={selectedThesis.status === 'full'}
																className='bg-gradient-primary'
															>
																<Send className='mr-2 h-4 w-4' />
																Đăng ký
															</Button>
														</div>
													</div>
												</>
											)}
										</DialogContent>
									</Dialog>

									<Button
										size='sm'
										className='flex-1 bg-gradient-primary'
										disabled={thesis.status === 'full'}
									>
										<Send className='mr-2 h-4 w-4' />
										Đăng ký
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		</div>
	)
}
