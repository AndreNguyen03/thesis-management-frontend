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
	MessageCircle,
	Search,
	Settings,
	UserCheck,
	Users
} from 'lucide-react'
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { Role } from '@/models'
import { useChat } from '@/hooks'

interface AppSidebarProps {
	userRole?: Role | undefined
}

type MenuItem = {
	title: string
	url: string
	icon: React.ComponentType<any>
	children?: MenuItem[]
}

const menuItems: Record<Role | 'common' | 'footer' | 'chung', MenuItem[]> = {
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
		{ title: 'Đợt đăng ký', url: '/registration', icon: Search },
		{ title: 'Nhóm của tôi', url: '/group-workspace', icon: Users }
		// { title: 'Xu hướng đề tài', url: '/trends', icon: TrendingUp },
		// { title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	admin: [
		{ title: 'Quản lý giảng viên', url: '/manage-lecturers', icon: Users },
		{ title: 'Quản lý sinh viên', url: '/manage-students', icon: Users },
		{ title: 'Quản lý AI thông minh', url: '/manage-ai', icon: BotMessageSquare },
		{ title: 'Thống kê & báo cáo', url: '/statistics', icon: BarChart3 }
		// { title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	faculty_board: [
		{ title: 'Quản lý giảng viên khoa', url: '/manage-faculty-lecturers', icon: Users },
		{ title: 'Quản lý sinh viên khoa', url: '/manage-faculty-students', icon: Users },
		{ title: 'Quản lý đợt đề tài', url: '/manage-period', icon: Users },
		{ title: 'Thống kê & báo cáo', url: '/statistics', icon: BarChart3 }
		// { title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	footer: [{ title: 'Cài đặt', url: '/settings', icon: Settings }]
}

const AppSidebar = ({ userRole = 'admin' }: AppSidebarProps) => {
	const { isOpen, toggleSidebar } = useSidebar()
	const location = useLocation()
	const currentPath = location.pathname
	const [openMenus, setOpenMenus] = useState<string[]>([])

	const { hasUnreadDirect } = useChat()
	console.log('has unread direct at sidebar :::', hasUnreadDirect)
	function isActive(path: string) {
		if (path === '/' && currentPath === '/') return true
		if (path !== '/' && currentPath === path) return true
		return path !== '/' && currentPath.startsWith(path) && currentPath !== '/topics' && path !== '/thesis'
	}

	const handleMenuClick = (title: string) => {
		setOpenMenus((prev) => (prev.includes(title) ? prev.filter((t) => t !== title) : [...prev, title]))
	}

	// const handlePeriodInfo = (periodInfo: MenuItem[]) => {
	// 	if (!currentPeriod) return periodInfo

	// 	const typeLabels = { thesis: 'Khóa luận', scientific_research: 'Nghiên cứu khoa học' } as const
	// 	const title = `Kì hiện tại: ${currentPeriod.year} • HK ${currentPeriod.semester} • ${typeLabels[currentPeriod.type]}`

	// 	return [{ ...periodInfo[0], title, url: `/period/${currentPeriod?._id ?? ''}`, icon: BookOpen }]
	// }

	const renderMenuItems = (items: typeof menuItems.common) => (
		<div className='max-w-48 space-y-0.5'>
			{items.map((item) => {
				const isSubMenuOpen = openMenus.includes(item.title)
				const isParentActive = item.children ? currentPath.startsWith(item.url) : isActive(item.url)

				if (item.children) {
					return (
						<div key={item.title}>
							<button
								onClick={() => handleMenuClick(item.title)}
								className={`flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left transition-colors ${
									isParentActive
										? 'border-r-2 border-blue-500 bg-blue-100 font-medium text-blue-800'
										: 'hover:bg-gray-100'
								}`}
							>
								<div className='relative flex items-center gap-2'>
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
								<div className='ml-5 mt-0.5 space-y-0.5 border-l pl-2'>
									{item.children.map((sub) => (
										<NavLink
											key={sub.title}
											to={sub.url}
											end={sub.url === '/topics'}
											className={({ isActive }) =>
												`flex items-center gap-1.5 rounded px-1.5 py-0.5 text-sm transition-colors ${
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
							`flex items-center gap-2 rounded-md px-2 py-1.5 text-[13px] transition-colors ${
								isActive
									? 'border-r-2 border-blue-500 bg-blue-100 font-medium text-blue-800'
									: 'hover:bg-gray-100'
							}`
						}
					>
						<div className='relative'>
							<item.icon className='h-4 w-4' />

							{/* 🔴 UNREAD DIRECT INDICATOR */}
							{item.url === '/chat' && hasUnreadDirect && (
								<span className='absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white' />
							)}
						</div>

						{isOpen && <span>{item.title}</span>}
					</NavLink>
				)
			})}
		</div>
	)

	return (
		<div className='flex h-full flex-col px-2 py-1'>
			<Button variant='ghost' size='sm' onClick={toggleSidebar} className='mb-3 w-fit'>
				<ChevronLeft className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-0' : 'rotate-180'}`} />
			</Button>

			{/* Main Menu */}
			<div className='mb-4 flex flex-col gap-0.5'>
				{isOpen && <div className='mb-1 px-2 text-xs font-semibold text-gray-500'>Tổng quan</div>}
				{renderMenuItems(menuItems.common)}
			</div>

			{/* Role Menu */}
			<div className='mb-4'>
				{isOpen && (
					<div className='mb-1 px-2 text-xs font-semibold text-gray-500'>
						{userRole === 'student' && 'Sinh viên'}
						{userRole === 'lecturer' && 'Giảng viên'}
						{userRole === 'admin' && 'Quản trị'}
						{userRole === 'faculty_board' && 'Ban chủ nhiệm khoa'}
					</div>
				)}
				{renderMenuItems(menuItems[userRole])}
			</div>
			<div className='mb-4'>
				{isOpen && <div className='mb-1 px-2 text-xs font-semibold text-gray-500'>Chung</div>}
				{renderMenuItems(menuItems.chung)}
			</div>

			{/* Footer Menu */}
			<div className='mt-auto'>{renderMenuItems(menuItems.footer)}</div>
		</div>
	)
}

export { AppSidebar }
