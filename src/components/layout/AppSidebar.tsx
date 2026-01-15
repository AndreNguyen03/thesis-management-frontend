/* eslint-disable @typescript-eslint/no-explicit-any */
import { useSidebar } from '@/hooks/useSidebar'
import {
	BarChart3,
	BookOpen,
	BotMessageSquare,
	ChevronDown,
	ChevronLeft,
	ClipboardCheck,
	FileText,
	LayoutDashboard,
	Library,
	MessageCircle,
	Search,
	UserCheck,
	Users
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { Role } from '@/models'
import { useChat } from '@/hooks'
import { cn } from '@/lib/utils'
import { useAppSelector } from '@/store'
import { getUserIdFromAppUser } from '@/utils/utils'

interface AppSidebarProps {
	userRole?: Role | undefined
	isMobile?: boolean
}

type MenuItem = {
	title: string
	url: string
	icon: React.ComponentType<any>
	children?: MenuItem[]
}

const menuItems: Record<Role | 'common' | 'chung', MenuItem[]> = {
	common: [{ title: 'Dashboard', url: '/', icon: LayoutDashboard }],
	chung: [
		{ title: 'Liên hệ', url: '/chat', icon: MessageCircle },
		{ title: 'Thư viện số', url: '/library', icon: Library }
	],
	student: [
		{
			title: 'Danh sách đề tài',
			url: '/topics',
			icon: BookOpen,
			children: [
				{ title: 'Đề tài đã lưu', url: '/topics/saved', icon: Library },
				{ title: 'Đề tài đã đăng ký', url: '/topics/registered', icon: FileText }
			]
		},
		{ title: 'Đăng kí đề tài', url: '/registration', icon: Search },
		{ title: 'Nhóm của tôi', url: '/group-workspace', icon: Users }
		// { title: 'Xu hướng đề tài', url: '/trends', icon: TrendingUp }
	],
	lecturer: [
		//{ title: 'Đăng đề tài', url: '/create-topic', icon: PlusCircle },
		{ title: 'Quản lý đề tài', url: '/manage-topics', icon: FileText },
		{ title: 'Xét duyệt đăng ký', url: '/approve-registrations', icon: UserCheck },
		{ title: 'Chấm điểm', url: '/lecturer/defense-milestones', icon: ClipboardCheck }, // Route riêng cho giảng viên
		{ title: 'Đợt đăng ký', url: '/registration', icon: Search },
		{ title: 'Nhóm của tôi', url: '/group-workspace', icon: Users }
		// { title: 'Xu hướng đề tài', url: '/trends', icon: TrendingUp },
		// { title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	admin: [
		{ title: 'Quản lý giảng viên', url: '/manage-lecturers', icon: Users },
		{ title: 'Quản lý sinh viên', url: '/manage-students', icon: Users },
		{ title: 'Quản lý thư viện số', url: '/manage-library', icon: Library },
		{ title: 'Quản lý AI thông minh', url: '/manage-ai', icon: BotMessageSquare },
		{ title: 'Quản lý Concept', url: '/manage-concept', icon: BookOpen },
		// { title: 'Thống kê & báo cáo', url: '/statistics', icon: BarChart3 }
		// { title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	faculty_board: [
		{ title: 'Quản lý giảng viên khoa', url: '/manage-faculty-lecturers', icon: Users },
		{ title: 'Quản lý sinh viên khoa', url: '/manage-faculty-students', icon: Users },
		{ title: 'Quản lý đợt đăng ký', url: '/manage-period', icon: Users },
		{ title: 'Quản lý đợt bảo vệ', url: '/faculty/defense-milestones', icon: ClipboardCheck }, // Route riêng cho BCN
		{ title: 'Thống kê & báo cáo', url: '/statistics', icon: BarChart3 }
		// { title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	]
	// footer: [{ title: 'Cài đặt', url: '/settings', icon: Settings }]
}
const AppSidebar = ({ userRole = 'admin', isMobile = false }: AppSidebarProps) => {
	const { isOpen, toggleSidebar } = useSidebar()
	const location = useLocation()
	const currentPath = location.pathname
	const [openMenus, setOpenMenus] = useState<string[]>([])
	const { hasUnreadDirect, messagesByGroup, groupSidebars } = useChat()
	const user = useAppSelector((state) => state.auth.user)
	const userId = getUserIdFromAppUser(user)

	// Kiểm tra tin nhắn chưa đọc cho tất cả group workspace
	const hasUnreadGroup = useMemo(() => {
		if (!messagesByGroup || !groupSidebars.length) return false
		return groupSidebars.some((group) => {
			const msgs = messagesByGroup[group._id] ?? []
			return msgs.some((m) => m.senderId !== userId && (!m.lastSeenAtByUser || !m.lastSeenAtByUser[userId]))
		})
	}, [messagesByGroup, groupSidebars, userId])

	function isActive(path: string) {
		if (path === '/' && currentPath === '/') return true
		if (path !== '/' && currentPath === path) return true
		return path !== '/' && currentPath.startsWith(path) && currentPath !== '/topics' && path !== '/thesis'
	}

	const handleMenuClick = (title: string) => {
		setOpenMenus((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
	}

	const renderMenuItems = (items: typeof menuItems.common) => (
		<div className='space-y-1 px-3'>
			{items.map((item) => {
				const isSubMenuOpen = openMenus.includes(item.title)
				const isParentActive = item.children ? currentPath.startsWith(item.url) : isActive(item.url)

				// Render Parent Item with Children
				if (item.children) {
					return (
						<div key={item.title} className='group'>
							<button
								onClick={() => handleMenuClick(item.title)}
								className={cn(
									'flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
									isParentActive
										? 'bg-gray-100 text-gray-900' // Active style nhẹ nhàng hơn (xám nhạt thay vì xanh đậm)
										: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
								)}
							>
								<div className='flex items-center gap-3'>
									<item.icon
										className={cn('h-4 w-4', isParentActive ? 'text-blue-600' : 'text-gray-500')}
									/>
									{isOpen && <span>{item.title}</span>}
								</div>
								{isOpen && (
									<ChevronDown
										className={`h-3.5 w-3.5 text-gray-400 transition-transform duration-200 ${isSubMenuOpen ? 'rotate-180' : ''}`}
									/>
								)}
							</button>

							{/* Submenu */}
							{isOpen && isSubMenuOpen && (
								<div className='ml-5 mt-1 space-y-0.5 border-l border-gray-100 pl-2'>
									{item.children.map((sub) => (
										<NavLink
											key={sub.title}
											to={sub.url}
											end={sub.url === '/topics'}
											className={({ isActive }) =>
												cn(
													'flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors',
													isActive
														? 'bg-blue-50 font-medium text-blue-600' // Submenu active: Xanh rất nhạt
														: 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
												)
											}
										>
											<span>{sub.title}</span>
										</NavLink>
									))}
								</div>
							)}
						</div>
					)
				}

				// Render Single Item
				return (
					<NavLink
						key={item.title}
						to={item.url}
						end={item.url === '/'}
						className={({ isActive }) =>
							cn(
								'group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
								isActive
									? 'bg-gray-100 text-gray-900' // Active style: Nền xám nhạt, chữ đen
									: 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
							)
						}
					>
						<div className='relative'>
							<item.icon
								className={cn(
									'h-4 w-4 transition-colors',
									isActive(item.url) ? 'text-blue-600' : 'text-gray-500'
								)}
							/>
							{item.url === '/chat' && hasUnreadDirect && (
								<span className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white' />
							)}
							{item.url === '/group-workspace' && hasUnreadGroup && (
								<span className='absolute -right-1 -top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white' />
							)}
						</div>
						{isOpen && <span>{item.title}</span>}

						{/* Active Indicator Bar bên trái (Optional) */}
						{isActive(item.url) && (
							<div className='absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-blue-600' />
						)}
					</NavLink>
				)
			})}
		</div>
	)

	return (
		<div className={cn('flex h-full flex-col py-3', isMobile && 'h-full w-56')}>
			{' '}
			{/* Header Sidebar (Toggle) */}
			{!isMobile && (
				<div className={cn('mb-6 flex items-center px-4', isOpen ? 'justify-end' : 'justify-center')}>
					<Button
						variant='ghost'
						size='sm'
						onClick={toggleSidebar}
						className='h-8 w-8 rounded-full p-0 text-gray-500 hover:bg-gray-100'
					>
						<ChevronLeft
							className={`h-4 w-4 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`}
						/>
					</Button>
				</div>
			)}
			{/* Menu Sections */}
			<div className='custom-scrollbar flex-1 space-y-6 overflow-y-auto'>
				{userRole !== 'admin' && (
					<div>
						{isOpen && (
							<div className='mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400'>
								Tổng quan
							</div>
						)}
						{renderMenuItems(menuItems.common)}
					</div>
				)}

				<div>
					{isOpen && (
						<div className='mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400'>
							{userRole === 'student' && 'Sinh viên'}
							{userRole === 'lecturer' && 'Giảng viên'}
							{userRole === 'admin' && 'Quản trị'}
							{userRole === 'faculty_board' && 'Ban chủ nhiệm'}
						</div>
					)}
					{renderMenuItems(menuItems[userRole])}
				</div>

				<div>
					{isOpen && (
						<div className='mb-2 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-400'>
							Tiện ích
						</div>
					)}
					{renderMenuItems(menuItems.chung)}
				</div>
			</div>
			{/* Footer
			<div className='mt-auto border-t border-gray-100 pt-3'>{renderMenuItems(menuItems.footer)}</div> */}
		</div>
	)
}

export { AppSidebar }
