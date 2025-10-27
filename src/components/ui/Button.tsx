import { cn } from '@/utils/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?:
		| 'default'
		| 'outline'
		| 'secondary'
		| 'register'
		| 'ghost'
		| 'link'
		| 'destructive'
		| 'disable'
		| 'delete'
		| 'success'
		| 're_register'
		| 'back'
		| 'gray'
		| 'yellow'
	size?: 'default' | 'sm' | 'lg' | 'icon'
}

export function Button({ className, size = 'default', variant = 'default', ...props }: ButtonProps) {
	const variants = {
		default: 'bg-primary text-primary-foreground hover:opacity-90',
		destructive: 'bg-destructive/85 text-destructive-foreground hover:bg-destructive',
		outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
		secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
		ghost: 'hover:bg-accent hover:text-accent-foreground',
		link: 'text-primary underline-offset-4 hover:underline',
		disable: 'opacity-80 cursor-not-allowed text-gray-200',
		delete: 'bg-red-600 text-white hover:bg-red-700',
		success: 'bg-green-600 text-white hover:bg-green-700',
		re_register: 'bg-orange-600 text-white hover:bg-orange-700',
		register: 'bg-blue-600 text-white hover:bg-blue-700',
		back: 'mb-6 rounded-lg bg-blue-50 px-4 py-2 text-blue-700 hover:bg-blue-200',
		gray: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
		yellow: 'bg-yellow-300 text-gray-800 hover:bg-yellow-400'
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
				'flex w-full items-center justify-center rounded-lg px-4 py-2 font-medium transition-colors hover:cursor-pointer',
				variants[variant],
				sizes[size],
				className
			)}
			{...props}
		/>
	)
}
