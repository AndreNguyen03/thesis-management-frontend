import { SidebarProvider } from '../../contexts/SidebarContext'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import type { ReactNode } from 'react'
import { Breadcrumbs } from '../ui/Breadcrumbs'
import { BreadcrumbProvider } from '../../contexts/BreadcrumbContext'
import { useAppSelector } from '../../store'

interface LayoutProps {
	children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
	const user = useAppSelector((state) => state.auth.user)
	return (
		<BreadcrumbProvider>
			<SidebarProvider defaultOpen={true}>
				<div className='flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100'>
					<AppSidebar userRole={user?.role} />
					<div className='flex flex-1 flex-col overflow-hidden'>
						<Header user={user} />
						<div className='border-b bg-gray-50'>
							<div className='container mx-auto px-4 py-2'>
								<Breadcrumbs />
							</div>
						</div>
						<main className='flex-1 overflow-y-auto'>
							<div className='container mx-auto px-4 py-6'>{children}</div>
						</main>
						<footer className='border-t bg-white/50 py-4'>
							<div className='container mx-auto px-4 text-center text-sm text-gray-500'>
								© 2024 UIT Thesis Management System. All rights reserved.
							</div>
						</footer>
					</div>
					<div>{/* Placeholder for AIAssistant component */}</div>
				</div>
			</SidebarProvider>
		</BreadcrumbProvider>
	)
}

export { Layout }
