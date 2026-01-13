import type { TaskActivity as TaskActivityType } from '@/models/task-detail.model'
import { formatDistanceToNow } from 'date-fns'
import { vi as viLocale } from 'date-fns/locale'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar } from '@/features/shared/workspace/components/Avatar'

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
								<Avatar
									fullName={activity.user?.fullName || 'Unknown'}
									avatarUrl={activity.user?.avatarUrl}
								/>

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
