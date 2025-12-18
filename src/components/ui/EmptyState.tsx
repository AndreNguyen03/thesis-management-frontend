import { Inbox } from 'lucide-react'
import { Card, CardContent } from '@/components/ui'

interface EmptyStateProps {
	title: string
	description?: string
}

export function EmptyState({ title, description }: EmptyStateProps) {
	return (
		<Card className='flex items-center justify-center border-none bg-transparent shadow-none'>
			<CardContent className='flex flex-col items-center space-y-3 text-center'>
				<Inbox className='h-8 w-8 text-muted-foreground' />
				<h3 className='text-lg font-semibold'>{title}</h3>
				<p className='max-w-sm text-sm text-muted-foreground'>{description}</p>
			</CardContent>
		</Card>
	)
}
