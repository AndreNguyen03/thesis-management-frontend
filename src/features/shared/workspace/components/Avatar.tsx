import { cn } from '@/lib/utils'
import { getAvatarInitials } from '@/utils/utils'

export const Avatar = ({
	fullName,
	avatarUrl,
	size = 32,
	className
}: {
	fullName?: string
	avatarUrl?: string
	size?: number
	className?: string
}) => {

	if (avatarUrl) {
		return (
			<img
				src={avatarUrl}
				alt={fullName}
				className={cn('rounded-full object-cover', className)}
				style={{ width: size, height: size }}
			/>
		)
	}

	return (
		<div
			className={cn(
				'flex items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground',
				className
			)}
			style={{ width: size, height: size }}
		>
			{getAvatarInitials(fullName)}
		</div>
	)
}
