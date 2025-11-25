import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { StatusBadge } from './StatusBadge'
import { PhaseBadge } from './PhaseBadge'
import {
	Edit2,
	Save,
	X,
	FileText,
	Users,
	BookOpen,
	Calendar,
	CheckCircle2,
	Clock,
	User,
	GraduationCap,
	Award
} from 'lucide-react'
import type { Topic, TopicType } from '@/models/topic'
import { toast } from '@/hooks/use-toast'

// Mock data for demo
const mockTopic: Topic = {
	_id: '1',
	titleVN: 'Phát triển hệ thống quản lý đề tài khoa học sử dụng React và Node.js',
	titleEng: 'Development of Scientific Research Topic Management System using React and Node.js',
	description:
		'Xây dựng một hệ thống quản lý đề tài khoa học toàn diện, bao gồm các chức năng đăng ký, theo dõi tiến độ, đánh giá và chấm điểm. Hệ thống hỗ trợ nhiều loại đề tài khác nhau và có thể mở rộng cho nhiều chuyên ngành.',
	type: 'Khóa luận tốt nghiệp',
	major: {
		_id: 'major1',
		name: 'Công nghệ thông tin',
		facultyId: 'faculty1',
		created_at: '2024-01-01'
	},
	maxStudents: 2,
	referenceDocs: ['https://example.com/doc1.pdf', 'https://example.com/doc2.pdf'],
	createBy: 'lecturer1',
	currentStatus: 'approved',
	currentPhase: 'open_registration',
	phaseHistories: [
		{
			_id: 'ph1',
			phaseName: 'submit_topic',
			status: 'submitted',
			actor: 'Lecturer A',
			notes: 'Đã nộp đề tài',
			created_at: '2024-01-15'
		},
		{
			_id: 'ph2',
			phaseName: 'submit_topic',
			status: 'approved',
			actor: 'Admin B',
			notes: 'Đề tài được phê duyệt',
			created_at: '2024-01-20'
		}
	],
	periodId: 'period1',
	grade: {
		_id: 'grade1',
		averageScore: 8.5,
		detailGrades: [
			{
				_id: 'dg1',
				score: 8.0,
				note: 'Tốt',
				actorId: 'lecturer1'
			},
			{
				_id: 'dg2',
				score: 9.0,
				note: 'Xuất sắc',
				actorId: 'lecturer2'
			}
		]
	},
	requirementIds: ['req1', 'req2'],
	fileIds: ['file1', 'file2'],
	lecturers: [
		{
			userId: 'lec1',
			fullName: 'TS. Nguyễn Văn A',
			email: 'nguyenvana@university.edu.vn',
			facultyId: 'faculty1',
			facultyName: 'Khoa CNTT',
			title: 'Tiến sĩ',
			role: 'lecturer',
			isActive: true
		},
		{
			userId: 'lec2',
			fullName: 'ThS. Trần Thị B',
			email: 'tranthib@university.edu.vn',
			facultyId: 'faculty1',
			facultyName: 'Khoa CNTT',
			title: 'Thạc sĩ',
			role: 'lecturer',
			isActive: true
		}
	],
	students: [
		{
			id: 'std1',
			fullName: 'Lê Văn C',
			email: 'levanc@student.edu.vn',
			role: 'student',
			class: '2021001',
			major: 'Công nghệ thông tin',
			introduction: 'Sinh viên năm 4',
			skills: ['React', 'Node.js'],
			projects: [],
			subjects: [],
			interests: ['Web Development'],
			isActive: true
		}
	],
	fields: [
		{
			_id: 'field1',
			name: 'Web Development',
			slug: 'web-development',
			description: 'Phát triển ứng dụng web'
		},
		{
			_id: 'field2',
			name: 'Database Management',
			slug: 'database-management',
			description: 'Quản lý cơ sở dữ liệu'
		}
	],
	requirements: [
		{
			_id: 'req1',
			name: 'Có kiến thức về React',
			slug: 'react-knowledge'
		},
		{
			_id: 'req2',
			name: 'Có kiến thức về Node.js',
			slug: 'nodejs-knowledge'
		}
	],
	created_at: '2024-01-15',
	updated_at: '2024-01-20'
}

