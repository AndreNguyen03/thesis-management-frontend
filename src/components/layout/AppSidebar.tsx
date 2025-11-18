/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSidebar } from '@/hooks/useSidebar'
import {
	BarChart3,
	BookOpen,
	BotMessageSquare,
	ChevronDown,
	ChevronLeft,
	FileText,
	LayoutDashboard,
	Library,
	MessageSquare,
	PlusCircle,
	Search,
	Settings,
	Shield,
	TrendingUp,
	UserCheck,
	Users
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { Role } from '@/models'

interface AppSidebarProps {
	userRole?: Role | undefined
}

type MenuItem = {
	title: string
	url: string
	icon: React.ComponentType<any>
	children?: MenuItem[]
}

const menuItems: Record<Role | 'common' | 'footer', MenuItem[]> = {
	common: [
		{
			title: 'Dashboard',
			url: '/',
			icon: LayoutDashboard
		}
	],
	student: [
		{
			title: 'Danh sách đề tài',
			url: '/topics',
			icon: BookOpen,
			children: [
				{ title: 'Tất cả đề tài', url: '/topics', icon: Library },
				{ title: 'Đề tài đã lưu', url: '/topics/saved', icon: Library },
				{ title: 'Đề tài đã đăng ký', url: '/topics/registered', icon: FileText }
				//{ title: 'Đăng ký đề tài mới', url: '/topics/new-register', icon: FileText }
			]
		},
		{ title: 'Gợi ý đề tài', url: '/suggestions', icon: Search },
		{ title: 'Nhóm của tôi', url: '/my-group', icon: Users },
		{ title: 'Thư viện số', url: '/library', icon: Library },
		{ title: 'Xu hướng đề tài', url: '/trends', icon: TrendingUp }
	],
	lecturer: [
		{ title: 'Đăng đề tài', url: '/create-topic', icon: PlusCircle },
		{ title: 'Quản lý đề tài', url: '/manage-topic', icon: FileText },
		{ title: 'Xét duyệt đăng ký', url: '/approve-registrations', icon: UserCheck },
		{ title: 'Nhóm của tôi', url: '/my-groups', icon: Users },
		{ title: 'Thư viện số', url: '/library', icon: Library },
		{ title: 'Xu hướng đề tài', url: '/trends', icon: TrendingUp },
		{ title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	admin: [
		{ title: 'Quản lý giảng viên', url: '/manage-lecturers', icon: Users },
		{ title: 'Quản lý sinh viên', url: '/manage-students', icon: Users },
		{ title: 'Quản lý AI thông minh', url: '/manage-ai', icon: BotMessageSquare },
		{ title: 'Thống kê & báo cáo', url: '/statistics', icon: BarChart3 },
		{ title: 'Thư viện số', url: '/library', icon: Library },
		{ title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	faculty_board: [
		{ title: 'Quản lý giảng viên khoa', url: '/manage-lecturers', icon: Users },
		{ title: 'Quản lý sinh viên khoa', url: '/manage-students', icon: Users },
		{ title: 'Quản lý đợt đề tài', url: '/manage-period', icon: Users },
		{ title: 'Thống kê & báo cáo', url: '/statistics', icon: BarChart3 },
		{ title: 'Thư viện số', url: '/library', icon: Library },
		{ title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	footer: [{ title: 'Cài đặt', url: '/settings', icon: Settings }]
}

const AppSidebar = ({ userRole = 'admin' }: AppSidebarProps) => {
	const { isOpen, toggleSidebar } = useSidebar()
	const location = useLocation()
	const currentPath = location.pathname
	const [openMenus, setOpenMenus] = useState<string[]>([])

	function isActive(path: string) {
		// Logic chính xác hơn cho active state của sub-item
		if (path === '/' && currentPath === '/') return true
		if (path !== '/' && currentPath === path) return true
		// Nếu path cha là '/thesis' và con là '/thesis/saved', cần so sánh chính xác
		return path !== '/' && currentPath.startsWith(path) && currentPath !== '/topics' && path !== '/thesis'
	}

	const handleMenuClick = (title: string) => {
		setOpenMenus((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
	}

	const renderMenuItems = (items: typeof menuItems.common) => (
		<div className='space-y-1'>
			{items.map((item) => {
				const isSubMenuOpen = openMenus.includes(item.title)
				const isParentActive = item.children ? currentPath.startsWith(item.url) : isActive(item.url)

				if (item.children) {
					return (
						<div key={item.title}>
							<button
								onClick={() => handleMenuClick(item.title)}
								className={`flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-left transition-colors ${
									isParentActive
										? 'border-r-2 border-blue-500 bg-blue-100 font-medium text-blue-800'
										: 'hover:bg-gray-100'
								}`}
							>
								<div className='flex items-center gap-3'>
									<item.icon className='h-4 w-4' />
									{isOpen && <span>{item.title}</span>}
								</div>
								{isOpen && (
									<ChevronDown
										className={`h-4 w-4 transform transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`}
									/>
								)}
							</button>
							{isOpen && isSubMenuOpen && (
								<div className='ml-7 mt-1 space-y-1 border-l pl-3'>
									{item.children.map((sub) => (
										<NavLink
											key={sub.title}
											to={sub.url}
											end={sub.url === '/topics'} // Đảm bảo "Tất cả đề tài" không active khi ở trang con
											className={({ isActive }) =>
												`flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors ${
													isActive
														? 'bg-blue-50 font-semibold text-blue-700'
														: 'text-gray-600 hover:bg-gray-50'
												}`
											}
										>
											<sub.icon className='h-3 w-3' />
											<span>{sub.title}</span>
										</NavLink>
									))}
								</div>
							)}
						</div>
					)
				}

				return (
					<NavLink
						key={item.title}
						to={item.url}
						end={item.url === '/'}
						className={({ isActive }) =>
							`flex items-center gap-3 rounded-md px-3 py-2 text-[13px] transition-colors ${
								isActive
									? 'border-r-2 border-blue-500 bg-blue-100 font-medium text-blue-800'
									: 'hover:bg-gray-100'
							}`
						}
					>
						<item.icon className='h-4 w-4' />
						{isOpen && <span>{item.title}</span>}
					</NavLink>
				)
			})}
		</div>
	)

	return (
		<div className={`border-r border-gray-200 bg-white ${isOpen ? 'w-50' : 'w-16'} transition-all duration-300`}>
			<div
				className={`sticky top-0 h-screen border-r border-gray-200 bg-white ${isOpen ? 'w-fit' : 'w-16'} transition-all duration-300`}
			>
				<div className='px-3 py-4'>
					<Button variant='ghost' size='sm' onClick={toggleSidebar} className='mb-4 w-fit'>
						<ChevronLeft className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
					</Button>

					{/* Main Menu */}
					<div className='mb-6'>
						{isOpen && <div className='mb-2 px-3 text-xs font-semibold text-gray-500'>Tổng quan</div>}
						{renderMenuItems(menuItems.common)}
					</div>

					{/* Role-specific Menu */}
					<div className='mb-6'>
						{isOpen && (
							<div className='mb-2 px-3 text-xs font-semibold text-gray-500'>
								{userRole === 'student' && 'Sinh viên'}
								{userRole === 'lecturer' && 'Giảng viên'}
								{userRole === 'admin' && 'Quản trị'}
								{userRole === 'faculty_board' && 'Ban chủ nhiệm khoa'}
							</div>
						)}
						{renderMenuItems(menuItems[userRole])}
					</div>

					{/* AI Chat */}
					{/* <div className='mb-6'>
						<NavLink
							to='/ai-chat'
							className={({ isActive }) =>
								`flex w-full items-center gap-3 rounded-md border border-blue-200 bg-blue-500 px-3 py-2 text-white transition-colors hover:bg-blue-600 ${
									isActive && 'bg-blue-600'
								} ${isOpen ? '' : 'px-2'}`
							}
						>
							<MessageSquare className='h-4 w-4' />
							{isOpen && <span>Hỏi AI Assistant</span>}
						</NavLink>
					</div> */}

					{/* Footer Menu */}
					<div className='mt-auto'>{renderMenuItems(menuItems.footer)}</div>
				</div>
			</div>
		</div>
	)
}

export { AppSidebar }
