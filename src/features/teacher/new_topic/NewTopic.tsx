import { useState } from 'react'
import { type CreateTopicPayload } from '@/models/topic.model'
import { TopicEditDialog } from './TopicEditDialog'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, FileText, Sparkles, CheckCircle } from 'lucide-react'

const NewTopic = () => {
	const [showDialog, setShowDialog] = useState(false)

	// Template đề tài mẫu để giảng viên bắt đầu nhanh
	const emptyCreateTopic: CreateTopicPayload = {
		title: '',
		description: '',
		type: 'Đồ án', // Giá trị mặc định hợp lệ
		majorId: '',
		departmentId: '',
		lecturerIds: [],
		coAdvisorIds: [],
		studentIds: [],
		fileIds: [],
		maxStudents: 1, // mặc định 1
		deadline: undefined, // có thể chọn sau
		requirements: []
	}

	return (
		<>
			<div className='space-y-6'>
				<div>
					<h1 className='text-3xl font-bold tracking-tight'>Đăng đề tài mới</h1>
					<p className='mt-2 text-muted-foreground'>Tạo đề tài mới cho sinh viên đăng ký trong học kỳ này</p>
				</div>

				{/* Quick Start Cards */}
				<div className='grid gap-4 md:grid-cols-3'>
					<Card
						className='cursor-pointer border-primary/20 transition-shadow hover:shadow-lg'
						onClick={() => setShowDialog(true)}
					>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<div className='rounded-lg bg-primary/10 p-2'>
									<Plus className='h-5 w-5 text-primary' />
								</div>
								<CardTitle className='text-lg'>Tạo từ đầu</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription>Bắt đầu với form trống và nhập đầy đủ thông tin đề tài</CardDescription>
						</CardContent>
					</Card>

					<Card className='cursor-pointer opacity-60 transition-shadow hover:shadow-lg'>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<div className='rounded-lg bg-muted p-2'>
									<FileText className='h-5 w-5' />
								</div>
								<CardTitle className='text-lg'>Sử dụng mẫu</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription>Chọn từ các mẫu đề tài có sẵn (Sắp có)</CardDescription>
						</CardContent>
					</Card>

					<Card className='cursor-pointer opacity-60 transition-shadow hover:shadow-lg'>
						<CardHeader>
							<div className='flex items-center gap-2'>
								<div className='rounded-lg bg-muted p-2'>
									<Sparkles className='h-5 w-5' />
								</div>
								<CardTitle className='text-lg'>AI gợi ý</CardTitle>
							</div>
						</CardHeader>
						<CardContent>
							<CardDescription>Để AI tạo đề tài dựa trên mô tả ngắn (Sắp có)</CardDescription>
						</CardContent>
					</Card>
				</div>

				{/* Guidelines */}
				<Card>
					<CardHeader>
						<CardTitle className='flex items-center gap-2'>
							<CheckCircle className='h-5 w-5 text-primary' />
							Hướng dẫn soạn đề tài chất lượng
						</CardTitle>
					</CardHeader>
					<CardContent className='space-y-3'>
						<div className='space-y-2'>
							<h4 className='font-medium'>Tên đề tài rõ ràng</h4>
							<p className='text-sm text-muted-foreground'>
								Sử dụng tên mô tả cụ thể mục đích và phạm vi. VD: "Xây dựng hệ thống quản lý sinh viên"
							</p>
						</div>

						<div className='space-y-2'>
							<h4 className='font-medium'> Mô tả đầy đủ</h4>
							<p className='text-sm text-muted-foreground'>
								Bao gồm: Mục tiêu, phạm vi công việc, kết quả mong đợi, và yêu cầu đầu vào/đầu ra
							</p>
						</div>

						<div className='space-y-2'>
							<h4 className='font-medium'> Yêu cầu kỹ năng cụ thể</h4>
							<p className='text-sm text-muted-foreground'>
								Liệt kê các lĩnh vực cần thiết để sinh viên tự đánh giá
							</p>
						</div>

						<div className='space-y-2'>
							<h4 className='font-medium'> Tài liệu tham khảo</h4>
							<p className='text-sm text-muted-foreground'>
								Cung cấp link hoặc tài liệu để sinh viên nghiên cứu trước khi đăng ký
							</p>
						</div>
					</CardContent>
				</Card>
			</div>

			<TopicEditDialog topic={emptyCreateTopic} open={showDialog} onOpenChange={setShowDialog} />
		</>
	)
}

export default NewTopic
