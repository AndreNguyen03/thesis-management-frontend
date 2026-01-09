import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Award, AlertCircle, BookOpen } from 'lucide-react'
import type { DefenseResult } from '@/models'

interface GradingResultCardProps {
	topic: {
		titleVN: string
		type: string
		defenseResult?: DefenseResult
		isPublishedToLibrary: boolean
	}
}

export function GradingResultCard({ topic }: GradingResultCardProps) {
	if (!topic.defenseResult) {
		return (
			<Card className='m-2 rounded-xl border-border p-0'>
				<CardHeader className='pb-3'>
					<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
						<CardTitle className='flex items-center gap-2 break-words text-lg font-semibold text-foreground'>
							<Award className='h-5 w-5 text-primary' />
							Kết quả chấm điểm đề tài: {topic.titleVN}
						</CardTitle>
						<Badge className='border-success/20 bg-success/10 text-success'>Hoàn thành</Badge>
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

	// Nếu đã có defenseResult nhưng chưa công bố điểm
	if (topic.defenseResult && topic.defenseResult.isPublished === false) {
		return (
			<Card className='m-2 rounded-xl border-border p-0'>
				<CardHeader className='pb-3'>
					<div className='flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
						<CardTitle className='flex items-center gap-2 break-words text-lg font-semibold text-foreground'>
							<Award className='h-5 w-5 text-primary' />
							Kết quả chấm điểm đề tài: {topic.titleVN}
						</CardTitle>
						<Badge className='border-warning/20 bg-warning/10 text-warning'>Chuẩn bị công bố điểm</Badge>
					</div>
				</CardHeader>
				<CardContent>
					<div className='flex items-center justify-center py-8'>
						<div className='text-center'>
							<div className='mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-warning/10 text-warning'>
								<AlertCircle className='h-6 w-6' />
							</div>
							<p className='mt-3 text-sm text-muted-foreground'>
								Điểm số và nhận xét sẽ được công bố sau khi hội đồng xác nhận kết quả.
							</p>
							<p className='mt-1 text-xs text-muted-foreground'>Vui lòng chờ thông báo từ hội đồng.</p>
						</div>
					</div>
				</CardContent>
			</Card>
		)
	}

	return (
		<Card className='m-2 rounded-xl border-success/20 bg-success/5 p-2 sm:p-4'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2 text-lg font-semibold text-foreground'>
						<Award className='h-5 w-5 text-primary' />
						Kết quả chấm điểm đề tài: {topic.titleVN}
					</CardTitle>
					<Badge className='border-success/20 bg-success/10 text-success'>Hoàn thành</Badge>
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Score */}
				<div className='flex items-center justify-center py-4'>
					<div className='text-center'>
						<div className='text-center'>
							<div className='text-4xl font-bold text-success sm:text-5xl'>
								{topic.defenseResult.finalScore}
							</div>
						</div>
					</div>
				</div>

				{/* Feedback */}
				<div className='space-y-3 rounded-lg border border-border bg-card p-4'>
					<p className='mb-2 text-sm font-medium text-foreground'>Nhận xét của hội đồng</p>
					<div className='flex flex-col gap-2'>
						{topic.defenseResult.councilMembers.map((member, idx) => (
							<div
								key={idx}
								className='flex flex-col gap-1 rounded-md border border-border bg-muted/5 p-3 sm:flex-row sm:items-center sm:justify-between'
							>
								<div className='flex flex-col sm:flex-row sm:items-center sm:gap-2'>
									<span className='text-sm font-semibold text-foreground'>{member.role}</span>
									<span className='text-sm text-foreground'>{member.fullName}</span>
								</div>
								<div className='mt-1 text-sm text-muted-foreground sm:mt-0'>{member.note}</div>
								<div className='mt-1 text-base font-bold text-success sm:mt-0'>{member.score}</div>
							</div>
						))}
					</div>
				</div>

				{/* Library notice */}
				{topic.isPublishedToLibrary && (
					<div className='flex flex-wrap items-center gap-1 border-t border-border pt-2 sm:gap-2'>
						<BookOpen className='h-4 w-4 text-muted-foreground' />
						<p className='text-xs text-muted-foreground sm:text-sm'>
							Đề tài đã được lưu vào thư viện số của trường
						</p>
					</div>
				)}
			</CardContent>
		</Card>
	)
}
