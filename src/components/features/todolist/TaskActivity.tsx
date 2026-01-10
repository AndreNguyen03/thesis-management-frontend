import type { TaskActivity as TaskActivityType } from '@/models/task-detail.model'
import { formatDistanceToNow } from 'date-fns'
import { vi as viLocale } from 'date-fns/locale'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Activity } from 'lucide-react'

interface TaskActivityProps {
	activities: TaskActivityType[]
}

export const TaskActivity = ({ activities }: TaskActivityProps) => {
	return (
		<ScrollArea className='max-h-[500px]'>
			<div className='space-y-3'>
				{activities.length === 0 ? (
					<p className='text-sm italic text-muted-foreground'>Chưa có hoạt động ở đây</p>
				) : (
					activities
						.slice()
						.reverse()
						.map((activity) => (
							<div key={activity._id} className='flex gap-3'>
								{/* Avatar */}
								<div className='flex-shrink-0'>
									{activity.user?.avatarUrl ? (
										<img
											src={activity.user.avatarUrl}
											alt={activity.user.fullName}
											className='h-6 w-6 rounded-full'
										/>
									) : (
										<div className='flex h-6 w-6 items-center justify-center rounded-full bg-primary/10'>
											<Activity className='h-3 w-3' />
										</div>
									)}
								</div>

								{/* Activity Info */}
								<div className='flex-1'>
									<div className='text-sm'>
										<span className='font-medium'>{activity.user?.fullName || 'Unknown'}</span>
										<span className='text-muted-foreground'> {activity.action}</span>
									</div>
									<div className='mt-0.5 text-xs text-muted-foreground'>
										{formatDistanceToNow(new Date(activity.created_at), {
											addSuffix: true,
											locale: viLocale
										})}
									</div>

									{/* Optional metadata */}
									{activity.metadata && (
										<div className='mt-1 rounded bg-muted/50 p-2 text-xs text-muted-foreground'>
											<pre className='whitespace-pre-wrap'>
												{JSON.stringify(activity.metadata, null, 2)}
											</pre>
										</div>
									)}
								</div>
							</div>
						))
				)}
			</div>
		</ScrollArea>
	)
}
