import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/badge'
import { Clock, FileSearch } from 'lucide-react'

export function RegistrationCard() {
	return (
		<Card className='rounded-xl border-primary/20 bg-primary/5 p-0'>
			<CardHeader className='pb-3'>
				<div className='flex items-center justify-between'>
					<CardTitle className='flex items-center gap-2 text-lg font-semibold text-foreground'>
						<FileSearch className='h-5 w-5 text-primary' />
						Đăng ký đề tài khóa luận
					</CardTitle>
					<Badge className='border-warning/20 bg-warning/10 text-warning'>
						<Clock className='mr-1 h-3 w-3' />
						Còn 5 ngày
					</Badge>
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				<div className='rounded-lg border border-border bg-card p-4'>
					<div className='flex items-center justify-between'>
						<div>
							<p className='text-sm text-muted-foreground'>Trạng thái đăng ký</p>
							<p className='mt-1 font-medium text-foreground'>Chưa đăng ký đề tài</p>
						</div>
						<Badge variant='secondary'>Chờ đăng ký</Badge>
					</div>
				</div>

				<div className='flex flex-col gap-3 sm:flex-row'>
					<Button className='flex-1 rounded-xl' size='lg'>
						Xem danh sách đề tài
					</Button>
					<Button variant='outline' className='flex-1 rounded-xl bg-transparent' size='lg'>
						Hướng dẫn đăng ký
					</Button>
				</div>

				<p className='text-center text-xs text-muted-foreground'>Thời hạn đăng ký: 01/03/2024 - 15/03/2024</p>
			</CardContent>
		</Card>
	)
}
