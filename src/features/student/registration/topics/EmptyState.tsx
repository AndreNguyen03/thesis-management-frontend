import { SearchX, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'

interface EmptyStateProps {
	onClearFilters: () => void
}

export function EmptyState({ onClearFilters }: EmptyStateProps) {
	return (
		<div className='animate-fade-in flex flex-col items-center justify-center px-4 py-16 text-center'>
			<div className='mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-muted'>
				<SearchX className='h-10 w-10 text-muted-foreground' />
			</div>
			<h3 className='mb-2 text-xl font-semibold text-foreground'>Không tìm thấy đề tài phù hợp</h3>
			<p className='mb-6 max-w-md text-muted-foreground'>
				Hãy thử thay đổi bộ lọc hoặc từ khóa tìm kiếm để tìm đề tài phù hợp hơn.
			</p>
			<Button variant='outline' onClick={onClearFilters} className='gap-2'>
				<RefreshCw className='h-4 w-4' />
				Xóa bộ lọc
			</Button>
		</div>
	)
}
