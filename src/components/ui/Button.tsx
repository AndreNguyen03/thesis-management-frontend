import { cn } from '@/utils/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive',
    size? : 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ className, size = 'default', variant = 'default', ...props }: ButtonProps) {
	const variants = {
		default: 'bg-primary text-primary-foreground hover:bg-primary/90',
		destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline'
	}

	const sizes = {
		default: 'h-10 px-4 py-2 ',
		sm: 'h-9 rounded-md px-3',
		lg: 'h-11 rounded-md px-8',
		icon: 'h-10 w-10 flex items-center justify-center rounded-md  p-0'
	}

	return (
		<button
			className={cn(
				'w-full rounded-lg px-4 py-2 font-medium transition-colors',
				variants[variant],
				sizes[size],
				className
			)}
			{...props}
		/>
	)
}
