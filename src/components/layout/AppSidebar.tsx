import { useSidebar } from '@/hooks/useSidebar'
import {
	BarChart3,
	BookOpen,
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
import { NavLink, useLocation } from 'react-router-dom'
import { Button } from '../ui/Button'
import type { Role } from 'models'

interface AppSidebarProps {
	userRole?: Role | undefined
}
type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<any>;
  children?: MenuItem[]; // Thêm dòng này
};

const menuItems: {
  common: MenuItem[];
  student: MenuItem[];
  lecturer: MenuItem[];
  admin: MenuItem[];
  footer: MenuItem[];
} = {
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
			url: '/thesis',
			icon: BookOpen,
			children: [
				{ title: 'Tất cả đề tài', url: '/thesis', icon: Library },
				{ title: 'Đề tài đã lưu', url: '/thesis/saved', icon: Library },
				{ title: 'Đề tài đã đăng ký', url: '/thesis/registered', icon: FileText }
			]
		},
		{ title: 'Gợi ý đề tài', url: '/suggestions', icon: Search },
		{ title: 'Nhóm của tôi', url: '/my-group', icon: Users },
		{ title: 'Thư viện số', url: '/library', icon: Library },
		{ title: 'Xu hướng đề tài', url: '/trends', icon: TrendingUp }
	],
	lecturer: [
		{ title: 'Đăng đề tài', url: '/create-thesis', icon: PlusCircle },
		{ title: 'Quản lý đề tài', url: '/manage-thesis', icon: FileText },
		{ title: 'Xét duyệt đăng ký', url: '/approve-registrations', icon: UserCheck },
		{ title: 'Nhóm của tôi', url: '/my-groups', icon: Users },
		{ title: 'Thư viện số', url: '/library', icon: Library },
		{ title: 'Xu hướng đề tài', url: '/trends', icon: TrendingUp },
		{ title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	admin: [
		{ title: 'Quản lý tài khoản', url: '/manage-accounts', icon: Users },
		{ title: 'Thống kê & báo cáo', url: '/statistics', icon: BarChart3 },
		{ title: 'Thư viện số', url: '/library', icon: Library },
		{ title: 'Kiểm tra đạo văn', url: '/plagiarism-check', icon: Shield }
	],
	footer: [{ title: 'Cài đặt', url: '/settings', icon: Settings }]
}

const AppSidebar = ({ userRole = 'student' }: AppSidebarProps) => {
	const { isOpen, toggleSidebar } = useSidebar()
	const location = useLocation()
	const currentPath = location.pathname

	function isActive(path: string) {
		if (path === '/' && currentPath === '/') return true
		return path !== '/' && currentPath.startsWith(path)
	}

	const renderMenuItems = (items: typeof menuItems.common) => (
		<div className='space-y-1'>
			{items.map((item) => (
				<div key={item.title}>
					<NavLink
						to={item.url}
						className={() =>
							`flex items-center gap-3 rounded-md px-3 py-2 transition-colors ${
								isActive(item.url)
									? 'border-r-2 border-blue-500 bg-blue-100 font-medium text-blue-800'
									: 'hover:bg-gray-100'
							}`
						}
					>
						<item.icon className='h-4 w-4' />
						{isOpen && <span>{item.title}</span>}
					</NavLink>
					{/* Hiển thị submenu nếu có */}
					{isOpen && item.children && (
						<div className='ml-8 space-y-1'>
							{item.children.map((sub) => (
								<NavLink
									key={sub.title}
									to={sub.url}
									className={() =>
										`flex items-center gap-2 rounded px-2 py-1 text-sm transition-colors ${
											isActive(sub.url)
												? 'bg-blue-50 font-semibold text-blue-700'
												: 'hover:bg-gray-50'
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
			))}
		</div>
	)

	return (
		<div className={`border-r border-gray-200 bg-white ${isOpen ? 'w-50' : 'w-16'} transition-all duration-300`}>
			<div
				className={`sticky top-0 h-screen border-r border-gray-200 bg-white ${isOpen ? 'w-64' : 'w-16'} transition-all duration-300`}
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
							</div>
						)}
						{renderMenuItems(menuItems[userRole])}
					</div>

					{/* AI Chat */}
					<div className='mb-6'>
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
					</div>

					{/* Footer Menu */}
					<div className='mt-auto'>{renderMenuItems(menuItems.footer)}</div>
				</div>
			</div>
		</div>
	)
}

export { AppSidebar }
