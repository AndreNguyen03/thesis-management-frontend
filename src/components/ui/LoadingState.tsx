import { Loader2 } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

interface LoadingStateProps {
	message?: string
}

export function LoadingState({ message = 'Đang tải dữ liệu...' }: LoadingStateProps) {
	return (
		<Card className='flex h-full items-center justify-center border-none bg-transparent shadow-none'>
			<CardContent className='flex flex-col items-center space-y-3 text-center'>
				<Loader2 className='h-6 w-6 animate-spin text-muted-foreground' />
				<p className='text-sm text-muted-foreground'>{message}</p>
			</CardContent>
		</Card>
	)
}
