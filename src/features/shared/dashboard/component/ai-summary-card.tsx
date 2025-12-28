import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Sparkles, CheckCircle2, Circle, AlertTriangle } from 'lucide-react'

export function AISummaryCard() {
	return (
		<Card className='rounded-xl border-border p-0'>
			<CardHeader className='pb-3'>
				<CardTitle className='flex items-center gap-2 text-lg font-semibold text-foreground'>
					<Sparkles className='h-5 w-5 text-primary' />
					Tóm tắt tiến độ (AI)
				</CardTitle>
			</CardHeader>
			<CardContent className='space-y-4'>
				{/* Completed */}
				<div>
					<p className='mb-2 flex items-center gap-2 text-sm font-medium text-foreground'>
						<CheckCircle2 className='h-4 w-4 text-success' />
						Đã hoàn thành
					</p>
					<ul className='space-y-1.5 pl-6'>
						<li className='text-sm text-muted-foreground'>• Phân tích yêu cầu hệ thống</li>
						<li className='text-sm text-muted-foreground'>• Thiết kế cơ sở dữ liệu</li>
						<li className='text-sm text-muted-foreground'>• Xây dựng module đăng nhập</li>
					</ul>
				</div>

				{/* In Progress */}
				<div>
					<p className='mb-2 flex items-center gap-2 text-sm font-medium text-foreground'>
						<Circle className='h-4 w-4 text-primary' />
						Đang thực hiện
					</p>
					<ul className='space-y-1.5 pl-6'>
						<li className='text-sm text-muted-foreground'>• Phát triển giao diện Dashboard</li>
						<li className='text-sm text-muted-foreground'>• Tích hợp API quản lý đề tài</li>
					</ul>
				</div>

				{/* Issues */}
				<div>
					<p className='mb-2 flex items-center gap-2 text-sm font-medium text-foreground'>
						<AlertTriangle className='h-4 w-4 text-warning' />
						Vấn đề cần giải quyết
					</p>
					<ul className='space-y-1.5 pl-6'>
						<li className='text-sm text-muted-foreground'>• Cần tối ưu hiệu suất truy vấn database</li>
					</ul>
				</div>

				<p className='border-t border-border pt-2 text-xs text-muted-foreground'>
					Cập nhật lần cuối: 2 giờ trước
				</p>
			</CardContent>
		</Card>
	)
}
