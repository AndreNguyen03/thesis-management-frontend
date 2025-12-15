import { SidebarProvider } from '../../contexts/SidebarContext'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { useSidebar } from '@/hooks/useSidebar'
import type { ReactNode } from 'react'
import { Breadcrumbs } from '../ui/Breadcrumbs'
import { BreadcrumbProvider } from '../../contexts/BreadcrumbContext'
import { useAppSelector } from '../../store'
import { AIAssistant } from '../ai-assistant/AIAssistant'

import type { AppUser } from '@/models'
import { LoadingOverlay } from '../ui'
import { FlashBanner } from '../banner/flash-banner'
import { useBreadcrumb } from '@/hooks'
import { cn } from '@/lib/utils'

interface LayoutProps {
	children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
	const user = useAppSelector((state) => state.auth.user)

	if (!user) {
		return <LoadingOverlay />
	}

	return (
		<BreadcrumbProvider>
			<SidebarProvider defaultOpen={true}>
				<LayoutContent user={user} children={children} />
			</SidebarProvider>
		</BreadcrumbProvider>
	)
}

function LayoutContent({ user, children }: { user: AppUser; children: ReactNode }) {
	const { isOpen } = useSidebar()
	const sidebarWidth = isOpen ? 'w-50' : 'w-16'
	const mainMargin = isOpen ? 'ml-56' : 'ml-16'

	const { hidden } = useBreadcrumb()
	return (
		<>
			{/* Header fixed at top */}
			<Header user={user} />
			{/* Main layout: sidebar fixed left, content scrollable right */}
			<div
				className={cn(
					'flex w-full bg-gradient-to-br from-gray-50 to-gray-100',
					hidden
						? 'mt-16 h-[calc(100vh-4rem)] overflow-hidden' // WORKSPACE MODE
						: 'mt-16 min-h-screen pt-10' // NORMAL MODE
				)}
			>
				{/* Sidebar fixed to left, below header */}
				<div
					className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-white shadow-lg transition-all duration-300 ${sidebarWidth}`}
				>
					<AppSidebar userRole={user?.role} />
				</div>
				{/* Main content area with left margin for sidebar, responsive to sidebar open/close */}
				<div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${mainMargin}`}>
					{/* Breadcrumbs sticky below header, always visible */}
					{!hidden && (
						<div className='fixed top-16 z-40 w-full border-b bg-gray-50'>
							<div className='mx-auto px-4 py-2'>
								<Breadcrumbs />
							</div>
						</div>
					)}
					<main className='flex flex-1 w-full overflow-hidden'>
						<div className='flex h-full w-full overflow-hidden'>{children}</div>
						<FlashBanner />
					</main>
				</div>
				{/* AI Assistant floating or fixed as needed */}
				<AIAssistant />
			</div>
		</>
	)
}
export { Layout }
