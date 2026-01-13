import { SidebarProvider } from '../../contexts/SidebarContext'
import { AppSidebar } from './AppSidebar'
import { Header } from './Header'
import { useSidebar } from '@/hooks/useSidebar'
import { useState, type ReactNode } from 'react'
import { Breadcrumbs } from '../ui/Breadcrumbs'
import { BreadcrumbProvider } from '../../contexts/BreadcrumbContext'
import { useAppSelector } from '../../store'
import { useLocation } from 'react-router-dom'

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
	const sidebarWidth = isOpen ? 'w-56' : 'w-16'
	const [openAI, setOpenAI] = useState(true)
	const { hidden } = useBreadcrumb()
	const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
	const [mobileSidebarVisible, setMobileSidebarVisible] = useState(false)

	// Hiệu ứng slide out: delay đóng overlay sau khi sidebar trượt ra ngoài
	const handleOpenMobileSidebar = () => {
		setMobileSidebarVisible(true)
		setTimeout(() => setMobileSidebarOpen(true), 10) // Đảm bảo CSS transition hoạt động
	}
	const handleCloseMobileSidebar = () => {
		setMobileSidebarOpen(false)
		setTimeout(() => setMobileSidebarVisible(false), 300) // Trùng với duration-300
	}

	const location = useLocation()
	return (
		<>
			{/* Header fixed at top */}
			<Header user={user} onOpenAI={() => setOpenAI(true)} onMobileSidebarOpen={handleOpenMobileSidebar} />
			{/* Sidebar overlay cho mobile với hiệu ứng slide */}
			{mobileSidebarVisible && (
				<div className='fixed inset-0 z-50 bg-black/40 lg:hidden' onClick={handleCloseMobileSidebar}>
					<div
						className={`absolute left-0 top-0 h-full w-56 bg-white shadow-lg transition-transform duration-300 ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
						onClick={(e) => e.stopPropagation()}
					>
						<AppSidebar userRole={user?.role} isMobile />
					</div>
				</div>
			)}
			{/* Main layout: sidebar fixed left, content scrollable right */}
			<div
				className={cn(
					'flex w-full bg-[#fafafa] selection:bg-blue-100 selection:text-blue-900',
					hidden
						? 'mt-16 h-[calc(100vh-4rem)] overflow-hidden' // WORKSPACE MODE
						: 'mt-20 h-[calc(100vh-6rem)]' // NORMAL MODE
				)}
			>
				{/* Sidebar fixed to left, below header */}
				<div
					className={cn(
						'fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] border-r bg-white shadow-lg transition-all duration-300',
						'hidden lg:block',
						sidebarWidth
					)}
				>
					<AppSidebar userRole={user?.role} />
				</div>
				{/* Main content area with left margin for sidebar, responsive to sidebar open/close */}
				<div
					className={cn(
						'flex flex-1 flex-col overflow-hidden transition-all duration-300',
						'lg:ml-16',
						isOpen && 'lg:ml-56'
					)}
				>
					{/* Breadcrumbs sticky below header, always visible */}
					{!hidden && (
						<div className='fixed top-16 z-40 w-full border-b bg-gray-50'>
							<div className='mx-auto px-4 py-2'>
								<Breadcrumbs />
							</div>
						</div>
					)}
					<main className='flex w-full flex-1 overflow-auto'>
						<div className='flex h-full w-full'>{children}</div>
						<FlashBanner />
					</main>
				</div>
		
			</div>
		</>
	)
}
export { Layout }
