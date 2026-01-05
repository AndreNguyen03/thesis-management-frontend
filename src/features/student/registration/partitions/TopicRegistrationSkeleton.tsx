import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { List, FileCheck } from 'lucide-react'

function TopicItemSkeleton() {
	return (
		<div className='flex items-center justify-between gap-4 border-b px-4 py-3 last:border-b-0'>
			<div className='flex-1 space-y-2'>
				<Skeleton className='h-4 w-3/4' />
				<Skeleton className='h-3 w-1/2' />
				<div className='flex gap-2'>
					<Skeleton className='h-5 w-16 rounded-full' />
					<Skeleton className='h-5 w-20 rounded-full' />
				</div>
			</div>

			<div className='flex gap-2'>
				<Skeleton className='h-8 w-20 rounded-md' />
				<Skeleton className='h-8 w-24 rounded-md' />
			</div>
		</div>
	)
}

export function TopicRegistrationSkeleton() {
	return (
		<div className='max-h-[calc(100vh)] w-full overflow-y-auto bg-background'>
			{/* HEADER */}
			<header className='border-b bg-card'>
				<div className='container space-y-2 py-4'>
					<Skeleton className='h-6 w-40' />
					<Skeleton className='h-4 w-64' />
				</div>
			</header>

			{/* TABS */}
			<div className='sticky top-0 z-20 border-b bg-card'>
				<div className='container py-2'>
					<Tabs value='list'>
						<TabsList className='h-10'>
							<TabsTrigger value='list' disabled>
								<List className='mr-1 h-4 w-4' />
								<Skeleton className='h-4 w-16' />
							</TabsTrigger>
							<TabsTrigger value='registered' disabled>
								<FileCheck className='mr-1 h-4 w-4' />
								<Skeleton className='h-4 w-20' />
							</TabsTrigger>
						</TabsList>
					</Tabs>
				</div>
			</div>

			{/* FILTER BAR */}
			<div className='sticky top-10 z-10 border-b bg-card'>
				<div className='container flex flex-wrap gap-3 py-3'>
					<Skeleton className='h-9 w-48' />
					<Skeleton className='h-9 w-48' />
					<Skeleton className='h-9 w-60' />
				</div>
			</div>

			{/* CONTENT */}
			<main className='container space-y-3 py-4'>
				{/* Topic list skeleton */}
				<div className='overflow-hidden rounded-lg border bg-card shadow-sm'>
					{Array.from({ length: 6 }).map((_, i) => (
						<TopicItemSkeleton key={i} />
					))}
				</div>

				{/* PAGINATION */}
				<div className='flex justify-center gap-2 pt-4'>
					<Skeleton className='h-8 w-8' />
					<Skeleton className='h-8 w-8' />
					<Skeleton className='h-8 w-8' />
					<Skeleton className='h-8 w-8' />
				</div>
			</main>
		</div>
	)
}
