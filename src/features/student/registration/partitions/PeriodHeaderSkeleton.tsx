// components/period/PeriodHeaderSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function PeriodHeaderSkeleton() {
	return (
		<header className='border-b bg-card'>
			<div className='container space-y-2 py-4'>
				<Skeleton className='h-6 w-48' /> {/* Title */}
				<Skeleton className='h-4 w-64' /> {/* Subtitle */}
			</div>
		</header>
	)
}
