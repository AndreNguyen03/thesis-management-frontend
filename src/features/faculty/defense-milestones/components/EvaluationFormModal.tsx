import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle2, Download } from 'lucide-react'
import type { DefenseMilestoneDto, TopicAssignment } from '@/models/defenseCouncil.model'
import type { MiniPeriod } from '@/models/period.model'
import { topicApi } from '@/services/topicApi'

interface ContextData {
	defenseMilestone: DefenseMilestoneDto // Đợt bảo vệ
	periodInfo: MiniPeriod
	name: string // VD: "Hội đồng 1 - Phòng E03.2"
	location: string // Phòng bảo vệ
	scheduledDate: Date // Thời gian bảo vệ
	topic: TopicAssignment
}
interface EvaluationFormModalProps {
	isOpen: boolean
	onClose: () => void
	context: ContextData
}

export function EvaluationFormModal({ isOpen, onClose, context }: EvaluationFormModalProps) {
	const [selectedStudent, setSelectedStudent] = useState(0)

	const evaluationData = {
		decisionNumber: 'Quyết định số XYZ-2024/QĐ-KLTN',
		decisionDate: '___/___/2024',
		councilMeetingDate: '15/01/2024',
		thesisTitle: context.topic.titleVN,
		students: context.topic.studentNames.map((name, index) => ({
			_id: index,
			name: name
		})),
		evaluationCriteria: [
			{
				category: '1. Ý nghĩa khoa học, giá trị thực tiễn',
				maxScore: 3.0,
				subcriteria: [
					{ name: '1.1. Tính mới và độ phức tạp', maxScore: 1.5, score: 1.4 },
					{ name: '1.2. Tính thực tiễn và đóng góp', maxScore: 1.5, score: 1.5 }
				],
				score: 2.9
			},
			{
				category: '2. Vận dụng kiến thức nền tảng và chuyên sâu ngành KTPM',
				maxScore: 3.0,
				subcriteria: [
					{
						name: '2.1. Khả năng tìm hiểu, phân tích yêu cầu và thiết kế hệ thống',
						maxScore: 1.0,
						score: 1.0
					},
					{ name: '2.2. Khả năng hiện thực hoá, kiểm thử và vận hành hệ thống', maxScore: 1.0, score: 0.9 },
					{ name: '2.3. Học hỏi và cập nhật kiến thức, công nghệ mới', maxScore: 1.0, score: 1.0 }
				],
				score: 2.9
			},
			{
				category: '3. Trình bày kết quả',
				maxScore: 3.0,
				subcriteria: [
					{ name: '3.1. Nội dung trình bày cuốn báo và sản phẩm (viết)', maxScore: 1.0, score: 0.95 },
					{ name: '3.2. Kỹ năng trình bày (nói)', maxScore: 1.0, score: 0.9 },
					{ name: '3.3. Trả lời các câu hỏi', maxScore: 1.0, score: 1.0 }
				],
				score: 2.85
			},
			{
				category: '4. Kỹ năng mềm',
				maxScore: 1.0,
				subcriteria: [
					{ name: '4.1. Lập kế hoạch và quản lý thời gian', maxScore: 0.5, score: 0.5 },
					{ name: '4.2. Kỹ năng tìm hiểu, đọc hiểu tài liệu ngoại ngữ', maxScore: 0.5, score: 0.45 }
				],
				score: 0.95
			}
		]
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className='max-h-[90vh] w-full max-w-2xl overflow-y-auto border-border bg-card'>
				<DialogHeader className='sticky top-0 bg-card pb-4'>
					<DialogTitle className='text-2xl font-bold text-foreground'>
						Phiếu Đánh giá Khóa luận Tốt nghiệp
					</DialogTitle>
					<p className='mt-1 text-sm text-muted-foreground'>KLTN-7 | Khoa Công nghệ Thông tin</p>
				</DialogHeader>

				<Separator className='bg-border' />

				{/* Decision Info */}
				<div className='space-y-3'>
					<div className='grid gap-3 sm:grid-cols-2'>
						<div className='rounded-lg bg-secondary/30 p-3'>
							<p className='text-xs font-semibold text-muted-foreground'>QUYẾT ĐỊNH THÀNH LẬP HỘI ĐỒNG</p>
							<p className='mt-1 font-medium text-foreground'>{evaluationData.decisionNumber}</p>
						</div>
						<div className='rounded-lg bg-secondary/30 p-3'>
							<p className='text-xs font-semibold text-muted-foreground'>NGÀY HỌP HỘI ĐỒNG</p>
							<p className='mt-1 font-medium text-foreground'>{evaluationData.councilMeetingDate}</p>
						</div>
					</div>
				</div>

				{/* Thesis Info */}
				<div className='rounded-lg border border-border bg-secondary/10 p-4'>
					<p className='text-xs font-semibold text-muted-foreground'>ĐỀ TÀI KHÓA LUẬN</p>
					<p className='mt-2 font-medium text-foreground'>{evaluationData.thesisTitle}</p>
				</div>

				{/* Student Selection */}
				<div>
					<p className='mb-3 text-sm font-semibold text-muted-foreground'>SINH VIÊN THỰC HIỆN</p>
					<div className='flex flex-wrap gap-2'>
						{evaluationData.students.map((student, index) => (
							<Button
								key={index}
								onClick={() => setSelectedStudent(index)}
								variant={selectedStudent === index ? 'default' : 'outline'}
								className={
									selectedStudent === index
										? 'bg-primary text-primary-foreground'
										: 'border-border text-foreground'
								}
							>
								<span className='font-medium'>{student.name}</span>
								<span className='ml-2 text-xs opacity-70'>({student._id})</span>
							</Button>
						))}
					</div>
				</div>

				{/* Evaluation Criteria */}
				<div className='space-y-4'>
					<p className='text-sm font-semibold text-muted-foreground'>
						PHẦN CHẤM ĐIỂM DÀNH CHO THÀNH VIÊN HỘI ĐỒNG
					</p>

					{evaluationData.evaluationCriteria.map((criterion, idx) => (
						<Card key={idx} className='border-border bg-secondary/20'>
							<CardHeader className='pb-3'>
								<div className='flex items-start justify-between'>
									<div className='flex-1'>
										<CardTitle className='text-sm font-semibold text-foreground'>
											{criterion.category}
										</CardTitle>
										<p className='mt-1 text-xs text-muted-foreground'>
											Điểm tối đa: {criterion.maxScore}
										</p>
									</div>
									<Badge className='ml-2 bg-primary text-primary-foreground'>
										{criterion.score.toFixed(2)}
									</Badge>
								</div>
							</CardHeader>
							<CardContent className='space-y-2'>
								{criterion.subcriteria.map((sub, subIdx) => (
									<div
										key={subIdx}
										className='flex items-center justify-between rounded bg-secondary/30 px-3 py-2 text-sm'
									>
										<span className='text-foreground'>{sub.name}</span>
										<div className='flex items-center gap-3'>
											<span className='text-xs text-muted-foreground'>/{sub.maxScore}</span>
											<Badge
												variant='secondary'
												className='min-w-fit bg-background text-foreground'
											>
												{sub.score}
											</Badge>
										</div>
									</div>
								))}
							</CardContent>
						</Card>
					))}
				</div>

				{/* Total Score */}
				<Card className='border-primary bg-primary/5'>
					<CardHeader className='pb-2'>
						<div className='flex items-center justify-between'>
							<CardTitle className='text-base text-foreground'>
								Điểm tổng kết (Student {evaluationData.students[selectedStudent].name})
							</CardTitle>
							<Badge className='bg-primary px-4 py-2 text-lg text-primary-foreground'>8.54</Badge>
						</div>
					</CardHeader>
				</Card>

				{/* Actions */}
				<div className='flex gap-2'>
					<Button className='flex-1 bg-primary text-primary-foreground hover:bg-primary/90' onClick={onClose}>
						<CheckCircle2 className='mr-2 h-4 w-4' />
						Xác nhận
					</Button>
					<Button
						variant='outline'
						className='border-border bg-transparent text-foreground hover:bg-secondary'
					>
						<Download className='mr-2 h-4 w-4' />
						Tải xuống
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	)
}
