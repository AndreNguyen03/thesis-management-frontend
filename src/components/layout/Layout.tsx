import { SidebarProvider } from '../../contexts/SidebarContext'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { useSidebar } from '@/hooks/useSidebar'
import type { ReactNode } from 'react'
import { Breadcrumbs } from '../ui/Breadcrumbs'
import { BreadcrumbProvider } from '../../contexts/BreadcrumbContext'
import { useAppSelector } from '../../store'
import { AIAssistant } from '../ai-assistant/AIAssistant'

interface LayoutProps {
	children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
	const user = useAppSelector((state) => state.auth.user)
	return (
		<BreadcrumbProvider>
			<SidebarProvider defaultOpen={true}>
				<LayoutContent user={user} children={children} />
			</SidebarProvider>
		</BreadcrumbProvider>
	)
}

function LayoutContent({ user, children }: { user: any; children: ReactNode }) {
	const { isOpen } = useSidebar()
	const sidebarWidth = isOpen ? 'w-64' : 'w-16'
	const mainMargin = isOpen ? 'ml-64' : 'ml-16'
	return (
		<>
			{/* Header fixed at top */}
			<Header user={user} />
			{/* Main layout: sidebar fixed left, content scrollable right */}
			<div className='flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100 pt-16'>
				{/* Sidebar fixed to left, below header */}
				<div
					className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-white shadow-lg transition-all duration-300 ${sidebarWidth}`}
				>
					<AppSidebar userRole={user?.role} />
				</div>
				{/* Main content area with left margin for sidebar, responsive to sidebar open/close */}
				<div className={`flex flex-1 flex-col overflow-hidden transition-all duration-300 ${mainMargin}`}>
					{/* Breadcrumbs sticky below header, always visible */}
					<div className='fixed top-16 z-30 w-full border-b bg-gray-50'>
						<div className='container mx-auto px-4 py-2'>
							<Breadcrumbs />
						</div>
					</div>
					<main className='min-h-[calc(100vh)] flex-1 overflow-y-auto'>
						<div className='px-4 py-2'>{children}</div>
					</main>
					<footer className='z-20 border-t bg-white py-2'>
						<div className='container mx-auto px-4 text-center text-sm text-gray-500'>
							© 2024 UIT Thesis Management System. All rights reserved.
						</div>
					</footer>
				</div>
				{/* AI Assistant floating or fixed as needed */}
				<AIAssistant />
			</div>
		</>
	)
}
export { Layout }
