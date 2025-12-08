import { Loader2 } from 'lucide-react'

export function LoadingMore() {
	return (
		<div className='animate-fade-in flex items-center justify-center gap-3 py-8 text-muted-foreground'>
			<Loader2 className='h-5 w-5 animate-spin' />
			<span>Đang tải thêm đề tài...</span>
		</div>
	)
}
