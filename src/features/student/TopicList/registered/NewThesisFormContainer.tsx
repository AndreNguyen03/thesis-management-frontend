import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { CheckCircle2 } from 'lucide-react'
import { useState } from 'react'

import { usePageBreadcrumb } from '@/hooks/usePageBreadcrumb'

// Mock data
const lecturers = [
	{ id: '1', name: 'PGS.TS. Nguyễn Văn A', avatar: '/avatars/01.png', field: 'Trí tuệ nhân tạo' },
	{ id: '2', name: 'TS. Trần Thị B', avatar: '/avatars/02.png', field: 'IoT & Big Data' },
	{ id: '3', name: 'ThS. Lê Văn C', avatar: '/avatars/03.png', field: 'Web Development' }
]
const fields = [
	'Trí tuệ nhân tạo',
	'IoT & Big Data',
	'Blockchain',
	'Natural Language Processing',
	'Computer Vision',
	'Web Development',
	'Mobile Development'
]
const requirements = [
	'React',
	'Kỹ năng làm việc nhóm',
	'Kinh nghiệm với các dự án mã nguồn mở',
	'Node.js',
	'Python',
	'Machine Learning',
	'Xử lý dữ liệu lớn',
	'SQL/NoSQL',
	'Mã hóa',
	'Kiểm thử xâm nhập',
	'C/C++',
	'Arduino',
	'Raspberry Pi',
	'MQTT',
	'Data Analytics',
	'ETL',
	'Mã hóa',
	'Hệ điều hành',
	'AWS/Azure/GCP',
	'CI/CD',
	'C#',
	'Java',
	'Kotlin',
	'Swift',
	'UI/UX Design',
	'Flutter',
	'An ninh mạng',
	'DevOps',
	'Kubenetes',
	'Kỹ năng làm việc nhóm',
	'Natural Language Processing',
	'Computer Vision'
]
export const NewThesisFormContainer = () => {
	const [selectedLecturer, setSelectedLecturer] = useState<string | null>(null)
	usePageBreadcrumb([
		{ label: 'Trang chủ', path: '/' },
		{ label: 'Danh sách đề tài', path: '/thesis' },
		{ label: 'Đăng ký đề tài mới' }
	])
	return (
		<div className='container mx-auto max-w-7xl p-4'>
			<h1 className='mb-8 text-3xl font-bold text-primary'>Đề xuất đề tài mới</h1>

			{/* Container chính sử dụng Flexbox */}
			<div className='flex flex-col items-start gap-8 lg:flex-row'>
				{/* ================================================================== */}
				{/* PHẦN 1: THÔNG TIN ĐỀ TÀI (chiếm 2/3 chiều rộng) */}
				{/* ================================================================== */}
				<div className='w-full lg:w-2/3'>
					<Card>
						<CardHeader className='pb-2'>
							<CardTitle>1. Nhập thông tin đề tài</CardTitle>
						</CardHeader>
						<CardContent className='space-y-6'>
							{/* Các trường input cho đề tài */}
							<div className='space-y-2'>
								<h1>a. Tên đề tài</h1>
								<Input id='title' placeholder='Ví dụ: Xây dựng ứng dụng quản lý luận văn...' />
							</div>
							<div className='space-y-2'>
								<h1>b. Mô tả chi tiết</h1>
								<Input
									id='description'
									placeholder='Mô tả mục tiêu, công nghệ dự kiến, kết quả mong đợi...'
								/>
							</div>
							<div className='space-y-2'>
								<h1>c. Lĩnh vực</h1>
								<Input
									id='fields'
									placeholder='Ví dụ: Kiến thức về Trí tuệ nhân tạo, Web Development, IoT & Big Data...'
								/>
							</div>
							<div className='space-y-2'>
								<h1>d. Yêu cầu cho sinh viên</h1>
								<Input id='requirements' placeholder='Ví dụ: Kiến thức về React, Node.js, Python...' />
							</div>
							<div className='space-y-2'>
								<h1>e. Tài liệu tham khảo</h1>
								<Input id='references' placeholder='Ví dụ: Tài liệu về AI, Machine Learning...' />
							</div>
						</CardContent>
					</Card>
				</div>

				{/* ================================================================== */}
				{/* PHẦN 2: DANH SÁCH GIẢNG VIÊN (chiếm 1/3, sticky) */}
				{/* ================================================================== */}
				<div className='w-full lg:sticky lg:top-24 lg:w-1/3'>
					<Card className='space-y-2 bg-slate-50'>
						<CardHeader>
							<CardTitle>2. Chọn giảng viên hướng dẫn</CardTitle>
						</CardHeader>
						<CardContent className='max-h-[60vh] space-y-3 overflow-y-auto'>
							{lecturers.map((lecturer) => {
								const isSelected = selectedLecturer === lecturer.id
								return (
									<div
										key={lecturer.id}
										onClick={() => setSelectedLecturer(lecturer.id)}
										className={`relative flex cursor-pointer items-center gap-4 rounded-lg border p-3 transition-all ${
											isSelected
												? 'border-blue-500 bg-white shadow-md'
												: 'border-transparent hover:bg-white'
										}`}
									>
										<div>
											<p className='font-semibold'>{lecturer.name}</p>
											<p className='text-sm text-muted-foreground'>{lecturer.field}</p>
										</div>
										{isSelected && (
											<CheckCircle2 className='absolute right-3 top-3 h-5 w-5 text-blue-500' />
										)}
									</div>
								)
							})}
						</CardContent>
					</Card>
				</div>
			</div>

			{/* Nút submit */}
			<div className='mt-8 flex justify-end'>
				<Button size='lg' variant='register'>
					Gửi đề xuất
				</Button>
			</div>
		</div>
	)
}
