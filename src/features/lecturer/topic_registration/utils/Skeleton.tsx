import { Skeleton } from '@/components/ui/skeleton'

export function ManageApproveRegistrationSkeleton() {
	return (
		<div className="w-full space-y-6 p-4">
			{/* Title */}
			<Skeleton className="h-8 w-64" />

			{/* Filter bar */}
			<div className="flex flex-wrap items-center gap-4">
				<Skeleton className="h-10 w-40" /> {/* semester select */}
				<Skeleton className="h-10 w-64" /> {/* search */}
				<Skeleton className="h-10 w-32" /> {/* pending toggle */}
				<Skeleton className="h-10 w-24" /> {/* tab 1 */}
				<Skeleton className="h-10 w-24" /> {/* tab 2 */}
			</div>

			{/* Topic list */}
			<div className="space-y-4">
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className="rounded-lg border p-4 space-y-3"
					>
						{/* Topic title */}
						<Skeleton className="h-6 w-3/4" />

						{/* Lecturer / info row */}
						<div className="flex gap-4">
							<Skeleton className="h-4 w-32" />
							<Skeleton className="h-4 w-24" />
							<Skeleton className="h-4 w-24" />
						</div>

						{/* Student list */}
						<div className="space-y-2 pt-2">
							{Array.from({ length: 2 }).map((_, j) => (
								<div
									key={j}
									className="flex items-center justify-between rounded-md border p-3"
								>
									<div className="space-y-2">
										<Skeleton className="h-4 w-40" />
										<Skeleton className="h-3 w-28" />
									</div>

									<div className="flex gap-2">
										<Skeleton className="h-8 w-20" />
										<Skeleton className="h-8 w-20" />
									</div>
								</div>
							))}
						</div>
					</div>
				))}
			</div>
		</div>
	)
}
