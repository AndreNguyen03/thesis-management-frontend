import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, AlertCircle, BookOpen } from 'lucide-react'
import type { DefenseResult } from '@/models'

interface GradingResultCardProps {
	topic: {
		titleVN: string
		titleEng: string
		type: string
		defenseResult?: DefenseResult
		isPublishedToLibrary: boolean
	}
}

export function GradingResultCard({ topic }: GradingResultCardProps) {
	if (!topic.defenseResult) {
		return (
			<Card className='rounded-xl border-border p-0'>
				<CardHeader className='pb-3'>
					<div className='flex items-center justify-between'>
						<CardTitle className='flex items-center gap-2 text-lg font-semibold text-foreground'>
							<Award className='h-5 w-5 text-primary' />
							Kết quả chấm điểm đề tài: {topic.titleVN}
						</CardTitle>
						<Badge className='border-info/20 bg-info/10 text-info'>Đang chờ</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className='flex items-center justify-center py-8'>
						<div className='text-center'>
							<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-info/10 text-info'>
								<AlertCircle className='h-6 w-6' />
							</div>
							<p className='mt-3 text-sm text-muted-foreground'>Đề tài đang được hội đồng chấm điểm.</p>
							<p className='mt-1 text-xs text-muted-foreground'>
								Kết quả sẽ được công bố sau khi hội đồng hoàn tất đánh giá.
							</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className='rounded-xl border-success/20 bg-success/5 p-0'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2 text-lg font-semibold text-foreground'>
						<Award className='h-5 w-5 text-success' />
						Kết quả {topic.type === 'thesis' ? 'khóa luận' : 'nghiên cứu khoa học'}
					</CardTitle>
					<Badge className='border-success/20 bg-success/10 text-success'>Hoàn thành</Badge>
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Score */}
				<div className='flex items-center justify-center py-4'>
					<div className='text-center'>
						<div className='text-5xl font-bold text-success'>{topic.defenseResult.finalScore}</div>
						<div className='text-5xl font-bold text-success'>
							Điểm bằng chữ : {topic.defenseResult.finalScore}
						</div>
					</div>
				</div>

				{/* Feedback */}
				<div className='rounded-lg border border-border bg-card p-4'>
					<p className='mb-2 text-sm font-medium text-foreground'>Nhận xét của hội đồng</p>
					{topic.defenseResult.councilMembers.map((member) => {
						return (
							<p className='text-sm leading-relaxed text-muted-foreground'>
								{member.role}. {member.fullName} : {member.note}, chấm: {member.score}
							</p>
						)
					})}
				</div>

				{/* Library notice */}
				{topic.isPublishedToLibrary && (
					<div className='flex items-center gap-2 border-t border-border pt-2'>
						<BookOpen className='h-4 w-4 text-muted-foreground' />
						<p className='text-xs text-muted-foreground'>Đề tài đã được lưu vào thư viện số của trường</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