const TopicDetail = () => {
	const [isEditing, setIsEditing] = useState(false)
	const [topic, setTopic] = useState<Topic>(mockTopic)
	const [editedTopic, setEditedTopic] = useState<Topic>(mockTopic)

	const handleEdit = () => {
		setIsEditing(true)
		setEditedTopic(topic)
	}

	const handleCancel = () => {
		setIsEditing(false)
		setEditedTopic(topic)
	}

	const handleSave = () => {
		setTopic(editedTopic)
		setIsEditing(false)
		toast({
			title: 'Lưu đề tài thành công',
			description: 'Thông tin đề tài đã được cập nhật.'
		})
	}

	const handleInputChange = (field: keyof Topic, value: any) => {
		setEditedTopic((prev) => ({ ...prev, [field]: value }))
	}

	const currentTopic = isEditing ? editedTopic : topic
    
	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto max-w-6xl px-4 py-8'>
				{/* Header */}
				<div className='mb-8'>
					<div className='mb-4 flex items-start justify-between'>
						<div className='flex-1'>
							<div className='mb-2 flex items-center gap-3'>
								<PhaseBadge phase={currentTopic.currentPhase} />
								<StatusBadge status={currentTopic.currentStatus} />
							</div>
							{isEditing ? (
								<div className='space-y-4'>
									<div>
										<Label>Tên đề tài (Tiếng Việt)</Label>
										<Input
											value={currentTopic.titleVN}
											onChange={(e) => handleInputChange('titleVN', e.target.value)}
											className='h-auto py-3 text-2xl font-bold'
										/>
									</div>
									<div>
										<Label>Tên đề tài (Tiếng Anh)</Label>
										<Input
											value={currentTopic.titleEng}
											onChange={(e) => handleInputChange('titleEng', e.target.value)}
											className='h-auto py-2 text-lg'
										/>
									</div>
								</div>
							) : (
								<>
									<h1 className='mb-2 text-3xl font-bold text-foreground'>{currentTopic.titleVN}</h1>
									<p className='text-lg italic text-muted-foreground'>{currentTopic.titleEng}</p>
								</>
							)}
						</div>
						<div className='ml-4 flex gap-2'>
							{!isEditing ? (
								<Button onClick={handleEdit} variant='default'>
									<Edit2 className='mr-2 h-4 w-4' />
									Chỉnh sửa
								</Button>
							) : (
								<>
									<Button onClick={handleSave} variant='default'>
										<Save className='mr-2 h-4 w-4' />
										Lưu
									</Button>
									<Button onClick={handleCancel} variant='outline'>
										<X className='mr-2 h-4 w-4' />
										Hủy
									</Button>
								</>
							)}
						</div>
					</div>
					<div className='flex items-center gap-4 text-sm text-muted-foreground'>
						<div className='flex items-center gap-1'>
							<Calendar className='h-4 w-4' />
							<span>Tạo: {new Date(currentTopic.created_at || '').toLocaleDateString('vi-VN')}</span>
						</div>
						<div className='flex items-center gap-1'>
							<Clock className='h-4 w-4' />
							<span>Cập nhật: {new Date(currentTopic.updated_at || '').toLocaleDateString('vi-VN')}</span>
						</div>
					</div>
				</div>

				<div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
					{/* Main Content */}
					<div className='space-y-6 lg:col-span-2'>
						{/* Description */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<FileText className='h-5 w-5' />
									Mô tả đề tài
								</CardTitle>
							</CardHeader>
							<CardContent>
								{isEditing ? (
									<Textarea
										value={currentTopic.description}
										onChange={(e) => handleInputChange('description', e.target.value)}
										className='min-h-[150px]'
									/>
								) : (
									<p className='leading-relaxed text-foreground'>{currentTopic.description}</p>
								)}
							</CardContent>
						</Card>

						{/* Fields */}
						{currentTopic.fields && currentTopic.fields.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<BookOpen className='h-5 w-5' />
										Lĩnh vực nghiên cứu
									</CardTitle>
								</CardHeader>
								<CardContent>
									<div className='flex flex-wrap gap-2'>
										{currentTopic.fields.map((field) => (
											<Badge key={field._id} variant='secondary' className='text-sm'>
												{field.name}
											</Badge>
										))}
									</div>
								</CardContent>
							</Card>
						)}

						{/* Requirements */}
						{currentTopic.requirements && currentTopic.requirements.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<CheckCircle2 className='h-5 w-5' />
										Yêu cầu
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className='space-y-2'>
										{currentTopic.requirements.map((req) => (
											<li key={req._id} className='flex items-start gap-2'>
												<CheckCircle2 className='mt-0.5 h-5 w-5 flex-shrink-0 text-primary' />
												<span className='text-foreground'>{req.name}</span>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						)}

						{/* Reference Docs */}
						{currentTopic.referenceDocs && currentTopic.referenceDocs.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<FileText className='h-5 w-5' />
										Tài liệu tham khảo
									</CardTitle>
								</CardHeader>
								<CardContent>
									<ul className='space-y-2'>
										{currentTopic.referenceDocs.map((doc, idx) => (
											<li key={idx}>
												<a
													href={doc}
													target='_blank'
													rel='noopener noreferrer'
													className='flex items-center gap-2 text-primary hover:underline'
												>
													<FileText className='h-4 w-4' />
													{doc}
												</a>
											</li>
										))}
									</ul>
								</CardContent>
							</Card>
						)}

						{/* Phase History */}
						<Card>
							<CardHeader>
								<CardTitle className='flex items-center gap-2'>
									<Clock className='h-5 w-5' />
									Lịch sử giai đoạn
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='space-y-4'>
									{currentTopic.phaseHistories.map((history, idx) => (
										<div key={history._id}>
											<div className='flex items-start gap-3'>
												<div className='mt-1'>
													<div className='h-2 w-2 rounded-full bg-primary' />
												</div>
												<div className='flex-1'>
													<div className='mb-1 flex items-center gap-2'>
														<PhaseBadge phase={history.phaseName} />
														<StatusBadge status={history.status} />
													</div>
													<p className='text-sm text-muted-foreground'>
														{history.actor} •{' '}
														{new Date(history.created_at || '').toLocaleDateString('vi-VN')}
													</p>
													{history.notes && (
														<p className='mt-1 text-sm text-foreground'>{history.notes}</p>
													)}
												</div>
											</div>
											{idx < currentTopic.phaseHistories.length - 1 && (
												<div className='my-2 ml-1 h-6 w-0.5 bg-border' />
											)}
										</div>
									))}
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Sidebar */}
					<div className='space-y-6'>
						{/* Basic Info */}
						<Card>
							<CardHeader>
								<CardTitle>Thông tin cơ bản</CardTitle>
							</CardHeader>
							<CardContent className='space-y-4'>
								<div>
									<Label className='text-muted-foreground'>Loại đề tài</Label>
									{isEditing ? (
										<select
											value={currentTopic.type}
											onChange={(e) => handleInputChange('type', e.target.value as TopicType)}
											className='mt-1 w-full rounded-md border border-input bg-background px-3 py-2'
										>
											<option value='Khóa luận tốt nghiệp'>Khóa luận tốt nghiệp</option>
											<option value='Nghiên cứu khoa học'>Nghiên cứu khoa học</option>
										</select>
									) : (
										<p className='font-medium text-foreground'>{currentTopic.type}</p>
									)}
								</div>
								<Separator />
								<div>
									<Label className='text-muted-foreground'>Chuyên ngành</Label>
									<p className='font-medium text-foreground'>
										{typeof currentTopic.major === 'object'
											? currentTopic.major.name
											: currentTopic.major}
									</p>
								</div>
								<Separator />
								<div>
									<Label className='text-muted-foreground'>Số sinh viên tối đa</Label>
									{isEditing ? (
										<Input
											type='number'
											value={currentTopic.maxStudents}
											onChange={(e) => handleInputChange('maxStudents', parseInt(e.target.value))}
											className='mt-1'
										/>
									) : (
										<p className='font-medium text-foreground'>{currentTopic.maxStudents}</p>
									)}
								</div>
							</CardContent>
						</Card>

						{/* Lecturers */}
						{currentTopic.lecturers && currentTopic.lecturers.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<GraduationCap className='h-5 w-5' />
										Giảng viên hướng dẫn
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-3'>
									{currentTopic.lecturers.map((lecturer) => (
										<div key={lecturer.userId} className='flex items-start gap-3'>
											<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10'>
												<User className='h-5 w-5 text-primary' />
											</div>
											<div className='min-w-0 flex-1'>
												<p className='font-medium text-foreground'>{lecturer.fullName}</p>
												<p className='text-xs text-muted-foreground'>{lecturer.title}</p>
												<p className='truncate text-sm text-muted-foreground'>
													{lecturer.email}
												</p>
												<p className='text-xs text-muted-foreground'>{lecturer.facultyName}</p>
											</div>
										</div>
									))}
								</CardContent>
							</Card>
						)}

						{/* Students */}
						{currentTopic.students && currentTopic.students.length > 0 && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Users className='h-5 w-5' />
										Sinh viên thực hiện
									</CardTitle>
									<CardDescription>
										{currentTopic.students.length}/{currentTopic.maxStudents} sinh viên
									</CardDescription>
								</CardHeader>
								<CardContent className='space-y-3'>
									{currentTopic.students.map((student) => (
										<div key={student.id} className='flex items-start gap-3'>
											<div className='flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent/10'>
												<User className='h-5 w-5 text-accent' />
											</div>
											<div className='min-w-0 flex-1'>
												<p className='font-medium text-foreground'>{student.fullName}</p>
												<p className='text-sm text-muted-foreground'>Lớp: {student.class}</p>
												<p className='truncate text-xs text-muted-foreground'>
													{student.email}
												</p>
											</div>
										</div>
									))}
								</CardContent>
							</Card>
						)}

						{/* Grade */}
						{currentTopic.grade && currentTopic.grade.averageScore && (
							<Card>
								<CardHeader>
									<CardTitle className='flex items-center gap-2'>
										<Award className='h-5 w-5' />
										Điểm đánh giá
									</CardTitle>
								</CardHeader>
								<CardContent className='space-y-4'>
									<div className='text-center'>
										<p className='text-4xl font-bold text-primary'>
											{currentTopic.grade.averageScore.toFixed(1)}
										</p>
										<p className='text-sm text-muted-foreground'>Điểm trung bình</p>
									</div>
									{currentTopic.grade.detailGrades.length > 0 && (
										<>
											<Separator />
											<div className='space-y-2'>
												{currentTopic.grade.detailGrades.map((grade, idx) => (
													<div key={grade._id} className='flex items-start justify-between'>
														<div>
															<p className='text-sm font-medium text-foreground'>
																Giảng viên {idx + 1}
															</p>
															{grade.note && (
																<p className='text-xs text-muted-foreground'>
																	{grade.note}
																</p>
															)}
														</div>
														<Badge variant='outline' className='font-bold'>
															{grade.score.toFixed(1)}
														</Badge>
													</div>
												))}
											</div>
										</>
									)}
								</CardContent>
							</Card>
						)}
					</div>
				</div>
			</div>
		</div>
	)
}

export default TopicDetail
