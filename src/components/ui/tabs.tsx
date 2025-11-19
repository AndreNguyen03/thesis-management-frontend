import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/lib/utils'

const Tabs = TabsPrimitive.Root

interface TabsListProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> {
	variant?: 'default' | 'pills' | 'underline'
}

const TabsList = React.forwardRef<React.ElementRef<typeof TabsPrimitive.List>, TabsListProps>(
	({ className, variant = 'default', ...props }, ref) => (
		<TabsPrimitive.List
			ref={ref}
			className={cn(
				'inline-flex items-center',
				{
					'h-10 justify-center rounded-md bg-muted p-1': variant === 'default',
					'gap-0.5 border-b border-gray-200 bg-slate-200': variant === 'underline',
					'gap-1 rounded-lg bg-gray-100 p-1': variant === 'pills'
				},
				className
			)}
			{...props}
		/>
	)
)
TabsList.displayName = TabsPrimitive.List.displayName

interface TabsTriggerProps extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> {
	variant?: 'default' | 'pills' | 'underline' | 'divided'
}

const TabsTrigger = React.forwardRef<React.ElementRef<typeof TabsPrimitive.Trigger>, TabsTriggerProps>(
	({ className, variant = 'default', ...props }, ref) => (
		<TabsPrimitive.Trigger
			ref={ref}
			className={cn(
				'inline-flex items-center justify-center whitespace-nowrap bg-white text-sm font-medium transition-all focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50',
				{
					'rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:shadow-sm':
						variant === 'default',
					'border-b-2 border-transparent px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-[#2D66C5]':
						variant === 'underline',

					'rounded-md px-4 py-2 data-[state=active]:bg-white data-[state=active]:shadow': variant === 'pills'
				},
				className
			)}
			{...props}
		/>
	)
)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = React.forwardRef<
	React.ElementRef<typeof TabsPrimitive.Content>,
	React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
	<TabsPrimitive.Content
		ref={ref}
		className={cn(
			'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
			className
		)}
		{...props}
	/>
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
