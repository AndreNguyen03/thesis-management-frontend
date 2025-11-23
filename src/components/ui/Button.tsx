import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const buttonVariants = cva(
	'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
	{
		variants: {
			variant: {
				default: 'bg-primary text-primary-foreground hover:opacity-90',
				destructive: 'bg-destructive/85 text-destructive-foreground hover:bg-destructive',
				outline: 'border border-input bg-background hover:bg-muted hover:text-foreground transition-colors',
				secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
				ghost: ' bg-white border-gray-300 text-gray-500',
				link: 'text-primary underline-offset-4 hover:underline',
				disable: 'opacity-80 cursor-not-allowed text-gray-200',
				delete: 'bg-red-600 text-white hover:bg-red-700',
				success: 'bg-green-600 text-white hover:bg-green-700',
				re_register: 'bg-orange-600 text-white hover:bg-orange-700',
				register: 'bg-blue-600 text-white hover:bg-blue-700',
				back: ' rounded-lg bg-white px-4 py-2 text-blue-700 hover:bg-blue-200 shadow-sm',
				gray: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
				yellow: 'bg-yellow-300 text-gray-800 hover:bg-yellow-400',
				red: 'bg-red-500 text-white hover:bg-red-600',
				blue: 'bg-blue-600 text-white hover:bg-blue-700',
				active: 'bg-blue-600 text-white border-blue-600',
				nonactive: 'bg-gray-300 text-gray-700 pointer-events-none',
				outline_gray: 'border border-gray-300 bg-white text-gray-800 hover:bg-gray-100',
				send: 'bg-green-400 text-black hover:bg-green-700'
			},
			size: {
				default: 'h-10 px-4 py-2 ',
				sm: 'h-9 rounded-md px-3',
				lg: 'h-11 rounded-md px-8',
				icon: 'h-10 w-10 flex items-center justify-center rounded-md'
			}
		},
		defaultVariants: {
			variant: 'default',
			size: 'default'
		}
	}
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, ...props }, ref) => {
		const Comp = asChild ? Slot : 'button'
		return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
	}
)
Button.displayName = 'Button'

export { Button, buttonVariants }
