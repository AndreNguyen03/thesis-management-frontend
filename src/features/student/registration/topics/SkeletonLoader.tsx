import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonLoaderProps {
	count?: number
}

function ListSkeleton() {
	return (
		<div className='flex items-center gap-4 border-b border-border p-4'>
			<div className='flex-1 space-y-2'>
				<Skeleton className='skeleton-shimmer h-5 w-3/4' />
				<div className='flex items-center gap-3'>
					<Skeleton className='skeleton-shimmer h-5 w-5 rounded-full' />
					<Skeleton className='skeleton-shimmer h-4 w-32' />
				</div>
			</div>
			<div className='hidden gap-1.5 lg:flex'>
				<Skeleton className='skeleton-shimmer h-6 w-16 rounded-full' />
				<Skeleton className='skeleton-shimmer h-6 w-14 rounded-full' />
				<Skeleton className='skeleton-shimmer h-6 w-12 rounded-full' />
			</div>
			<Skeleton className='skeleton-shimmer h-5 w-12' />
			<Skeleton className='skeleton-shimmer h-9 w-24 rounded-md' />
		</div>
	)
}

export function SkeletonLoader({ count = 6 }: SkeletonLoaderProps) {
	return (
		<div className='overflow-hidden rounded-lg border border-border bg-card'>
			{Array.from({ length: count }).map((_, i) => (
				<ListSkeleton key={i} />
			))}
		</div>
	)
}
