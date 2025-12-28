import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function PeriodCardSkeleton() {
	return (
		<Card className='w-full rounded-xl p-0'>
			<CardHeader className='space-y-2'>
				<div className='flex items-center justify-between'>
					<div className='flex items-center gap-3'>
						<Skeleton className='h-5 w-5 rounded-full' />
						<Skeleton className='h-4 w-48' />
					</div>
					<Skeleton className='h-6 w-24' />
				</div>
			</CardHeader>

			<CardContent>
				<Skeleton className='h-4 w-full' />
				<Skeleton className='mt-2 h-4 w-2/3' />
			</CardContent>

			<CardContent className='py-6'>
				<div className='flex items-center'>
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className='flex items-center'>
							<div className='flex flex-col items-center gap-2'>
								<Skeleton className='h-10 w-10 rounded-full' />
								<Skeleton className='h-3 w-20' />
								<Skeleton className='h-3 w-16' />
							</div>

							{i < 3 && <Skeleton className='mx-2 h-0.5 w-16' />}
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	)
}
