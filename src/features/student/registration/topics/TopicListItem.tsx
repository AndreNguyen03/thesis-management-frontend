import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/Button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar'
import { Users, AlertTriangle, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TopicStatus, type GeneralTopic } from '@/models'

interface TopicListItemProps {
	topic: GeneralTopic
	onClick: () => void
	onRegister: () => void
	isRegistering?: boolean
	disabled?: boolean
	isRegistered?: boolean
}

export function TopicListItem({
	topic,
	onClick,
	onRegister,
	isRegistering,
	disabled,
	isRegistered
}: TopicListItemProps) {
	const slotColor = topic.currentStatus === TopicStatus.FULL ? 'text-destructive' : 'text-success'

	const isButtonDisabled = topic.currentStatus === TopicStatus.FULL || isRegistering || disabled

	const getButtonContent = () => {
		if (isRegistering) {
			return <Loader2 className='h-4 w-4 animate-spin' />
		}
		if (isRegistered) {
			return (
				<>
					<CheckCircle2 className='mr-1 h-4 w-4' />
					Đã đăng ký
				</>
			)
		}
		if (topic.currentStatus === TopicStatus.FULL) {
			return 'Hết slot'
		}
		return 'Đăng ký'
	}

	return (
		<div
			className={cn(
				'animate-slide-in-up group flex cursor-pointer items-center gap-2 border-b border-border bg-card p-2 transition-colors hover:bg-gray-100',
				isRegistered && 'border-l-2 border-l-success bg-success/5'
			)}
			onClick={onClick}
		>
			{/* Title & Description */}
			<div className='min-w-0 flex-1'>
				<div className='mb-1 flex items-center gap-1'>
					<h3 className='truncate text-sm font-medium text-primary hover:underline'>{topic.titleVN}</h3>
					{isRegistered && (
						<Badge variant='secondary' className='shrink-0 bg-success/10 text-xs text-success'>
							Đã đăng ký
						</Badge>
					)}
				</div>
				<div className='flex items-center gap-2 text-xs text-muted-foreground'>
					<div className='flex items-center gap-1'>
						<Avatar className='h-4 w-4'>
							<AvatarImage src={topic.lecturers[0].avatarUrl} alt={topic.lecturers[0].fullName} />
							<AvatarFallback className='text-[8px]'>
								{topic.lecturers[0].fullName.slice(0, 2)}
							</AvatarFallback>
						</Avatar>
						<span className='max-w-[100px] truncate'>{topic.lecturers[0].fullName}</span>
					</div>
					{topic.fields.map((field) => (
						<span key={field._id} className='max-w-[80px] truncate'>
							{field.name}
						</span>
					))}
				</div>
			</div>

			{/* Skills */}
			<div className='hidden max-w-[150px] flex-wrap items-center gap-1.5 text-[10px] lg:flex'>
				{topic.requirements.slice(0, 3).map((req) => (
					<Badge key={req._id} variant='secondary' className='px-1 py-0.5'>
						{req.name}
					</Badge>
				))}
				{topic.requirements.length > 3 && (
					<Badge variant='secondary' className='px-1 py-0.5'>
						+{topic.requirements.length - 3}
					</Badge>
				)}
			</div>

			{/* Slots */}
			<div className={cn('flex items-center gap-1.5 text-xs', slotColor)}>
				{topic.currentStatus === TopicStatus.FULL ? (
					<AlertTriangle className='h-3 w-3' />
				) : (
					<Users className='h-3 w-3' />
				)}
				<span className='whitespace-nowrap font-medium'>
					{topic.studentsNum}/{topic.maxStudents}
				</span>
			</div>

			{/* Register button */}
			<Button
				size='sm'
				variant={isRegistered ? 'secondary' : 'default'}
				disabled={isButtonDisabled}
				onClick={(e) => {
					e.stopPropagation()
					if (!isRegistered) onRegister()
				}}
				className={cn(
					'min-w-[80px]',
					(topic.currentStatus === TopicStatus.FULL || disabled) && 'opacity-50',
					isRegistered && 'border-success/30 bg-success/10 text-success hover:bg-success/20'
				)}
			>
				{getButtonContent()}
			</Button>
		</div>
	)
}
