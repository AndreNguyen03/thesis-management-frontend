import { Skeleton } from '@/components/ui/skeleton'

export const MilestonePanelSkeleton = () => {
	return (
		<div className='min-h-screen bg-slate-50'>
			<div className='mx-auto max-w-5xl space-y-10 p-8'>
				{/* Header Skeleton */}
				<div className='space-y-4'>
					<div className='flex items-center gap-3'>
						<Skeleton className='h-4 w-16 rounded' />
						<Skeleton className='h-4 w-24 rounded' />
					</div>

					<Skeleton className='h-8 w-3/4 rounded-md' />
					<Skeleton className='h-4 w-1/2 rounded-md' />
				</div>

				{/* Section title */}
				<div className='flex items-center gap-2'>
					<Skeleton className='h-5 w-5 rounded' />
					<Skeleton className='h-5 w-48 rounded' />
				</div>

				{/* Milestone list */}
				<div className='space-y-4'>
					{Array.from({ length: 4 }).map((_, i) => (
						<div key={i} className='space-y-4 rounded-xl border border-slate-200 bg-white p-5'>
							{/* Title + status */}
							<div className='flex items-start justify-between gap-4'>
								<div className='flex-1 space-y-2'>
									<div className='flex items-center gap-3'>
										<Skeleton className='h-5 w-56 rounded' />
										<Skeleton className='h-5 w-24 rounded-full' />
										<Skeleton className='h-4 w-20 rounded' />
									</div>

									<div className='flex items-center gap-4'>
										<Skeleton className='h-4 w-32 rounded' />
										<Skeleton className='h-4 w-28 rounded' />
									</div>
								</div>

								<Skeleton className='h-5 w-5 rounded' />
							</div>

							{/* Progress */}
							<div className='flex items-center gap-3'>
								<Skeleton className='h-1.5 w-full rounded-full' />
								<Skeleton className='h-4 w-8 rounded' />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	)
}
