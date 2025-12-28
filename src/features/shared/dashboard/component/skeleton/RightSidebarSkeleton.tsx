import { Card, CardContent, CardHeader } from "@/components/ui";
import { Skeleton } from "@/components/ui/skeleton";

export function SidebarSkeleton() {
	return (
		<div className='space-y-6'>
			<Card>
				<CardHeader>
					<Skeleton className='h-4 w-32' />
				</CardHeader>
				<CardContent className='space-y-2'>
					<Skeleton className='h-4 w-full' />
					<Skeleton className='h-4 w-3/4' />
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<Skeleton className='h-4 w-32' />
				</CardHeader>
				<CardContent>
					<Skeleton className='h-20 w-full' />
				</CardContent>
			</Card>
		</div>
	)
}
