import { UserCircle, Sparkles, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'


export function FallbackState() {
	return (
		<div className='rounded-lg border-2 border-dashed border-border p-5'>
			<div className='flex items-start gap-3'>
				<div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted'>
					<UserCircle className='h-5 w-5 text-muted-foreground' />
				</div>
				<div className='flex-1'>
					<h3 className='font-medium text-foreground'>Cá nhân hóa gợi ý của bạn</h3>
					<p className='mt-1 text-sm text-muted-foreground'>
						Cập nhật hồ sơ để nhận đề tài phù hợp với kỹ năng và sở thích
					</p>

					<Button className='mt-4 gap-2' size='sm'>
						<Sparkles className='h-3.5 w-3.5' />
						<span>Cập nhật hồ sơ</span>
						<ArrowRight className='h-3.5 w-3.5' />
					</Button>
				</div>
			</div>
		</div>
	)
}
