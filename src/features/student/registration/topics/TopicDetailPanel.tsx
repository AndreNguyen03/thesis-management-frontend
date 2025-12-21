import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Users, AlertTriangle, BookOpen, Code, GraduationCap, Loader2, CheckCircle2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { type ITopicDetail } from '@/models'
import DOMPurify from 'dompurify'

interface TopicDetailPanelProps {
	topic: ITopicDetail | null
	isOpen: boolean
	onClose: () => void
	onRegister: () => void
	isRegistering?: boolean
	disabled?: boolean
	isRegistered?: boolean
}

export function TopicDetailPanel({
	topic,
	isOpen,
	onClose,
	onRegister,
	isRegistering = false,
	disabled = false,
	isRegistered = false
}: TopicDetailPanelProps) {
	const navigate = useNavigate()

	if (!topic) return null

	const approvedCount = topic.students?.approvedStudents?.length ?? 0
	const pendingCount = topic.students?.pendingStudents?.length ?? 0
	const totalRegistered = approvedCount + pendingCount
	const remainingSlots = topic.maxStudents - totalRegistered

	const isFull = remainingSlots <= 0
	const slotColor = isFull ? 'text-destructive' : 'text-success'

	const mainLecturer = topic.createByInfo
	const coLecturers = topic.lecturers || []

	const handleLecturerClick = (id: string | undefined, e: React.MouseEvent) => {
		e.stopPropagation()
		if (id) {
			navigate(`/profile/lecturer/${id}`)
		}
	}

	const handleStudentClick = (id: string | undefined, e: React.MouseEvent) => {
		e.stopPropagation()
		if (id) {
			navigate(`/profile/student/${id}`)
		}
	}

	return (
		<Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
			<SheetContent side='right' className='w-full p-0 sm:max-w-lg'>
				<SheetHeader className='p-6 pb-0'>
					<SheetTitle className='text-left text-xl font-bold'>{topic.titleVN}</SheetTitle>
				</SheetHeader>

				<ScrollArea className='h-[calc(100vh-160px)] px-6'>
					<div className='space-y-6 py-6'>
						{/* Main Lecturer (Creator) */}
						{mainLecturer && (
							<div>
								<div 
									className='flex items-center gap-3 rounded-lg bg-muted/50 p-4 cursor-pointer hover:bg-muted'
									onClick={(e) => handleLecturerClick(mainLecturer._id, e)}
								>
									<Avatar className='h-12 w-12'>
										<AvatarImage src={mainLecturer.avatarUrl} />
										<AvatarFallback>{mainLecturer.fullName.slice(0, 2)}</AvatarFallback>
									</Avatar>
									<div className='min-w-0 flex-1'>
										<p className='font-medium hover:underline'>{mainLecturer.fullName}</p>
										<p className='text-sm text-muted-foreground'>{mainLecturer.email}</p>
									</div>
								</div>
								<p className='ml-15 mt-2 text-xs italic text-muted-foreground'>
									Người tạo đề tài (Hướng dẫn chính)
								</p>
							</div>
						)}

						{/* Co-Lecturers */}
						{coLecturers.length > 0 && (
							<div className='space-y-2'>
								<h4 className='font-semibold'>Đồng hướng dẫn</h4>
								<div className='flex flex-wrap gap-2'>
									{coLecturers.map((lecturer) => (
										<div
											key={lecturer._id}
											className='flex items-center gap-2 rounded-md bg-muted/30 p-2 cursor-pointer hover:bg-muted'
											onClick={(e) => handleLecturerClick(lecturer._id, e)}
										>
											<Avatar className='h-8 w-8'>
												<AvatarImage src={lecturer.avatarUrl} />
												<AvatarFallback>{lecturer.fullName.slice(0, 2)}</AvatarFallback>
											</Avatar>
											<div className='min-w-0 flex-1'>
												<p className='truncate text-sm font-medium hover:underline'>{lecturer.fullName}</p>
												{lecturer.facultyName && (
													<p className='truncate text-xs text-muted-foreground'>
														{lecturer.facultyName}
													</p>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Slots */}
						<div
							className={cn(
								'flex items-center gap-3 rounded-lg p-4',
								isFull ? 'bg-destructive/10' : 'bg-success/10'
							)}
						>
							{isFull ? (
								<AlertTriangle className={cn('h-6 w-6', slotColor)} />
							) : (
								<Users className={cn('h-6 w-6', slotColor)} />
							)}
							<div>
								<p className={cn('font-semibold', slotColor)}>
									{isFull
										? 'Đã hết slot đăng ký'
										: remainingSlots === 1
											? 'Chỉ còn 1 slot cuối cùng!'
											: `Còn ${remainingSlots} slot trống`}
								</p>
								<p className='text-sm text-muted-foreground'>
									{totalRegistered}/{topic.maxStudents} sinh viên đã đăng ký
								</p>
							</div>
						</div>

						<Separator />

						{/* Description */}
						<div className='space-y-3'>
							<div className='flex items-center gap-2'>
								<BookOpen className='h-5 w-5' />
								<h4 className='font-semibold'>Mô tả đề tài</h4>
							</div>
							<div
								className='prose max-w-none rounded-lg bg-gray-50 p-4'
								dangerouslySetInnerHTML={{
									__html: DOMPurify.sanitize(topic.description || '<p>Chưa có mô tả</p>')
								}}
							/>
						</div>

						<Separator />

						{/* Fields */}
						<div className='space-y-3'>
							<div className='flex items-center gap-2'>
								<GraduationCap className='h-5 w-5' />
								<h4 className='font-semibold'>Lĩnh vực</h4>
							</div>
							<div className='flex flex-wrap gap-2'>
								{topic.fields.map((field) => (
									<Badge key={field._id} variant='blue'>
										{field.name}
									</Badge>
								))}
							</div>
						</div>

						<Separator />

						{/* Requirements */}
						<div className='space-y-3'>
							<div className='flex items-center gap-2'>
								<Code className='h-5 w-5' />
								<h4 className='font-semibold'>Kỹ năng yêu cầu</h4>
							</div>
							<div className='flex flex-wrap gap-2'>
								{topic.requirements.map((req) => (
									<Badge key={req._id} variant='secondary'>
										{req.name}
									</Badge>
								))}
							</div>
						</div>

						{/* Approved students */}
						{(approvedCount > 0 || pendingCount > 0) && (
							<>
								<Separator />

								<div className='space-y-4'>
									<div className='flex items-center gap-2'>
										<Users className='h-5 w-5' />
										<h4 className='font-semibold'>Danh sách sinh viên đăng ký</h4>
									</div>

									{/* Approved students */}
									{topic.students?.approvedStudents?.map((s) => (
										<div
											key={s._id}
											className='flex items-center justify-between rounded-md border p-3'
										>
											<div 
												className='cursor-pointer hover:underline'
												onClick={(e) => handleStudentClick(s.student._id, e)}
											>
												<p className='font-medium'>{s.student.fullName}</p>
												<p className='text-sm text-muted-foreground'>{s.student.email}</p>
											</div>

											<Badge variant='success'>Đã duyệt</Badge>
										</div>
									))}

									{/* Pending students */}
									{topic.students?.pendingStudents?.map((s) => (
										<div
											key={s._id}
											className='flex items-center justify-between rounded-md border border-yellow-200 bg-yellow-50 p-3'
										>
											<div 
												className='cursor-pointer hover:underline'
												onClick={(e) => handleStudentClick(s.student._id, e)}
											>
												<p className='font-medium'>{s.student.fullName}</p>
												<p className='text-sm text-muted-foreground'>{s.student.email}</p>
											</div>

											<Badge variant='warning'>Chờ duyệt</Badge>
										</div>
									))}
								</div>
							</>
						)}
					</div>
				</ScrollArea>

				{/* Bottom action */}
				<div className='border-t p-6'>
					{isRegistered ? (
						<div className='flex items-center justify-center gap-2 rounded-lg bg-success/10 py-3 text-success'>
							<CheckCircle2 className='h-5 w-5' />
							<span>Bạn đã đăng ký đề tài này</span>
						</div>
					) : (
						<Button
							size='lg'
							className='w-full'
							disabled={isFull || isRegistering || disabled}
							onClick={onRegister}
						>
							{isRegistering ? (
								<>
									<Loader2 className='mr-2 h-4 w-4 animate-spin' />
									Đang xử lý...
								</>
							) : isFull ? (
								'Đã hết slot đăng ký'
							) : disabled ? (
								'Hủy đề tài hiện tại để đăng ký'
							) : (
								'Đăng ký đề tài này'
							)}
						</Button>
					)}
				</div>
			</SheetContent>
		</Sheet>
	)
}