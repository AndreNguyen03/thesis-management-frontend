import { SidebarProvider } from '../../contexts/SidebarContext'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import type { ReactNode } from 'react'
import type { User } from 'models'

interface LayoutProps {
	children: ReactNode
	user: User | null
}

const Layout = ({ children, user }: LayoutProps) => {
	return (
		<SidebarProvider defaultOpen={true}>
			<div className='flex min-h-screen w-full bg-gradient-to-br from-gray-50 to-gray-100'>
				<AppSidebar userRole={user?.role} />
				<div className='flex flex-1 flex-col overflow-hidden'>
					<Header user={user} />
					<main
						className='flex-1 overflow-y-auto'
						style={{
							height: 'calc(100vh - 64px)' // 64px là chiều cao header (h-16)
						}}
					>
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
	)
}

export { Layout }
