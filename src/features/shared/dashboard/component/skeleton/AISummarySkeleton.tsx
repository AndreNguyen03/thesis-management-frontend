import { Card, CardContent, CardHeader } from '@/components/ui'
import { Skeleton } from '@/components/ui/skeleton'

export function AISummaryCardSkeleton() {
	return (
		<Card>
			<CardHeader>
				<Skeleton className='h-4 w-40' />
			</CardHeader>
			<CardContent className='space-y-2'>
				<Skeleton className='h-4 w-full' />
				<Skeleton className='h-4 w-5/6' />
				<Skeleton className='h-4 w-4/6' />
			</CardContent>
		</Card>
	)
}
